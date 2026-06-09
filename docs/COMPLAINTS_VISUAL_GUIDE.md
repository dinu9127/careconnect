# Complaints Feature - Visual Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT INTERFACE                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Dashboard                          Complaints Page          │
│  ┌───────────────────┐             ┌────────────────────┐   │
│  │ Active Caregivers │             │ + New Complaint    │   │
│  │ Appointments      │             │ Submit Form        │   │
│  │ [Complaints]  ────┼─────────────│ - Title            │   │
│  │                   │             │ - Description      │   │
│  └───────────────────┘             │ - Category         │   │
│                                     │ - Severity         │   │
│                                     │ Complaints List    │   │
│                                     │ [View Details]     │   │
│                                     │ [Status Tracking]  │   │
│                                     └────────────────────┘   │
│                                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
            API LAYER         API LAYER
    POST /api/complaints   GET /api/complaints/my-complaints
    ┌─────────────────────────────────────────────────┐
    │           BACKEND - COMPLAINT SYSTEM             │
    ├─────────────────────────────────────────────────┤
    │                                                   │
    │  Controller (complaintController.js)            │
    │  ├─ submitComplaint()                           │
    │  ├─ getClientComplaints()                       │
    │  ├─ getComplaintById()                          │
    │  ├─ getAllComplaints() [admin]                  │
    │  ├─ updateComplaintStatus() [admin]            │
    │  └─ getComplaintStats() [admin]                │
    │                                                   │
    │  ▼                                              │
    │  ┌────────────────────────────────────┐        │
    │  │  Complaint Model (MongoDB)         │        │
    │  ├────────────────────────────────────┤        │
    │  │ - clientId (User)                  │        │
    │  │ - caregiverId (User) [optional]    │        │
    │  │ - bookingId (Booking) [optional]   │        │
    │  │ - title                            │        │
    │  │ - description                      │        │
    │  │ - category                         │        │
    │  │ - severity                         │        │
    │  │ - status                           │        │
    │  │ - adminNotes                       │        │
    │  │ - adminAction                      │        │
    │  │ - resolvedAt                       │        │
    │  └────────────────────────────────────┘        │
    │                                                   │
    └────────────────────┬────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
    Admin Dashboard               Admin Routes
    ┌──────────────────────┐      GET /api/complaints/admin/all
    │ Statistics           │      PUT /api/complaints/:id
    │ ├─ Total            │      GET /api/complaints/admin/stats
    │ ├─ Open             │
    │ ├─ In Progress      │
    │ └─ Resolved         │
    │                      │
    │ Filter by Status    │
    │ ├─ All              │
    │ ├─ Open             │
    │ ├─ In Progress      │
    │ └─ Resolved         │
    │                      │
    │ Complaint Details   │
    │ Update Form         │
    │ ├─ Status           │
    │ ├─ Admin Notes      │
    │ └─ Admin Action     │
    │    ├─ Refund        │
    │    ├─ Suspend       │
    │    ├─ Warning       │
    │    ├─ Investigation │
    │    └─ Other         │
    └──────────────────────┘
```

## Complaint Status Flow

```
┌─────────┐
│  OPEN   │  ← Client submits complaint
└────┬────┘
     │ Admin reviews
     ▼
┌──────────────┐
│ IN PROGRESS  │  ← Admin is investigating
└────┬─────────┘
     │ Admin takes action (Refund, Suspend, etc.)
     │ Admin writes response
     ▼
┌───────────┐
│ RESOLVED  │  ← Issue addressed with action taken
└────┬──────┘
     │ Case finalized
     ▼
┌────────┐
│ CLOSED │  ← Complaint closed (no further action)
└────────┘
```

## Admin Actions Available

```
Action              Effect                      Who Notified
─────────────────────────────────────────────────────────
Refund              Return payment to client    Client
Suspend Caregiver   Deactivate caregiver       Client, Caregiver
Warning             Send alert to caregiver    Caregiver
Investigation       Formal inquiry opened      Both
Other               Custom action              Based on notes
```

## Complaint Categories

```
Category              Description
─────────────────────────────────────────────────
Service Quality      Issue with quality of care
Behavior             Unprofessional conduct
Payment              Billing or payment issues
Cancellation         Unexpected cancellations
Other                Other concerns
```

## Severity Levels

```
Severity      Priority    Response Time Goal
─────────────────────────────────────────────
Low           Normal      5-7 business days
Medium        Higher      2-3 business days
High          Urgent      24 hours
Critical      Emergency   Immediate
```

## User Flows

### CLIENT FLOW
```
1. Click "Complaints" in sidebar
   ↓
