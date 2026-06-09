import Caregiver from '../models/Caregiver.js'
import User from '../models/User.js'
import Review from '../models/Review.js'

// Public stats endpoint: verified caregivers count, people served, average rating, latest reviews
export const getPublicStats = async (_req, res) => {
  try {
    // Count verified caregiver profiles
    const verifiedCaregiversCount = await Caregiver.countDocuments({ verificationStatus: 'verified' })

    // Count caregiver users (role=caregiver) and client users (role=client)
    const caregiverUsersCount = await User.countDocuments({ role: 'caregiver' })
    const clientUsersCount = await User.countDocuments({ role: 'client' })

    // People served = caregiver users + client users
    const peopleServed = caregiverUsersCount + clientUsersCount

    // Average rating across all reviews (aggregate)
    const ratingAgg = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])

    const averageRating = ratingAgg && ratingAgg.length > 0 ? Number((ratingAgg[0].avgRating || 0).toFixed(2)) : 0

    // Latest 3 reviews
    const latestReviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({ path: 'client', select: 'name' })
      .select('rating reviewText createdAt client')

    return res.status(200).json({
      success: true,
      data: {
        verifiedCaregiversCount,
        peopleServed,
        averageRating,
        latestReviews,
      },
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export default { getPublicStats }
