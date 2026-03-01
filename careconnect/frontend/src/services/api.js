import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API service functions
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
}

export const userService = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  deleteMe: () => api.delete('/users/me'),
  changePassword: (data) => api.put('/users/me/password', data),
}

export const caregiverService = {
  getCaregivers: () => api.get('/caregivers'),
  getCaregiverById: (id) => api.get(`/caregivers/${id}`),
  updateCaregiver: (id, data) => api.put(`/caregivers/${id}`, data),
  uploadProfileImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/caregivers/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadVerificationDocument: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/caregivers/me/verification-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
}

export const complaintService = {
  submitComplaint: (data) => api.post('/complaints', data),
  getClientComplaints: () => api.get('/complaints/my-complaints'),
  getAllComplaints: () => api.get('/complaints/admin/all'),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  updateComplaint: (id, data) => api.put(`/complaints/${id}`, data),
}

export const reviewService = {
  createReview: (data) => api.post('/reviews', data), // client only
  getCaregiverReviews: (caregiverId) => api.get(`/reviews/caregiver/${caregiverId}`),
  getMyReviews: () => api.get('/reviews/me'), // caregiver
  getAllReviews: () => api.get('/reviews/admin'), // admin
}

export default api
