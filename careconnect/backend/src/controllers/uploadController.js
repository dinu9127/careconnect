import path from 'path';
import Document from '../models/Document.js';
import { uploadToBlob } from '../services/blobService.js';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.pdf', '.docx']);
const allowedFileTypes = new Map([
  ['nic', 'NIC'],
  ['certificate', 'Certificate'],
  ['profilepicture', 'ProfilePicture'],
  ['profile picture', 'ProfilePicture'],
  ['other', 'Other']
]);

const sanitizeFilename = (filename) =>
  filename.replace(/[^a-zA-Z0-9._-]/g, '_');

const resolveFileType = (fileType) => {
  if (!fileType) {
    return null;
  }
  const normalized = String(fileType).trim().toLowerCase();
  return allowedFileTypes.get(normalized) || null;
};

const isAllowedFile = (file) => {
  if (!file) return false;
  if (allowedMimeTypes.has(file.mimetype)) return true;
  const ext = path.extname(file.originalname || '').toLowerCase();
  return allowedExtensions.has(ext);
};

// @desc    Upload a file to Vercel Blob and save metadata
// @route   POST /api/upload
// @access  Private
export const uploadFile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a file to upload'
      });
    }

    if (!isAllowedFile(req.file)) {
      return res.status(400).json({
        success: false,
        message: 'Only JPG, PNG, PDF, or DOCX files are allowed'
      });
    }

    if (req.file.size > MAX_FILE_BYTES) {
      return res.status(400).json({
        success: false,
        message: 'File size must be 5MB or less'
      });
    }

    const resolvedFileType = resolveFileType(req.body?.fileType);
    if (!resolvedFileType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type selection'
      });
    }

    const userId = req.user.id || req.user._id;
    const safeName = sanitizeFilename(req.file.originalname || 'document');
    const extension = path.extname(safeName) || '';
    const typeSegment = resolvedFileType.toLowerCase();
    const key = `uploads/${userId}/${typeSegment}/${Date.now()}${extension}`;
    const access = resolvedFileType === 'ProfilePicture' ? 'public' : 'private';

    const { url } = await uploadToBlob({
      key,
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
      access,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const document = await Document.create({
      userId,
      fileUrl: url,
      fileName: req.file.originalname,
      fileType: resolvedFileType
    });

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileUrl: url,
        document
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
