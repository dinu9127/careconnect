import Booking from '../models/Booking.js';
import Caregiver from '../models/Caregiver.js';
import User from '../models/User.js';
import {
  isCaregiverAvailable,
  addBookedDate,
  removeBookedDate
} from '../utils/availabilityHelper.js';

const clientProfileSelection = 'name email phone address careReceiverName careReceiverRelationship specialNotes geoLocation';
const CAREGIVER_RESPONSE_WINDOW_MS = 5 * 60 * 1000;
const AUTO_CANCELLATION_REASON = 'Auto-cancelled: caregiver did not respond within 5 minutes';

const buildPendingExpiryQuery = (now = new Date()) => ({
  status: 'pending',
  $or: [
    { responseDeadline: { $lte: now } },
    {
      responseDeadline: { $exists: false },
      createdAt: { $lte: new Date(now.getTime() - CAREGIVER_RESPONSE_WINDOW_MS) }
    }
  ]
});

const getEffectiveResponseDeadline = (booking) => {
  if (booking?.responseDeadline) {
    return new Date(booking.responseDeadline);
  }

  if (booking?.createdAt) {
    return new Date(new Date(booking.createdAt).getTime() + CAREGIVER_RESPONSE_WINDOW_MS);
  }

  return new Date(Date.now() + CAREGIVER_RESPONSE_WINDOW_MS);
};

const isPendingBookingExpired = (booking, now = new Date()) => {
  if (!booking || booking.status !== 'pending') {
    return false;
  }

  return getEffectiveResponseDeadline(booking).getTime() <= now.getTime();
};

const autoCancelSingleBooking = async (booking) => {
  const caregiver = await Caregiver.findById(booking.caregiver);
  if (caregiver) {
    removeBookedDate(caregiver, booking._id);
    await caregiver.save();
  }

  await Booking.findByIdAndUpdate(
    booking._id,
    {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: 'system',
      cancellationReason: AUTO_CANCELLATION_REASON
    },
    { new: false }
  );
};

export const autoCancelExpiredPendingBookings = async () => {
  const now = new Date();
  const expiredBookings = await Booking.find(buildPendingExpiryQuery(now));

  for (const booking of expiredBookings) {
    await autoCancelSingleBooking(booking);
  }

  return expiredBookings.length;
};

