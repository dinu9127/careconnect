import express from 'express';
import {
  getUsers,
  getUserById,
  updateCurrentUser,
  updateUser,
  deleteUser,
  deleteCurrentUser,
  updateCurrentPassword
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { mongoIdValidation, updateUserValidation } from '../middleware/validator.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.put('/me', protect, updateUserValidation, updateCurrentUser);
router.put('/me/password', protect, updateCurrentPassword);
router.delete('/me', protect, deleteCurrentUser);
router.get('/:id', protect, mongoIdValidation, getUserById);
router.put('/:id', protect, mongoIdValidation, updateUserValidation, updateUser);
router.delete('/:id', protect, authorize('admin'), mongoIdValidation, deleteUser);

export default router;
