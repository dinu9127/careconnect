// Validation middleware using express-validator
import { body, param, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Register validation rules
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['client', 'caregiver', 'admin']).withMessage('Invalid role. Must be client, caregiver, or admin'),
  
  handleValidationErrors
];

// Login validation rules
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

// Update user validation rules
export const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Please provide a valid phone number'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address must not exceed 200 characters'),
  
  handleValidationErrors
];

// MongoDB ID validation
export const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Caregiver validation rules
export const caregiverValidation = [
  body('specialization')
    .notEmpty().withMessage('Specialization is required')
    .isLength({ min: 2, max: 100 }).withMessage('Specialization must be between 2 and 100 characters'),
  
  body('experience')
    .notEmpty().withMessage('Experience is required')
    .isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  
  body('hourlyRate')
    .notEmpty().withMessage('Hourly rate is required')
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  
  body('availability')
    .optional()
    .isArray().withMessage('Availability must be an array'),
  
  handleValidationErrors
];

// Booking validation rules
export const bookingValidation = [
  body('caregiverId')
    .notEmpty().withMessage('Caregiver ID is required')
    .isMongoId().withMessage('Invalid caregiver ID'),
  
  body('serviceType')
    .notEmpty().withMessage('Service type is required')
    .isLength({ min: 2, max: 100 }).withMessage('Service type must be between 2 and 100 characters'),
  
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
  
  handleValidationErrors
];

export default {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  updateUserValidation,
  mongoIdValidation,
  caregiverValidation,
  bookingValidation
};
