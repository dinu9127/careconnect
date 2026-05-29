import express from 'express';
import { uploadFile, getUserDocuments } from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';
import { createMulter, imageOrDocumentFilter } from '../middleware/upload.js';

const router = express.Router();

const upload = createMulter({
  fileFilter: imageOrDocumentFilter,
  maxSizeBytes: 5 * 1024 * 1024
});

router.post('/', protect, upload.single('file'), uploadFile);
router.get('/user/:id', protect, authorize('admin'), getUserDocuments);

export default router;
