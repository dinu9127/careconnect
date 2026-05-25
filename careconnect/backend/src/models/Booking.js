import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caregiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add an end time']
  },
  bookingSlots: [{
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  }],
  serviceType: {
    type: String,
    required: [true, 'Please add a service type']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: String,
    enum: ['client', 'caregiver', 'admin', 'system', 'unknown'],
    default: 'unknown'
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  totalAmount: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'pending'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_slip', 'cash', 'none'],
    default: 'none'
  },
  bankSlipUrl: {
    type: String,
    default: ''
  },
  paymentDate: {
    type: Date,
    default: null
  },
  transactionId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
