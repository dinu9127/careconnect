import express from 'express'
import { renderCheckout, handleIPN } from '../controllers/payhereController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// GET /api/payhere/checkout/:id -> renders form and redirects user to PayHere
router.get('/checkout/:id', protect, renderCheckout)

// POST /api/payhere/webhook -> PayHere IPN/notify URL (no auth)
router.post('/webhook', express.urlencoded({ extended: true }), handleIPN)

export default router
