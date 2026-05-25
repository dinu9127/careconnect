import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  submitComplaint,
  getClientComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintStats
} from '../controllers/complaintController.js';

const router = express.Router();

// Admin routes (must be before dynamic :id routes)
router.get('/admin/all', protect, authorize('admin'), getAllComplaints);
router.get('/admin/stats', protect, authorize('admin'), getComplaintStats);

// Client routes
router.post('/', protect, authorize('client'), submitComplaint);
router.get('/my-complaints', protect, authorize('client'), getClientComplaints);
router.get('/:id([0-9a-fA-F]{24})', protect, authorize('client'), getComplaintById);

// Admin routes for update
router.put('/:id([0-9a-fA-F]{24})', protect, authorize('admin'), updateComplaintStatus);

export default router;
