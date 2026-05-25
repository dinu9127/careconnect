# Caregiver Verification & Document Upload API

## Overview
This API provides endpoints for caregivers to manage their verification documents, NVQ certifications, and professional documents. The system allows caregivers to upload and track their credentials for profile verification.

## Authentication
All endpoints require authentication with `Authorization: Bearer {token}` header.

## Base URL
```
/api/caregivers
```

---

## 1. Get Caregiver Documents

**Endpoint:** `GET /api/caregivers/:id/documents`

**Access:** Private (Caregiver only)

**Description:** Retrieve all NVQ certifications and professional documents for a caregiver.

**Parameters:**
- `id` (path) - Caregiver ID (MongoDB ObjectId)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "nvqCertifications": [
      {
        "_id": "ObjectId",
        "level": "Level 3",
        "subject": "Health and Social Care",
        "issueDate": "2023-01-15",
        "expiryDate": "2025-01-15",
        "certificateNumber": "NVQ123456",
        "documentUrl": "https://example.com/cert.pdf",
        "verified": true,
        "verificationNotes": "Document verified by admin",
        "uploadedAt": "2024-01-20T10:30:00Z"
      }
    ],
    "professionalDocuments": [
      {
        "_id": "ObjectId",
        "documentType": "Service Letter",
        "issuer": "Hospital ABC",
        "title": "Experience Certificate",
        "issueDate": "2023-06-01",
        "expiryDate": null,
        "documentUrl": "https://example.com/letter.pdf",
        "description": "5 years of experience in patient care",
        "verified": true,
        "verificationNotes": "Verified",
        "uploadedAt": "2024-01-20T10:30:00Z"
      }
    ]
  }
}
```

---

## 2. NVQ Certifications

### 2.1 Add NVQ Certification

**Endpoint:** `POST /api/caregivers/:id/nvq-certifications`

**Access:** Private (Caregiver only)

**Description:** Add a new NVQ certification to caregiver profile.

**Parameters:**
- `id` (path) - Caregiver ID

**Request Body:**
```json
{
  "level": "Level 3",
  "subject": "Health and Social Care",
  "issueDate": "2023-01-15",
  "expiryDate": "2025-01-15",
  "certificateNumber": "NVQ123456",
  "documentUrl": "https://example.com/cert.pdf"
}
```

**Required Fields:**
- `level` - Enum: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']
- `subject` - String (e.g., "Health and Social Care", "Childcare")
- `issueDate` - Date

**Optional Fields:**
- `expiryDate` - Date
- `certificateNumber` - String
- `documentUrl` - String (URL to certificate document)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "NVQ certification added successfully",
  "data": { "caregiver": "object" }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide level, subject, and issue date"
}
```

---

### 2.2 Update NVQ Certification

**Endpoint:** `PUT /api/caregivers/:id/nvq-certifications/:certId`

**Access:** Private (Caregiver only)

**Description:** Update an existing NVQ certification.

**Parameters:**
- `id` (path) - Caregiver ID
- `certId` (path) - NVQ Certification ID

**Request Body:**
```json
{
  "level": "Level 4",
  "subject": "Health and Social Care",
  "issueDate": "2023-01-15",
  "expiryDate": "2025-01-15",
  "certificateNumber": "NVQ123456",
  "documentUrl": "https://example.com/cert.pdf",
  "verified": true,
  "verificationNotes": "Verified by admin"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "NVQ certification updated successfully",
  "data": { "caregiver": "object" }
}
```

---

### 2.3 Delete NVQ Certification

**Endpoint:** `DELETE /api/caregivers/:id/nvq-certifications/:certId`

**Access:** Private (Caregiver only)

**Description:** Remove an NVQ certification from caregiver profile.

**Parameters:**
- `id` (path) - Caregiver ID
- `certId` (path) - NVQ Certification ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "NVQ certification deleted successfully",
  "data": { "caregiver": "object" }
}
```

---

## 3. Professional Documents

### 3.1 Add Professional Document

**Endpoint:** `POST /api/caregivers/:id/professional-documents`

**Access:** Private (Caregiver only)

**Description:** Add a professional document to caregiver profile.

**Parameters:**
- `id` (path) - Caregiver ID

**Request Body:**
```json
{
  "documentType": "Service Letter",
  "issuer": "Hospital ABC",
  "title": "Experience Certificate - Patient Care",
  "issueDate": "2023-06-01",
  "expiryDate": null,
  "documentUrl": "https://example.com/letter.pdf",
  "description": "5 years of experience in patient care"
}
```

**Required Fields:**
- `documentType` - Enum: ['Service Letter', 'Professional Certificate', 'Training Certificate', 'License', 'Qualification', 'Other']
- `title` - String
- `documentUrl` - String (URL to document)

**Optional Fields:**
- `issuer` - String (organization name)
- `issueDate` - Date
- `expiryDate` - Date
- `description` - String

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Professional document added successfully",
  "data": { "caregiver": "object" }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide document type, title, and document URL"
}
```

