import Review from '../models/Review.js'
import Booking from '../models/Booking.js'
import Caregiver from '../models/Caregiver.js'

// Create a review for a completed booking (client only)
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, reviewText = '' } = req.body

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: 'bookingId and rating are required' })
    }

    // Validate booking ownership and completion
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review your own bookings' })
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Booking must be completed to review' })
    }

    // Enforce single review per booking
    const existing = await Review.findOne({ booking: bookingId })
    if (existing) {
      return res.status(400).json({ success: false, message: 'A review already exists for this booking' })
    }

    // Create review
    const review = await Review.create({
      booking: bookingId,
      caregiver: booking.caregiver,
      client: req.user._id,
      rating,
      reviewText,
    })

    // Update caregiver aggregates
    const caregiver = await Caregiver.findById(booking.caregiver)
    if (caregiver) {
      const currentTotal = (caregiver.rating || 0) * (caregiver.reviewCount || 0)
      const newCount = (caregiver.reviewCount || 0) + 1
      const newRating = (currentTotal + rating) / newCount

      caregiver.rating = Number(newRating.toFixed(2))
      caregiver.reviewCount = newCount
      await caregiver.save()
    }

    const populated = await Review.findById(review._id)
      .populate({ path: 'client', select: 'name' })
      .populate({ path: 'caregiver', select: 'user' })

    return res.status(201).json({ success: true, data: populated })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Public/clients: get reviews for a caregiver
export const getReviewsForCaregiver = async (req, res) => {
  try {
    const { caregiverId } = req.params
    const reviews = await Review.find({ caregiver: caregiverId })
      .populate({ path: 'client', select: 'name' })
      .sort({ createdAt: -1 })

    return res.status(200).json({ success: true, data: reviews })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Caregiver: get own reviews
export const getMyReviews = async (req, res) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user._id })
    if (!caregiver) {
      return res.status(404).json({ success: false, message: 'Caregiver profile not found' })
    }

    const reviews = await Review.find({ caregiver: caregiver._id })
      .populate({ path: 'client', select: 'name' })
      .sort({ createdAt: -1 })

    return res.status(200).json({ success: true, data: reviews })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Admin: get all reviews
export const getAllReviews = async (_req, res) => {
  try {
    const reviews = await Review.find({})
      .populate({ path: 'client', select: 'name' })
      .populate({ path: 'caregiver', select: 'user' })
      .populate({ path: 'booking', select: 'startDate endDate status' })
      .sort({ createdAt: -1 })

    return res.status(200).json({ success: true, data: reviews })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}