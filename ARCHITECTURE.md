# Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CareConnect System                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐              ┌──────────────────────┐
│   FRONTEND (React)   │              │   BACKEND (Node.js)  │
├──────────────────────┤              ├──────────────────────┤
│                      │              │                      │
│ Caregivers Page      │  HTTP API    │ Express Server       │
│ - Search             │◄────────────►│ - Routes             │
│ - Filters            │  Axios       │ - Controllers        │
│ - Profile Modal      │              │ - Models             │
│ - Booking Modal      │              │                      │
│                      │              │                      │
└──────────────────────┘              └──────────────────────┘
         │                                     │
         │                                     │
         ▼                                     ▼
┌──────────────────────┐              ┌──────────────────────┐
│  Local Storage       │              │  MongoDB Database    │
│ - Token              │              │ - Users              │
│ - User Info          │              │ - Caregivers         │
└──────────────────────┘              │ - Bookings           │
                                      └──────────────────────┘
```

## Data Flow - Search & Filter

```
User Input (Search/Filter)
        │
        ▼
Frontend Component State Update
        │
        ├─ Search Query
        ├─ Location
        └─ Service Type
        │
        ▼
Build Query Parameters
        │
        ▼
axios.get('/api/caregivers?...')
        │
        ▼
Backend Controller
        │
        ├─ Parse Query Params
        ├─ Build MongoDB Filter
        ├─ Execute Query
        └─ Categorize Results
        │
        ▼
Response JSON
        │
        │
        ▼
Frontend Display
        │
        ├─ "Available Today" Section
        ├─ "Limited Availability" Section
        └─ "Not Available" Section
```

## User Journey - Discovery to Booking

```
START: User visits /client/caregivers
│
├─ Page loads with all caregivers
│
├─ USER ACTION: Enter search term
│  └─ Component re-renders filtered results
│
├─ USER ACTION: Select location filter
│  └─ Results filter further
│
├─ USER ACTION: Select service type filter
│  └─ Final filtered results display
│
├─ USER ACTION: Click "View Profile"
│  │
│  └─ CaregiverProfileModal opens
│     │
│     ├─ Shows all profile details
│     ├─ Shows availability
│     ├─ Shows certifications
│     │
│     └─ USER ACTION: Click "Book Now"
│        │
│        └─ Closes profile modal
│           │
│           ▼
│           BookingModal opens
│           │
│           ├─ Date selection
│           ├─ Time selection
│           ├─ Service type selection
│           ├─ Special notes
│           │
│           ├─ USER ACTION: Fill form & confirm
│           │  │
│           │  └─ POST /api/bookings
│           │     │
│           │     ├─ Backend validates
│           │     ├─ Creates booking
│           │     └─ Sends response
│           │
│           └─ Success! Booking created
│
END: Return to caregivers page
```

## Component Hierarchy

```
Caregivers.jsx (Main Page)
│
├─ Navbar (top navigation)
│
├─ Search Bar
│  ├─ Name search input
│  ├─ Location dropdown (15 options)
│  └─ Service type dropdown (4 options)
│
├─ Caregiver Grid
│  │
│  ├─ "Available Today" Section
│  │  └─ [CaregiverCard × N]
│  │
│  ├─ "Limited Availability" Section
│  │  └─ [CaregiverCard × N]
│  │
│  └─ "Not Available" Section
│     └─ [CaregiverCard × N]
│
├─ CaregiverProfileModal
│  ├─ Profile header
│  ├─ Contact info
│  ├─ Professional info
│  ├─ Bio
│  ├─ Availability schedule
│  ├─ Certifications
│  └─ Buttons (Close, Book Now)
│
└─ BookingModal
   ├─ Service type dropdown
   ├─ Start date picker
   ├─ End date picker
   ├─ Start time input
   ├─ End time input
   ├─ Notes textarea
   ├─ Cost breakdown
   └─ Buttons (Cancel, Confirm)
```

## Database Schema

```
MongoDB Collections:

USERS Collection
├─ _id: ObjectId
├─ name: String
├─ email: String (unique)
├─ phone: String
├─ password: String (hashed)
├─ role: String (enum: ['client', 'caregiver', 'admin'])
├─ profileImage: String
├─ createdAt: Date
└─ updatedAt: Date

CAREGIVERS Collection
├─ _id: ObjectId
├─ user: ObjectId (ref: Users)
├─ specialization: String
├─ experience: Number
├─ location: String (enum: 15 Sri Lankan cities)
├─ serviceTypes: [String] (enum: 4 service types)
├─ availability: [
│  ├─ day: String
│  ├─ startTime: String (HH:MM)
│  └─ endTime: String (HH:MM)
│ ]
├─ hourlyRate: Number
├─ bio: String
├─ profileImage: String
├─ certifications: [
│  ├─ name: String
│  ├─ issuer: String
│  └─ date: Date
│ ]
├─ rating: Number (0-5)
├─ reviewCount: Number
├─ createdAt: Date
└─ updatedAt: Date