---

### 3.2 Update Professional Document

**Endpoint:** `PUT /api/caregivers/:id/professional-documents/:docId`

**Access:** Private (Caregiver only)

**Description:** Update an existing professional document.

**Parameters:**
- `id` (path) - Caregiver ID
- `docId` (path) - Professional Document ID

**Request Body:**
```json
{
  "documentType": "Professional Certificate",
  "issuer": "Training Institute",
  "title": "Advanced Patient Care",
  "issueDate": "2023-06-01",
  "expiryDate": "2025-06-01",
  "documentUrl": "https://example.com/cert.pdf",
  "description": "Advanced training in patient care",
  "verified": true,
  "verificationNotes": "Verified by admin"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Professional document updated successfully",
  "data": { "caregiver": "object" }
}
```

---

### 3.3 Delete Professional Document

**Endpoint:** `DELETE /api/caregivers/:id/professional-documents/:docId`

**Access:** Private (Caregiver only)

**Description:** Remove a professional document from caregiver profile.

**Parameters:**
- `id` (path) - Caregiver ID
- `docId` (path) - Professional Document ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Professional document deleted successfully",
  "data": { "caregiver": "object" }
}
```

---

## Data Models

### NVQ Certification Object
```javascript
{
  _id: ObjectId,
  level: "Level 1-5",              // Required
  subject: String,                 // Required
  issueDate: Date,                 // Required
  expiryDate: Date,                // Optional
  certificateNumber: String,       // Optional
  documentUrl: String,             // Optional
  verified: Boolean,               // Default: false
  verificationNotes: String,       // Optional
  uploadedAt: Date                 // Auto: Date.now
}
```

### Professional Document Object
```javascript
{
  _id: ObjectId,
  documentType: String,            // Required: 'Service Letter', 'Professional Certificate', 'Training Certificate', 'License', 'Qualification', 'Other'
  issuer: String,                  // Optional
  title: String,                   // Required
  issueDate: Date,                 // Optional
  expiryDate: Date,                // Optional
  documentUrl: String,             // Required
  description: String,             // Optional
  verified: Boolean,               // Default: false
  verificationNotes: String,       // Optional
  uploadedAt: Date                 // Auto: Date.now
}
```

---

## Error Codes

| Status | Message | Cause |
|--------|---------|-------|
| 400 | "Please provide level, subject, and issue date" | Missing required NVQ fields |
| 400 | "Please provide document type, title, and document URL" | Missing required document fields |
| 404 | "Caregiver not found" | Invalid caregiver ID |
| 404 | "Certification not found" | Invalid NVQ certification ID |
| 404 | "Document not found" | Invalid professional document ID |
| 500 | Error message | Server error |

---

## Usage Examples

### Example 1: Add NVQ Certification
```bash
curl -X POST http://localhost:5000/api/caregivers/123abc/nvq-certifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "Level 3",
    "subject": "Health and Social Care",
    "issueDate": "2023-01-15",
    "expiryDate": "2025-01-15",
    "certificateNumber": "NVQ123456",
    "documentUrl": "https://example.com/cert.pdf"
  }'
```

### Example 2: Add Service Letter
```bash
curl -X POST http://localhost:5000/api/caregivers/123abc/professional-documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "Service Letter",
    "issuer": "Hospital XYZ",
    "title": "Experience Certificate",
    "issueDate": "2023-06-01",
    "documentUrl": "https://example.com/letter.pdf",
    "description": "5 years of nursing experience"
  }'
```

### Example 3: Get All Documents
```bash
curl -X GET http://localhost:5000/api/caregivers/123abc/documents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration

### Add to Caregiver Routes
Update `backend/src/routes/caregiverRoutes.js` - ✓ Already implemented

### Frontend Component
Update `frontend/src/pages/caregiver/UpdateVerification.jsx` - ✓ Already updated with:
- Tabbed interface (Identity, NVQ, Documents)
- Add/Edit/Delete functionality
- Verification status badges
- Document management

---

## Admin Verification

Admins can verify documents by updating with:
```json
{
  "verified": true,
  "verificationNotes": "Document verified and approved"
}
```

This will update the document's verification status and add notes for the caregiver to see.

---

## Field Limits & Validation

| Field | Limit | Format |
|-------|-------|--------|
| subject | 255 chars | String |
| certificateNumber | 50 chars | Alphanumeric |
| documentUrl | 500 chars | Valid URL |
| title | 200 chars | String |
| description | 1000 chars | String |
| issueDate | - | YYYY-MM-DD |
| expiryDate | - | YYYY-MM-DD |

---

## Rate Limiting

No specific rate limiting on document endpoints. General API rate limits apply.

---

## Webhooks

No webhooks currently. Consider implementing for:
- Document upload notifications
- Verification status changes
- Expiry date reminders

