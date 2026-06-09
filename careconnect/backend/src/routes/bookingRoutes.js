import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  updatePayment,
  getClientBookings,
  getCaregiverBookings
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/my-bookings', protect, getClientBookings);
router.get('/caregiver-bookings', protect, getCaregiverBookings);
router.get('/:id([0-9a-fA-F]{24})', protect, getBookingById);
router.put('/:id([0-9a-fA-F]{24})', protect, updateBooking);
router.put('/:id([0-9a-fA-F]{24})/payment', protect, updatePayment);
router.delete('/:id([0-9a-fA-F]{24})', protect, cancelBooking);

export default router;
