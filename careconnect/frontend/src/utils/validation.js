// Form validation utilities

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // At least 6 characters, one uppercase, one lowercase, one number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return re.test(password);
};

export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone);
};

// Login form validation
export const validateLoginForm = (values) => {
  const errors = {};

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
};

// Registration form validation
export const validateRegisterForm = (values) => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Name is required';
  } else if (values.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (values.name.length > 50) {
    errors.name = 'Name must not exceed 50 characters';
  }

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (!validatePassword(values.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and number';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

// Update user form validation
export const validateUpdateUserForm = (values) => {
  const errors = {};

  if (values.name && values.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (values.name && values.name.length > 50) {
    errors.name = 'Name must not exceed 50 characters';
  }

  if (values.email && !validateEmail(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (values.phone && !validatePhone(values.phone)) {
    errors.phone = 'Invalid phone number';
  }

  if (values.address && values.address.length > 200) {
    errors.address = 'Address must not exceed 200 characters';
  }

  return errors;
};

// Booking form validation
export const validateBookingForm = (values) => {
  const errors = {};

  if (!values.caregiverId) {
    errors.caregiverId = 'Please select a caregiver';
  }

  if (!values.serviceType) {
    errors.serviceType = 'Service type is required';
  }

  if (!values.startDate) {
    errors.startDate = 'Start date is required';
  } else {
    const startDate = new Date(values.startDate);
    if (startDate < new Date()) {
      errors.startDate = 'Start date cannot be in the past';
    }
  }

  if (!values.endDate) {
    errors.endDate = 'End date is required';
  } else if (values.startDate) {
    const startDate = new Date(values.startDate);
    const endDate = new Date(values.endDate);
    if (endDate <= startDate) {
      errors.endDate = 'End date must be after start date';
    }
  }

  if (values.notes && values.notes.length > 500) {
    errors.notes = 'Notes must not exceed 500 characters';
  }

  return errors;
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateLoginForm,
  validateRegisterForm,
  validateUpdateUserForm,
  validateBookingForm,
};
