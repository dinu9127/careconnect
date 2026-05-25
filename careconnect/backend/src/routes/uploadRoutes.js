import express from 'express';
import { uploadFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { createMulter, imageOrDocumentFilter } from '../middleware/upload.js';

const router = express.Router();

const upload = createMulter({
  fileFilter: imageOrDocumentFilter,
  maxSizeBytes: 5 * 1024 * 1024
});

router.post('/', protect, upload.single('file'), uploadFile);

export default router;