2. View existing complaints OR click "+ New Complaint"
   ↓
3. Fill form:
   - Title: "Caregiver arrived late"
   - Description: "Was 30 minutes late on Tuesday..."
   - Category: "Service Quality"
   - Severity: "Medium"
   - Booking ID: (optional)
   ↓
4. Submit complaint
   ↓
5. See complaint in list with "Open" status
   ↓
6. Wait for admin to review
   ↓
7. Receive admin response in "In Progress" status
   ↓
8. Complaint marked "Resolved" when action taken
   ↓
9. View admin action taken and notes
```

### ADMIN FLOW
```
1. Click "Complaints" in admin sidebar
   ↓
2. View statistics dashboard
   ↓
3. Filter complaints (e.g., show "Open" only)
   ↓
4. Click complaint to select it
   ↓
5. Review complaint details:
   - Client name
   - Category
   - Severity
   - Full description
   ↓
6. Update complaint:
   - Change status to "In Progress"
   - Select action: "Suspend_Caregiver"
   - Add notes: "Caregiver has repeated tardiness issues..."
   ↓
7. Click "Update Complaint"
   ↓
8. Status updated:
   - Complaint shows as "In Progress"
   - Caregiver account suspended
   - Client sees admin notes
   ↓
9. Mark as "Resolved" when done
```

## Data Flow Diagram

```
CLIENT SUBMITS COMPLAINT
        │
        ▼
  POST /api/complaints
  (with form data)
        │
        ▼
  Backend validates & saves
  Complaint document created
  in MongoDB
        │
        ▼
  Response sent to client
  Complaint visible in list
        │
        ▼
  CLIENT SEES NEW COMPLAINT
  Status: "Open"
  
────────────────────────────

ADMIN REVIEWS & UPDATES
        │
        ▼
  Admin navigates to /admin/complaints
        │
        ▼
  GET /api/complaints/admin/all
  Fetches all complaints
        │
        ▼
  Admin selects complaint
  Views full details
        │
        ▼
  Admin fills update form:
  - New status
  - Admin notes
  - Admin action
        │
        ▼
  PUT /api/complaints/:id
  Updates complaint document
  (May trigger caregiver suspension)
        │
        ▼
  Response sent back
  List refreshed
        │
        ▼
  CLIENT SEES UPDATE
  Status changed
  Admin notes visible
  Action taken applied
```

## File Structure

```
careconnect/
├── backend/
│   └── src/
│       ├── models/
│       │   └── Complaint.js          [NEW]
│       ├── controllers/
│       │   └── complaintController.js [NEW]
│       ├── routes/
│       │   └── complaintRoutes.js    [NEW]
│       └── server.js                  [MODIFIED]
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── client/
        │   │   ├── Dashboard.jsx      [MODIFIED]
        │   │   └── Complaints.jsx     [NEW]
        │   └── admin/
        │       └── Complaints.jsx     [NEW]
        ├── components/
        │   └── layout/
        │       └── Sidebar.jsx        [MODIFIED]
        └── routes/
            └── AppRoutes.jsx          [MODIFIED]
```

## Key Features at a Glance

✅ **Client Features**
- Submit complaints with detailed information
- Track complaint status in real-time
- View admin responses and actions
- Filter complaints by status
- Modal view for detailed information

✅ **Admin Features**
- Dashboard with complaint statistics
- Filter complaints by status/category
- Side-by-side complaint details and update form
- Multiple action options (Refund, Suspend, Warning, etc.)
- Add notes visible to clients
- Automatic caregiver suspension capability

✅ **Technical Features**
- RESTful API architecture
- MongoDB persistence
- JWT authentication & authorization
- Input validation
- Error handling
- Responsive design (Tailwind CSS)
- Real-time UI updates
- Loading states & feedback

## Testing Checklist

- [ ] Client can submit complaint
- [ ] Complaint appears in client's complaint list
- [ ] Complaint has "Open" status initially
- [ ] Admin can view all complaints
- [ ] Admin can filter by status
- [ ] Admin can update complaint status
- [ ] Admin can select action to take
- [ ] Admin can add notes/response
- [ ] Client sees updated status
- [ ] Client sees admin notes
- [ ] Caregiver suspension works (if selected)
- [ ] Statistics update correctly
- [ ] Form validation works
- [ ] Error messages display properly
- [ ] Responsive on mobile devices
