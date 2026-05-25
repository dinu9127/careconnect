import multer from 'multer';

// Keep file in memory so we can stream it to Vercel Blob.
const storage = multer.memoryStorage();

const createMulter = ({ fileFilter, maxSizeBytes }) =>
  multer({
    storage,
    limits: { fileSize: maxSizeBytes },
    fileFilter
  });

// Allow only image mimetypes for profile photos.
const imageOnlyFilter = (req, file, cb) => {
  if (file?.mimetype?.startsWith('image/')) {
    cb(null, true);
    return;
  }
  cb(new Error('Only image files are allowed'));
};

// Allow images or PDF files for verification docs.
const imageOrPdfFilter = (req, file, cb) => {
  const isImage = file?.mimetype?.startsWith('image/');
  const isPdf = file?.mimetype === 'application/pdf';
  if (isImage || isPdf) {
    cb(null, true);
    return;
  }
  cb(new Error('Only image or PDF files are allowed'));
};

// Allow images, PDF, or DOCX documents.
const imageOrDocumentFilter = (req, file, cb) => {
  const isImage = file?.mimetype?.startsWith('image/');
  const isPdf = file?.mimetype === 'application/pdf';
  const isDocx =
    file?.mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (isImage || isPdf || isDocx) {
    cb(null, true);
    return;
  }
  cb(new Error('Only image, PDF, or DOCX files are allowed'));
};

export { createMulter, imageOnlyFilter, imageOrPdfFilter, imageOrDocumentFilter };
