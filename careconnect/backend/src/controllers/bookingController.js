import Booking from '../models/Booking.js';
import Caregiver from '../models/Caregiver.js';
import {
  isCaregiverAvailable,
  addBookedDate,
  removeBookedDate
} from '../utils/availabilityHelper.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { caregiver, startDate, endDate, startTime, endTime } = req.body;

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
      client: req.user.id
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
    const bookings = await Booking.find({})
      .populate('client', 'name email phone')
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
    const booking = await Booking.findById(req.params.id)
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

    // If booking was confirmed, remove it from caregiver's booked dates
    if (booking.status === 'confirmed') {
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
    // Get caregiver ID from the user
    const caregiver = await Caregiver.findOne({ user: req.user.id || req.user._id });
    
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver profile not found'
      });
    }

    const bookings = await Booking.find({ caregiver: caregiver._id })
      .populate('client', 'name email phone')
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
    const Review = (await import('../models/Review.js')).default;
    
    const bookings = await Booking.find({ client: req.user.id })
      .populate('client', 'name email phone')
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

