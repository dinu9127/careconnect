import mongoose from 'mongoose';

const caregiverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization']
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience']
  },
  certifications: [{
    name: String,
    issuer: String,
    date: Date
  }],
  nvqCertifications: [{
    level: {
      type: String,
      enum: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']
    },
    subject: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String,
    documentUrl: String,
    verified: {
      type: Boolean,
      default: false
    },
    verificationNotes: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  professionalDocuments: [{
    documentType: {
      type: String,
      enum: ['Service Letter', 'Professional Certificate', 'Training Certificate', 'License', 'Qualification', 'Other']
    },
    issuer: String,
    title: String,
    issueDate: Date,
    expiryDate: Date,
    documentUrl: String,
    description: String,
    verified: {
      type: Boolean,
      default: false
    },
    verificationNotes: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    type: String,
    required: [true, 'Please add a location'],
    enum: [
      'Colombo', 'Gampaha', 'Kalutara',
      'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota',
      'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya',
      'Puttalam', 'Kurunegala',
      'Anuradhapura', 'Polonnaruwa',
      'Trincomalee', 'Batticaloa', 'Ampara',
      'Badulla', 'Monaragala',
      'Ratnapura', 'Kegalle'
    ]
  },
  // Optional finer-grained district fields: resident (where caregiver lives)
  // and boarding (where caregiver can provide boarding services)
  residentDistrict: {
    type: String,
    enum: [
      'Colombo', 'Gampaha', 'Kalutara',
      'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota',
      'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya',
      'Puttalam', 'Kurunegala',
      'Anuradhapura', 'Polonnaruwa',
      'Trincomalee', 'Batticaloa', 'Ampara',
      'Badulla', 'Monaragala',
      'Ratnapura', 'Kegalle'
    ]
  },
  boardingDistrict: {
    type: String,
    enum: [
      'Colombo', 'Gampaha', 'Kalutara',
      'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota',
      'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya',
      'Puttalam', 'Kurunegala',
      'Anuradhapura', 'Polonnaruwa',
      'Trincomalee', 'Batticaloa', 'Ampara',
      'Badulla', 'Monaragala',
      'Ratnapura', 'Kegalle'
    ]
  },
  geoLocation: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: (coords) => {
          if (!coords || coords.length === 0) return true;
          if (coords.length !== 2) return false;
          return coords.every((value) => Number.isFinite(value));
        },
        message: 'Geo coordinates must be [lng, lat]'
      }
    }
  },
  serviceTypes: [{
    type: String,
    enum: ['Childcare', 'Elderly Care', 'Hospital Companion Care', 'Disability Support']
  }],
  leaveSlots: [{
    date: {
      type: Date,
      required: true
    },
    startTime: String,
    endTime: String,
    reason: {
      type: String,
      default: ''
    }
  }],
  hourlyRate: {
    type: Number,
    required: [true, 'Please add hourly rate']
  },
  bio: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  profileImageData: {
    data: {
      type: Buffer,
      select: false
    },
    contentType: String,
    originalName: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  verificationDocuments: [{
    url: {
      type: String,
      required: true
    },
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  bookedDates: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
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
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

caregiverSchema.index({ geoLocation: '2dsphere' });

const Caregiver = mongoose.model('Caregiver', caregiverSchema);

export default Caregiver;
