# Quick Reference - Complaints Feature

## Summary of Changes

### What Was Removed
❌ Messages menu item from client sidebar
❌ Messages card from client dashboard
❌ Path `/client/messages`

### What Was Added
✅ Complaints menu item in client sidebar → `/client/complaints`
✅ Complaints menu item in admin sidebar → `/admin/complaints`
✅ Complaints card on client dashboard (orange with AlertCircle icon)
✅ Full complaints management system (backend + frontend)

---

## For Clients

### How to Submit a Complaint
1. Login to client account
2. Click **"Complaints"** in sidebar
3. Click **"+ New Complaint"** button
4. Fill in the form:
   - **Title**: Brief summary (e.g., "Caregiver was late")
   - **Description**: Detailed explanation of the issue
   - **Category**: Select issue type
   - **Severity**: Set urgency level
   - **Booking ID** (optional): If related to specific booking
5. Click **"Submit Complaint"**
6. Complaint appears in your list with "Open" status

### Tracking Your Complaints
- All complaints visible in one page
- Status shows current stage: Open → In Progress → Resolved
- Admin notes visible when added
- Action taken by admin displayed
- Resolved date shown when completed

---

## For Admins

### How to Manage Complaints
1. Login to admin account
2. Click **"Complaints"** in admin sidebar
3. View **Statistics Dashboard** at top:
   - Total complaints submitted
   - How many are open
   - How many are in progress
   - How many are resolved

4. **Filter** complaints by status:
   - Click "All" to see everything
   - Click "Open" for new complaints
   - Click "In Progress" for complaints being handled
   - Click "Resolved" for completed cases

5. **Select a complaint** from the list
6. **Review details**:
   - Client name and details
   - Complaint category and severity
   - Full description
   - Date submitted

7. **Update the complaint**:
   - Change status (Open → In Progress → Resolved)
   - Select action to take:
     - **No Action**: Just acknowledge
     - **Issue Refund**: Return payment to client
     - **Suspend Caregiver**: Deactivate caregiver account
     - **Send Warning**: Alert to caregiver
     - **Open Investigation**: Formal inquiry
     - **Other**: Custom action
   
   - Add **Admin Notes**: Response message for client
   
8. Click **"Update Complaint"**
9. Client immediately sees updated status and notes

---

## Complaint Status Guide

| Status | Meaning | Action |
|--------|---------|--------|
| **Open** | Just submitted, awaiting review | Review & decide next step |
| **In Progress** | Being investigated/handled | Take action, add notes |
| **Resolved** | Issue addressed with action taken | Mark complete |
| **Closed** | Case finalized, no further action | Archive |

---

## Admin Actions Guide

| Action | Effect | Who is Affected |
|--------|--------|-----------------|
| **Refund** | Return money to client | Client (receives refund) |
| **Suspend Caregiver** | Disable caregiver account | Caregiver (account blocked) |
| **Warning** | Alert message sent | Caregiver (warning issued) |
| **Investigation** | Formal inquiry opened | Both (monitored) |
| **Other** | Custom action via notes | Determined by admin |

---

## Backend API Reference

### Client Endpoints
```
POST   /api/complaints
       Submit new complaint
       
GET    /api/complaints/my-complaints
       View all your complaints
       
GET    /api/complaints/:id
       View specific complaint details
```

### Admin Endpoints
```
GET    /api/complaints/admin/all
       View all complaints (with optional filters)
       Query: ?status=open, ?category=behavior, etc.
       
PUT    /api/complaints/:id
       Update complaint status and actions
       Body: { status, adminNotes, adminAction }
       
GET    /api/complaints/admin/stats
       Get dashboard statistics
       Returns: totalComplaints, openComplaints, etc.
```

---

## Complaint Categories

- **Service Quality**: Issue with care provided
- **Behavior**: Unprofessional or inappropriate conduct  
- **Payment**: Billing or payment problems
- **Cancellation**: Unexpected or unfair cancellations
- **Other**: Any other concerns

---

## Severity Levels

- **Low**: Minor issue, can wait
- **Medium**: Moderate issue, needs attention
- **High**: Serious issue, urgent response needed
- **Critical**: Emergency situation, immediate action needed

---

## Key Files Created

### Backend
```
backend/src/models/Complaint.js
├─ Database schema for complaints
├─ Fields: clientId, caregiverId, title, description, etc.
└─ Status & action tracking

backend/src/controllers/complaintController.js
├─ submitComplaint()
├─ getClientComplaints()
├─ getComplaintById()
├─ getAllComplaints()
├─ updateComplaintStatus()
└─ getComplaintStats()

backend/src/routes/complaintRoutes.js
└─ All API endpoints with auth middleware
```

### Frontend
```
frontend/src/pages/client/Complaints.jsx
├─ Client complaint page
├─ Submit form
├─ Complaint list
└─ Detail modal

frontend/src/pages/admin/Complaints.jsx
├─ Admin management page
├─ Statistics dashboard
├─ Complaint list with filters
└─ Update form panel
```

### Configuration
```
backend/src/server.js [MODIFIED]
└─ Added complaint routes

frontend/src/routes/AppRoutes.jsx [MODIFIED]
└─ Added complaint page routes

frontend/src/components/layout/Sidebar.jsx [MODIFIED]
└─ Updated client & admin menus

frontend/src/pages/client/Dashboard.jsx [MODIFIED]
└─ Replaced Messages with Complaints card
```

---

## Testing Scenarios

### Basic Flow
1. Client submits complaint ✅
2. Appears in client's complaint list ✅
3. Admin sees complaint in dashboard ✅
4. Admin updates status & adds notes ✅
5. Client sees update immediately ✅

### Admin Actions
1. Admin selects "Suspend Caregiver" ✅
2. Caregiver account gets deactivated ✅
3. Client sees "Action Taken: Suspend Caregiver" ✅

### Filtering
1. Admin filters by "Open" status ✅
2. Only open complaints display ✅
3. Statistics update correctly ✅

---

## Future Enhancements

- Email notifications when complaint updated
- Attachment support (images, documents)
- Auto-escalation based on severity
- Caregiver response capability
- Complaint analytics & trends
- Complaint history/archive
- Template responses
- Bulk actions by admin

---

## Support & Troubleshooting

**Complaint not submitting?**
- Ensure all required fields are filled
- Check API connection
- Verify form data is valid

**Admin can't see complaints?**
- Verify user role is "admin"
- Check authorization in backend
- Restart application

**Changes not appearing?**
- Refresh page
- Check network requests
- Verify update was successful

**Need to adjust features?**
- Edit `Complaint.js` model for new fields
- Update controller functions for new logic
- Modify UI components as needed

---

**For detailed documentation, see:**
- `COMPLAINTS_FEATURE_GUIDE.md` - Complete technical guide
- `COMPLAINTS_VISUAL_GUIDE.md` - Diagrams and flows
- `IMPLEMENTATION_COMPLETED.md` - Implementation checklist
