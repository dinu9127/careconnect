import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import {
  createReview,
  getAllReviews,
  getMyReviews,
  getReviewsForCaregiver,
} from '../controllers/reviewController.js'

const router = express.Router()

// Public/clients: read caregiver reviews
router.get('/caregiver/:caregiverId', getReviewsForCaregiver)

// Client: create review after completed booking
router.post('/', protect, authorize('client'), createReview)

// Caregiver: view own reviews
router.get('/me', protect, authorize('caregiver'), getMyReviews)

// Admin: view all reviews
router.get('/admin', protect, authorize('admin'), getAllReviews)

export default router