BOOKINGS Collection
├─ _id: ObjectId
├─ client: ObjectId (ref: Users)
├─ caregiver: ObjectId (ref: Caregivers)
├─ startDate: Date
├─ endDate: Date
├─ startTime: String (HH:MM)
├─ endTime: String (HH:MM)
├─ serviceType: String
├─ status: String (enum: pending, confirmed, in-progress, completed, cancelled)
├─ totalAmount: Number
├─ notes: String
├─ createdAt: Date
└─ updatedAt: Date
```

## Availability Categorization Logic

```
Current Date: TODAY
Tomorrow Date: TODAY + 1 day

FOR EACH CAREGIVER:
  │
  ├─ Check availability[day] contains TODAY's day name
  │  OR availability[day] contains TOMORROW's day name
  │
  ├─ IF YES
  │  └─ Category: "Available Today" (🟢 GREEN)
  │
  ├─ ELSE IF caregiver has any availability records
  │  └─ Category: "Limited Availability" (🟡 AMBER)
  │
  └─ ELSE
     └─ Category: "Not Available" (⚫ GRAY)

DISPLAY SECTIONS IN ORDER:
1. Available Today (sorted by rating)
2. Limited Availability (sorted by rating)
3. Not Available (sorted by rating)
```

## Search & Filter Flow

```
INPUT:
  name = "Priya"
  location = "Kandy"
  serviceType = "Childcare"

MongoDB Query Builder:
  └─ filter = {
      $or: [{
        'user.name': /priya/i
      }],
      location: 'Kandy',
      serviceTypes: { $in: ['Childcare'] }
    }

Caregiver.find(filter)
  └─ RESULT: Caregiver documents matching ALL criteria

Categorize by availability
  └─ Group into available/limited/unavailable

Return to Frontend
  └─ Display categorized results
```

## Booking Cost Calculation

```
USER SELECTS:
  startDate: 2026-02-01 (Sunday)
  endDate: 2026-02-05 (Thursday)
  startTime: 09:00
  endTime: 17:00
  hourlyRate: 1200

CALCULATION:
  │
  ├─ Total Days = CEIL((endDate - startDate) / (1000 * 60 * 60 * 24))
  │  = 4 days
  │
  ├─ Hours per Day = (17 - 9) + (00 - 00) / 60
  │  = 8 hours
  │
  ├─ Total Hours = Total Days × Hours per Day
  │  = 4 × 8 = 32 hours
  │
  ├─ Total Amount = Total Hours × Hourly Rate
  │  = 32 × 1200 = 38,400 Rs.
  │
  └─ DISPLAY: "Estimated Total: Rs. 38,400"

BREAKDOWN SHOWN:
  Hourly Rate: Rs. 1200
  Estimated Total: Rs. 38,400
```

## API Call Sequence

```
SEQUENCE: Search for caregivers

1. Frontend: User types "Priya"
   │
   └─ useState(searchQuery, "Priya")
      └─ useEffect triggers (debounce 500ms)

2. Frontend: Build URL with params
   │
   └─ GET /api/caregivers?name=Priya&location=Colombo&serviceType=Childcare

3. Backend: Express receives request
   │
   └─ caregiverController.getCaregivers(req, res)
      └─ Extract query params
      └─ Build MongoDB filter
      └─ Execute query
      └─ Categorize results

4. Backend: Send response
   │
   └─ res.json({
      success: true,
      count: 5,
      data: [ /* caregivers */ ],
      categorized: {
        available: [ /* 3 */ ],
        limited: [ /* 2 */ ],
        unavailable: [ ]
      }
    })

5. Frontend: Receive response
   │
   └─ setCaregivers(response.data.data)
      └─ Component re-renders
      └─ Display categorized results
```

## Error Handling Flow

```
USER ACTION
  │
  ▼
VALIDATION
  │
  ├─ Form fields valid?
  │  ├─ NO → Display error message → Stop
  │  └─ YES → Continue
  │
  ├─ Date logic valid?
  │  ├─ NO → Display error message → Stop
  │  └─ YES → Continue
  │
  └─ Required fields filled?
     ├─ NO → Display error message → Stop
     └─ YES → Continue

  │
  ▼
API CALL
  │
  ├─ Request sent
  └─ Response received

RESPONSE HANDLING
  │
  ├─ Success (200-299)
  │  ├─ Close modal
  │  ├─ Show success message
  │  └─ Refresh data
  │
  ├─ Error (4xx-5xx)
  │  ├─ Extract error message
  │  ├─ Display error to user
  │  └─ Allow retry
  │
  └─ Network Error
     ├─ Show "Connection failed"
     └─ Allow retry
```

---

These diagrams show the complete architecture, data flow, and user journey for the CareConnect caregiver features.