const getMissingClientProfileFields = (user) => {
  const missingFields = [];

  if (!user?.name?.trim()) missingFields.push('full name');
  if (!user?.phone?.trim()) missingFields.push('phone number');
  if (!user?.address?.trim()) missingFields.push('address');
  if (!user?.careReceiverName?.trim()) missingFields.push("care receiver's name");
  if (!user?.careReceiverRelationship?.trim()) missingFields.push('relationship to care receiver');
  if (!Array.isArray(user?.geoLocation?.coordinates) || user.geoLocation.coordinates.length !== 2) {
    missingFields.push('map location');
  }

  return missingFields;
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { caregiver, startDate, endDate, startTime, endTime } = req.body;

    const client = await User.findById(req.user.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }

    const missingFields = getMissingClientProfileFields(client);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please complete your profile before booking. Missing: ${missingFields.join(', ')}.`,
        missingFields
      });
    }

    // Check if caregiver exists
    const caregiverData = await Caregiver.findById(caregiver);
    if (!caregiverData) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    // Check availability
    const availabilityCheck = isCaregiverAvailable(caregiverData, startDate, endDate, startTime, endTime);
    if (!availabilityCheck.available) {
      return res.status(400).json({
        success: false,
        message: availabilityCheck.reason || 'Caregiver is not available for the requested dates/times'
      });
    }

    const booking = await Booking.create({
      ...req.body,
      client: req.user.id,
      responseDeadline: new Date(Date.now() + CAREGIVER_RESPONSE_WINDOW_MS)
    });
    
    // Add booked date to caregiver's schedule
    addBookedDate(caregiverData, booking);
    await caregiverData.save();
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    await autoCancelExpiredPendingBookings();

    const bookings = await Booking.find({})
      .populate('client', clientProfileSelection)
      .populate({
        path: 'caregiver',
        populate: { path: 'user', select: 'name email phone' }
      });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    await autoCancelExpiredPendingBookings();

    const booking = await Booking.findById(req.params.id)
      .populate('client', clientProfileSelection)
      .populate({
        path: 'caregiver',
        populate: { path: 'user', select: 'name email phone' }
      });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req, res) => {
  try {
    await autoCancelExpiredPendingBookings();

    const { status } = req.body;
    const isCaregiverUser = req.user?.role === 'caregiver';
    const cancellationReason = req.body.cancellationReason || req.body.reason || '';
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (isPendingBookingExpired(booking)) {
      await autoCancelSingleBooking(booking);
      return res.status(410).json({
        success: false,
        message: AUTO_CANCELLATION_REASON
      });
    }

    const updateData = { ...req.body };

    // Handle booking confirmation
    if (status === 'confirmed' && booking.status !== 'confirmed') {
      const caregiver = await Caregiver.findById(booking.caregiver);
      if (!caregiver) {
        return res.status(404).json({
          success: false,
          message: 'Caregiver not found'
        });
      }

      // Add the booked dates to caregiver's schedule
      const alreadyBooked = caregiver.bookedDates.some(bd => bd.bookingId.toString() === booking._id.toString());
      if (!alreadyBooked) {
        addBookedDate(caregiver, booking);
      }
      await caregiver.save();

      updateData.confirmedAt = new Date();
    }

    if (status === 'cancelled' && booking.status !== 'cancelled') {
      if (isCaregiverUser && booking.status === 'confirmed') {
        if (!cancellationReason.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Cancellation reason is required for caregivers after confirmation'
          });
        }

        const confirmationTime = booking.confirmedAt || booking.updatedAt || booking.createdAt;
        if (confirmationTime && Date.now() - new Date(confirmationTime).getTime() > 60 * 60 * 1000) {
          return res.status(403).json({
            success: false,
            message: 'Caregivers can only cancel confirmed bookings within one hour of confirmation'
          });
        }
      }

      updateData.cancelledAt = new Date();
      updateData.cancelledBy = req.user?.role || 'unknown';
      if (cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
    }

    // Handle status change from confirmed to other status (e.g., cancellation)
    if (booking.status === 'confirmed' && status !== 'confirmed') {
      const caregiver = await Caregiver.findById(booking.caregiver);
      if (caregiver) {
        removeBookedDate(caregiver, booking._id);
        await caregiver.save();
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    await autoCancelExpiredPendingBookings();

    const booking = await Booking.findById(req.params.id);
    const isCaregiverUser = req.user?.role === 'caregiver';
    const cancellationReason =
      req.body?.cancellationReason ||
      req.body?.reason ||
      req.query?.cancellationReason ||
      req.query?.reason ||
      '';
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (isCaregiverUser && booking.status === 'confirmed') {
      if (!cancellationReason.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation reason is required for caregivers after confirmation'
        });
      }

      const confirmationTime = booking.confirmedAt || booking.updatedAt || booking.createdAt;
      if (confirmationTime && Date.now() - new Date(confirmationTime).getTime() > 60 * 60 * 1000) {
        return res.status(403).json({
          success: false,
          message: 'Caregivers can only cancel confirmed bookings within one hour of confirmation'
        });
      }
    }

    // Remove booking slot reservation from caregiver schedule
    if (booking.status !== 'cancelled') {
      const caregiver = await Caregiver.findById(booking.caregiver);
      if (caregiver) {
        removeBookedDate(caregiver, booking._id);
        await caregiver.save();
      }
    }

    // Update booking status to cancelled
    const cancelledBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: req.user?.role || 'unknown',
        cancellationReason: cancellationReason || ''
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: cancelledBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private
export const updatePayment = async (req, res) => {
  try {
    const { paymentMethod, paymentStatus, bankSlipUrl, transactionId } = req.body;
    
    const updateData = {
      paymentMethod,
      paymentStatus,
      paymentDate: paymentStatus === 'paid' ? new Date() : null
    };

    if (bankSlipUrl) {
      updateData.bankSlipUrl = bankSlipUrl;
    }

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('client', 'name email phone')
      .populate({
        path: 'caregiver',
        populate: { path: 'user', select: 'name email phone' }
      });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get caregiver bookings
// @route   GET /api/bookings/caregiver-bookings
// @access  Private
export const getCaregiverBookings = async (req, res) => {
  try {
    await autoCancelExpiredPendingBookings();

    // Get caregiver ID from the user
    const caregiver = await Caregiver.findOne({ user: req.user.id || req.user._id });
    
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver profile not found'
      });
    }

    const bookings = await Booking.find({ caregiver: caregiver._id })
      .populate('client', clientProfileSelection)
      .populate({
        path: 'caregiver',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ startDate: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get client bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getClientBookings = async (req, res) => {
  try {
    await autoCancelExpiredPendingBookings();

    const Review = (await import('../models/Review.js')).default;
    
    const bookings = await Booking.find({ client: req.user.id })
      .populate('client', clientProfileSelection)
      .populate({
        path: 'caregiver',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });
    
    // Check if each booking has a review
    const bookingsWithReviewStatus = await Promise.all(
      bookings.map(async (booking) => {
        const review = await Review.findOne({ booking: booking._id });
        return {
          ...booking.toObject(),
          hasReview: !!review
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: bookingsWithReviewStatus.length,
      data: bookingsWithReviewStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

