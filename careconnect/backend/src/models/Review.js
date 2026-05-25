import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // one review per booking
    },
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Caregiver',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    reviewText: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

const Review = mongoose.model('Review', reviewSchema)

export default Review