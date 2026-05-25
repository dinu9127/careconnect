import express from 'express';
import {
  getCaregivers,
  getCaregiversNearby,
  getAllCaregiversAdmin,
  getCaregiverById,
  getMyCaregiverProfile,
  createCaregiver,
  updateCaregiver,
  uploadProfileImage,
  uploadVerificationDocument,
  getVerificationDocumentSignedUrl,
  addNVQCertification,
  updateNVQCertification,
  deleteNVQCertification,
  addProfessionalDocument,
  updateProfessionalDocument,
  deleteProfessionalDocument,
  getCaregiverDocuments
} from '../controllers/caregiverController.js';
import { protect, authorize } from '../middleware/auth.js';
import { createMulter, imageOnlyFilter, imageOrPdfFilter } from '../middleware/upload.js';

const router = express.Router();

const profileImageUpload = createMulter({
  fileFilter: imageOnlyFilter,
  maxSizeBytes: 5 * 1024 * 1024
});

const verificationDocUpload = createMulter({
  fileFilter: imageOrPdfFilter,
  maxSizeBytes: 5 * 1024 * 1024
});

// Admin route for all caregivers (with all verification statuses)
router.get('/admin/all', protect, authorize('admin'), getAllCaregiversAdmin);

// Basic caregiver routes
router.get('/nearby', getCaregiversNearby);
router.get('/', getCaregivers);
router.get('/me', protect, authorize('caregiver'), getMyCaregiverProfile);
router.post(
  '/me/profile-image',
  protect,
  authorize('caregiver'),
  profileImageUpload.single('file'),
  uploadProfileImage
);
router.post(
  '/me/verification-document',
  protect,
  authorize('caregiver'),
  verificationDocUpload.single('file'),
  uploadVerificationDocument
);
router.get(
  '/:id([0-9a-fA-F]{24})/verification-documents/:docId/signed-url',
  protect,
  authorize('admin'),
  getVerificationDocumentSignedUrl
);
router.put('/me', protect, authorize('caregiver'), updateCaregiver);
router.get('/:id([0-9a-fA-F]{24})', getCaregiverById);
router.post('/', protect, authorize('caregiver'), createCaregiver);
router.put('/:id([0-9a-fA-F]{24})', protect, authorize('caregiver', 'admin'), updateCaregiver);

// Document and certification routes
router.get('/:id([0-9a-fA-F]{24})/documents', protect, getCaregiverDocuments);

// NVQ Certification routes
router.post('/:id([0-9a-fA-F]{24})/nvq-certifications', protect, authorize('caregiver'), addNVQCertification);
router.put('/:id([0-9a-fA-F]{24})/nvq-certifications/:certId', protect, authorize('caregiver'), updateNVQCertification);
router.delete('/:id([0-9a-fA-F]{24})/nvq-certifications/:certId', protect, authorize('caregiver'), deleteNVQCertification);

// Professional Document routes
router.post('/:id([0-9a-fA-F]{24})/professional-documents', protect, authorize('caregiver'), addProfessionalDocument);
router.put('/:id([0-9a-fA-F]{24})/professional-documents/:docId', protect, authorize('caregiver'), updateProfessionalDocument);
router.delete('/:id([0-9a-fA-F]{24})/professional-documents/:docId', protect, authorize('caregiver'), deleteProfessionalDocument);

export default router;
