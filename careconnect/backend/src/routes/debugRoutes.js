import express from 'express'
import { getPaymentEnv } from '../controllers/debugController.js'

const router = express.Router()

// GET /api/debug/payment-env
router.get('/payment-env', getPaymentEnv)

export default router
