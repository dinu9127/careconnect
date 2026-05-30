import path from 'path';
import { head, put } from '@vercel/blob';
import Caregiver from '../models/Caregiver.js';
import User from '../models/User.js';

const withGeoLocationUpdate = (payload) => {
  const update = { ...payload };
  const lat = Number.parseFloat(update.lat ?? update.latitude);
  const lng = Number.parseFloat(update.lng ?? update.longitude);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    update.geoLocation = {
      type: 'Point',
      coordinates: [lng, lat]
    };
  }

  delete update.lat;
  delete update.lng;
  delete update.latitude;
  delete update.longitude;

  return update;
};

const ensureCaregiverProfile = async (userId) => {
  let caregiver = await Caregiver.findOne({ user: userId });

  if (!caregiver) {
    caregiver = await Caregiver.create({
      user: userId,
      specialization: 'Not specified',
      experience: 0,
      location: 'Colombo',
      hourlyRate: 0,
      bio: '',
      serviceTypes: [],
      leaveSlots: []
    });
  }

  return caregiver;
};

const sanitizeFilename = (filename) =>
  filename.replace(/[^a-zA-Z0-9._-]/g, '_');

// @desc    Get all caregivers with filters and search
// @route   GET /api/caregivers
// @access  Public
// @query   name, location, serviceType, date, sortBy, district
export const getCaregivers = async (req, res) => {
  try {
    console.log('Verification upload envs:', {
      hasPrivateToken: Boolean(process.env.BLOB_PRIVATE_READ_WRITE_TOKEN),
      hasReadWriteToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      hasPublicToken: Boolean(process.env.BLOB_PUBLIC_READ_WRITE_TOKEN)
    });
    const { name, location, serviceType, sortBy, district } = req.query;
    
    // Build filter object
    let filter = {
      verificationStatus: 'verified'
    };


    if (serviceType && serviceType !== 'All Services') {
      filter.serviceTypes = { $in: [serviceType] };
    }

    // District filter: match either residentDistrict or boardingDistrict
    if (district && district !== 'All Locations') {
      filter.$or = [
        { residentDistrict: district },
        { boardingDistrict: district }
      ];
    }

    let caregivers = await Caregiver.find(filter).populate({
      path: 'user',
      select: 'name email phone',
      match: name ? { name: { $regex: name, $options: 'i' } } : {}
    });

    if (name) {
      caregivers = caregivers.filter((caregiver) => caregiver.user);
    }
    
    // Sort by rating or other criteria
    if (sortBy === 'rating') {
      caregivers.sort((a, b) => b.rating - a.rating);
    }
    
    // All caregivers are available 24/7 by default
    const categorized = {
      available: caregivers,
      limited: [],
      unavailable: []
    };
    
    res.status(200).json({
      success: true,
      count: caregivers.length,
      data: caregivers,
      categorized: categorized
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get nearby caregivers using geo search
// @route   GET /api/caregivers/nearby
// @access  Public
// @query   lat, lng, radiusKm, serviceType, location
export const getCaregiversNearby = async (req, res) => {
  try {
    const latitude = Number.parseFloat(req.query.lat);
    const longitude = Number.parseFloat(req.query.lng);
    const radiusKm = Number.parseFloat(req.query.radiusKm ?? '10');

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const maxDistanceMeters = Math.max(radiusKm, 0) * 1000;
    const match = { verificationStatus: 'verified' };

    if (req.query.serviceType && req.query.serviceType !== 'All Services') {
      match.serviceTypes = { $in: [req.query.serviceType] };
    }

    // District filter for nearby: match resident or boarding district
    if (req.query.district && req.query.district !== 'All Locations') {
      match.$or = [
        { residentDistrict: req.query.district },
        { boardingDistrict: req.query.district }
      ];
    }

    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: match
        }
      },
      {
        $addFields: {
          distanceKm: { $divide: ['$distanceMeters', 1000] }
        }
      }
    ];

    let caregivers = await Caregiver.aggregate(pipeline);
    caregivers = await Caregiver.populate(caregivers, {
      path: 'user',
      select: 'name email phone'
    });

    res.status(200).json({
      success: true,
      count: caregivers.length,
      data: caregivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Get all caregivers (pending, verified, rejected)
export const getAllCaregiversAdmin = async (req, res) => {
  try {
    const { name, location, serviceType, verificationStatus } = req.query;

    const caregiverUsers = await User.find({ role: 'caregiver' }).select('_id');
    const caregiverUserIds = caregiverUsers.map((user) => user._id.toString());
    const existingProfiles = await Caregiver.find({ user: { $in: caregiverUserIds } }).select('user');
    const existingUserIds = new Set(existingProfiles.map((profile) => profile.user.toString()));

    const missingUserIds = caregiverUserIds.filter((userId) => !existingUserIds.has(userId));

    if (missingUserIds.length > 0) {
      await Caregiver.insertMany(
        missingUserIds.map((userId) => ({
          user: userId,
          specialization: 'Not specified',
          experience: 0,
          location: 'Colombo',
          hourlyRate: 0,
          bio: '',
          serviceTypes: [],
          leaveSlots: [],
          verificationStatus: 'pending'
        }))
      );
    }
    
    // Build filter object
    let filter = {};
    if (serviceType && serviceType !== 'All Services') {
      filter.serviceTypes = { $in: [serviceType] };
    }

    if (verificationStatus) {
      filter.verificationStatus = verificationStatus;
    }

    let caregivers = await Caregiver.find(filter).populate({
      path: 'user',
      select: 'name email phone',
      match: name ? { name: { $regex: name, $options: 'i' } } : {}
    });

    if (name) {
      caregivers = caregivers.filter((caregiver) => caregiver.user);
    }
    
    res.status(200).json({
      success: true,
      count: caregivers.length,
      data: caregivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged-in caregiver's profile
// @route   GET /api/caregivers/me
// @access  Private/Caregiver
export const getMyCaregiverProfile = async (req, res) => {
  try {
    let caregiver = await Caregiver.findOne({ user: req.user.id || req.user._id }).populate('user', 'name email phone address');
    
    // If no caregiver profile exists, create a basic one
    if (!caregiver) {
      caregiver = await Caregiver.create({
        user: req.user.id || req.user._id,
        specialization: 'Not specified',
        experience: 0,
        location: 'Colombo',
        hourlyRate: 0,
        bio: '',
        serviceTypes: [],
        leaveSlots: []
      });
      
      // Populate user data for the newly created profile
      caregiver = await Caregiver.findById(caregiver._id).populate('user', 'name email phone address');
    }
    
    res.status(200).json({
      success: true,
      data: caregiver
    });
  } catch (error) {
    console.error('Get My Caregiver Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload caregiver profile image
// @route   POST /api/caregivers/me/profile-image
// @access  Private/Caregiver
export const uploadProfileImage = async (req, res) => {
  try {
    // Validate the uploaded file is present.
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach an image file'
      });
    }
    // Resolve caregiver profile and store the image in MongoDB.
    const caregiver = await ensureCaregiverProfile(req.user.id || req.user._id);

    caregiver.profileImageData = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date()
    };
    caregiver.profileImage = `/api/caregivers/${caregiver._id}/profile-image`;
    await caregiver.save();

    return res.status(200).json({
      success: true,
      data: {
        url: `${caregiver.profileImage}?t=${Date.now()}`
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get caregiver profile image
// @route   GET /api/caregivers/:id/profile-image
// @access  Public
export const getCaregiverProfileImage = async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.params.id)
      .select('profileImageData.contentType profileImageData.size')
      .select('+profileImageData.data');

    if (!caregiver || !caregiver.profileImageData?.data) {
      return res.status(404).json({
        success: false,
        message: 'Profile image not found'
      });
    }

    res.set('Content-Type', caregiver.profileImageData.contentType || 'application/octet-stream');
    if (caregiver.profileImageData.size) {
      res.set('Content-Length', caregiver.profileImageData.size);
    }
    res.set('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(caregiver.profileImageData.data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload caregiver verification document
// @route   POST /api/caregivers/me/verification-document
// @access  Private/Caregiver
export const uploadVerificationDocument = async (req, res) => {
  try {
    console.log('Verification upload envs:', {
      hasPrivateToken: Boolean(process.env.BLOB_PRIVATE_READ_WRITE_TOKEN),
      hasReadWriteToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      hasPublicToken: Boolean(process.env.BLOB_PUBLIC_READ_WRITE_TOKEN)
    });
    // Validate the uploaded file is present.
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach an image or PDF file'
      });
    }

    const publicToken = process.env.BLOB_PUBLIC_READ_WRITE_TOKEN;
    if (!publicToken) {
      return res.status(500).json({
        success: false,
        message: 'Blob storage token is not configured'
      });
    }

    // Resolve caregiver profile and build a scoped blob key.
    const caregiver = await ensureCaregiverProfile(req.user.id || req.user._id);
    const safeName = sanitizeFilename(req.file.originalname || 'verification');
    const extension = path.extname(safeName) || '';
    const key = `caregivers/verification-docs/${caregiver._id}/${Date.now()}${extension}`;

    // Store the private document in Vercel Blob.
    const { url } = await put(key, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
      token: publicToken
    });

    // Track metadata so admins can request signed URLs later.
    caregiver.verificationDocuments.push({
      url,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    await caregiver.save();

    return res.status(200).json({
      success: true,
      data: { url }
    });
  } catch (error) {
    console.error('Verification upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get signed URL for verification document
// @route   GET /api/caregivers/:id/verification-documents/:docId/signed-url
// @access  Private/Admin
export const getVerificationDocumentSignedUrl = async (req, res) => {
  try {
    const publicToken = process.env.BLOB_PUBLIC_READ_WRITE_TOKEN;
    if (!publicToken) {
      return res.status(500).json({
        success: false,
        message: 'Blob storage token is not configured'
      });
    }

    const caregiver = await Caregiver.findById(req.params.id);
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    const document = caregiver.verificationDocuments.id(req.params.docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Verification document not found'
      });
    }

    // Generate a short-lived signed URL for admin viewing.
    const blobInfo = await head(document.url, {
      token: publicToken
    });

    return res.status(200).json({
      success: true,
      data: { url: blobInfo.downloadUrl || blobInfo.url }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get caregiver by ID
// @route   GET /api/caregivers/:id
// @access  Public
export const getCaregiverById = async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.params.id).populate('user', 'name email phone address');
    
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: caregiver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create caregiver profile
// @route   POST /api/caregivers
// @access  Private
export const createCaregiver = async (req, res) => {
  try {
    const payload = withGeoLocationUpdate(req.body);
    const caregiver = await Caregiver.create({
      ...payload,
      user: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: caregiver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update caregiver profile
// @route   PUT /api/caregivers/:id or PUT /api/caregivers/me
// @access  Private
export const updateCaregiver = async (req, res) => {
  try {
    // If updating verification status, add additional logging
    if (req.body.verificationStatus) {
      const validStatuses = ['pending', 'verified', 'rejected'];
      if (!validStatuses.includes(req.body.verificationStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification status. Must be pending, verified, or rejected'
        });
      }
    }

    // Handle /me route - get caregiver ID from user
    let caregiverId = req.params.id;
    if (!req.params.id || req.params.id === 'me') {
      console.log('Updating /me route. User ID:', req.user.id || req.user._id);
      
      // Try both user and _id fields
      const caregiverProfile = await Caregiver.findOne({ 
        user: req.user._id || req.user.id 
      });
      
      console.log('Found caregiver profile:', caregiverProfile ? 'Yes' : 'No');
      
      if (!caregiverProfile) {
        return res.status(404).json({
          success: false,
          message: 'Caregiver profile not found. Please complete your profile setup first.'
        });
      }
      caregiverId = caregiverProfile._id;
    }

    const updateData = withGeoLocationUpdate(req.body);
    const caregiver = await Caregiver.findByIdAndUpdate(
      caregiverId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name email phone');
    
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: caregiver
    });
  } catch (error) {
    console.error('Update caregiver error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add NVQ certification
// @route   POST /api/caregivers/:id/nvq-certifications
// @access  Private
export const addNVQCertification = async (req, res) => {
  try {
    const { level, subject, issueDate, expiryDate, certificateNumber, documentUrl } = req.body;

    if (!level || !subject || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide level, subject, and issue date'
      });
    }

    const caregiver = await Caregiver.findById(req.params.id);

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    const nvqCertification = {
      level,
      subject,
      issueDate,
      expiryDate,
      certificateNumber,
      documentUrl
    };

    caregiver.nvqCertifications.push(nvqCertification);
    await caregiver.save();

    res.status(201).json({
      success: true,
      message: 'NVQ certification added successfully',
      data: caregiver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update NVQ certification
// @route   PUT /api/caregivers/:id/nvq-certifications/:certId
// @access  Private
export const updateNVQCertification = async (req, res) => {
  try {
    const { id, certId } = req.params;
    const { level, subject, issueDate, expiryDate, certificateNumber, documentUrl, verified, verificationNotes } = req.body;

    const caregiver = await Caregiver.findById(id);

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    const certification = caregiver.nvqCertifications.id(certId);

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Update fields
    if (level) certification.level = level;
    if (subject) certification.subject = subject;
    if (issueDate) certification.issueDate = issueDate;
    if (expiryDate) certification.expiryDate = expiryDate;
    if (certificateNumber) certification.certificateNumber = certificateNumber;
    if (documentUrl) certification.documentUrl = documentUrl;
    if (verified !== undefined) certification.verified = verified;
    if (verificationNotes) certification.verificationNotes = verificationNotes;

    await caregiver.save();

    res.status(200).json({
      success: true,
      message: 'NVQ certification updated successfully',
      data: caregiver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete NVQ certification
// @route   DELETE /api/caregivers/:id/nvq-certifications/:certId
// @access  Private
export const deleteNVQCertification = async (req, res) => {
  try {
    const { id, certId } = req.params;

    const caregiver = await Caregiver.findById(id);

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    caregiver.nvqCertifications.id(certId).remove();
    await caregiver.save();

    res.status(200).json({
      success: true,
      message: 'NVQ certification deleted successfully',
      data: caregiver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add professional document
// @route   POST /api/caregivers/:id/professional-documents
// @access  Private
export const addProfessionalDocument = async (req, res) => {
  try {
    const { documentType, issuer, title, issueDate, expiryDate, documentUrl, description } = req.body;

    if (!documentType || !title || !documentUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide document type, title, and document URL'
      });
    }

    const caregiver = await Caregiver.findById(req.params.id);

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    const professionalDocument = {
      documentType,
      issuer,
      title,
      issueDate,
      expiryDate,
      documentUrl,
      description
    };

    caregiver.professionalDocuments.push(professionalDocument);
    await caregiver.save();

    res.status(201).json({
      success: true,
      message: 'Professional document added successfully',
      data: caregiver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update professional document
// @route   PUT /api/caregivers/:id/professional-documents/:docId
// @access  Private
export const updateProfessionalDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const { documentType, issuer, title, issueDate, expiryDate, documentUrl, description, verified, verificationNotes } = req.body;

    const caregiver = await Caregiver.findById(id);

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    const document = caregiver.professionalDocuments.id(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update fields
    if (documentType) document.documentType = documentType;
    if (issuer) document.issuer = issuer;
    if (title) document.title = title;
    if (issueDate) document.issueDate = issueDate;
    if (expiryDate) document.expiryDate = expiryDate;
    if (documentUrl) document.documentUrl = documentUrl;
    if (description) document.description = description;
    if (verified !== undefined) document.verified = verified;
    if (verificationNotes) document.verificationNotes = verificationNotes;

    await caregiver.save();

    res.status(200).json({
      success: true,
      message: 'Professional document updated successfully',
      data: caregiver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete professional document
// @route   DELETE /api/caregivers/:id/professional-documents/:docId
// @access  Private
export const deleteProfessionalDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;

    const caregiver = await Caregiver.findById(id);

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    caregiver.professionalDocuments.id(docId).remove();
    await caregiver.save();

    res.status(200).json({
      success: true,
      message: 'Professional document deleted successfully',
      data: caregiver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get caregiver documents and certifications
// @route   GET /api/caregivers/:id/documents
// @access  Private
export const getCaregiverDocuments = async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.params.id).select(
      'nvqCertifications professionalDocuments'
    );

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        nvqCertifications: caregiver.nvqCertifications,
        professionalDocuments: caregiver.professionalDocuments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
