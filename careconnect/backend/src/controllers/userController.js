import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
export const updateCurrentUser = async (req, res) => {
  try {
    const updateData = { ...req.body };

    const latitude = Number.parseFloat(req.body.latitude);
    const longitude = Number.parseFloat(req.body.longitude);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      updateData.geoLocation = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    delete updateData.latitude;
    delete updateData.longitude;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active bookings
    const Booking = (await import('../models/Booking.js')).default;
    
    let activeBookings = [];
    
    // If user is a client, check their bookings
    if (user.role === 'client') {
      activeBookings = await Booking.find({
        client: user._id,
        status: { $in: ['confirmed', 'in-progress'] }
      });
    }
    
    // If user is a caregiver, check bookings for their caregiver profile
    if (user.role === 'caregiver') {
      const Caregiver = (await import('../models/Caregiver.js')).default;
      const caregiverProfile = await Caregiver.findOne({ user: user._id });
      
      if (caregiverProfile) {
        activeBookings = await Booking.find({
          caregiver: caregiverProfile._id,
          status: { $in: ['confirmed', 'in-progress'] }
        });
      }
    }

    // If there are active bookings, prevent deletion
    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user. They have ${activeBookings.length} active booking(s). Please cancel or complete these bookings first.`,
        activeBookings: activeBookings.length
      });
    }

    // Check for pending bookings as warning
    let pendingBookings = [];
    
    if (user.role === 'client') {
      pendingBookings = await Booking.find({
        client: user._id,
        status: 'pending'
      });
    }
    
    if (user.role === 'caregiver') {
      const Caregiver = (await import('../models/Caregiver.js')).default;
      const caregiverProfile = await Caregiver.findOne({ user: user._id });
      
      if (caregiverProfile) {
        pendingBookings = await Booking.find({
          caregiver: caregiverProfile._id,
          status: 'pending'
        });
      }
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    // If user is caregiver, also delete their caregiver profile
    if (user.role === 'caregiver') {
      const Caregiver = (await import('../models/Caregiver.js')).default;
      await Caregiver.deleteOne({ user: user._id });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      warning: pendingBookings.length > 0 ? `${pendingBookings.length} pending booking(s) were also cancelled` : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete current user (caregiver only)
// @route   DELETE /api/users/me
// @access  Private
export const deleteCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'caregiver') {
      return res.status(403).json({
        success: false,
        message: 'Only caregivers can delete their own account'
      });
    }

    const Booking = (await import('../models/Booking.js')).default;
    const Caregiver = (await import('../models/Caregiver.js')).default;
    const caregiverProfile = await Caregiver.findOne({ user: user._id });

    if (caregiverProfile) {
      const blockingBookings = await Booking.find({
        caregiver: caregiverProfile._id,
        $or: [
          { status: { $in: ['pending', 'confirmed', 'in-progress'] } },
          { status: 'completed', paymentStatus: { $ne: 'paid' } }
        ]
      });

      if (blockingBookings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete caregiver account. All bookings must be completed and paid, with no pending or in-progress bookings.'
        });
      }
    }

    await User.findByIdAndDelete(user._id);
    if (caregiverProfile) {
      await Caregiver.deleteOne({ _id: caregiverProfile._id });
    }

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update current user password
// @route   PUT /api/users/me/password
// @access  Private
export const updateCurrentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match'
      });
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters and include uppercase, lowercase, and a number'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
