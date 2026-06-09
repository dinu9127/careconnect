import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client ID is required']
  },
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  caregiverName: {
    type: String,
    default: '',
    trim: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a detailed description'],
    trim: true
  },
  category: {
    type: String,
    enum: ['service_quality', 'behavior', 'payment', 'cancellation', 'other'],
    required: [true, 'Please select a category']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  adminAction: {
    type: String,
    enum: ['none', 'refund', 'suspend_caregiver', 'warning', 'investigation', 'other'],
    default: 'none'
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Complaint', complaintSchema);
