import Complaint from '../models/Complaint.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

// Submit a new complaint
export const submitComplaint = async (req, res) => {
  try {
    const { caregiverId, caregiverName, bookingId, title, description, category, severity } = req.body;
    const clientId = req.user.id;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category'
      });
    }

    // If booking ID is provided, verify it exists
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
    }

    const complaint = new Complaint({
      clientId,
      caregiverId: caregiverId || null,
      caregiverName: caregiverName || '',
      bookingId: bookingId || null,
      title,
      description,
      category,
      severity: severity || 'medium'
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting complaint',
      error: error.message
    });
  }
};

// Get client's complaints
export const getClientComplaints = async (req, res) => {
  try {
    const clientId = req.user.id;

    const complaints = await Complaint.find({ clientId })
      .populate('caregiverId', 'name email')
      .populate('bookingId', 'startDate endDate status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

// Get complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    const complaint = await Complaint.findOne({ _id: id, clientId })
      .populate('clientId', 'name email')
      .populate('caregiverId', 'name email')
      .populate('bookingId');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
};

// Admin: Get all complaints
export const getAllComplaints = async (req, res) => {
  try {
    const { status, category, severity } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;

    const complaints = await Complaint.find(filter)
      .populate('clientId', 'name email phone')
      .populate('caregiverId', 'name email phone')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaints,
      count: complaints.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

// Admin: Update complaint status and action
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, adminAction } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      {
        status,
        adminNotes,
        adminAction,
        resolvedAt: status === 'resolved' ? new Date() : null
      },
      { new: true, runValidators: true }
    )
      .populate('clientId', 'name email')
      .populate('caregiverId', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // If action is to suspend caregiver, update their status
    if (adminAction === 'suspend_caregiver' && complaint.caregiverId) {
      await User.findByIdAndUpdate(
        complaint.caregiverId,
        { isActive: false }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message
    });
  }
};

// Admin: Get complaint statistics
export const getComplaintStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const openComplaints = await Complaint.countDocuments({ status: 'open' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in_progress' });

    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        openComplaints,
        resolvedComplaints,
        inProgressComplaints,
        complaintsByCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint statistics',
      error: error.message
    });
  }
};
