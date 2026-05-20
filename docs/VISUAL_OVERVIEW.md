# CareConnect Features - Visual Overview

## 🎯 Main Features

### 1. 🔍 Search & Discovery
```
┌─────────────────────────────────────────┐
│  Search for Caregivers by Name          │
├─────────────────────────────────────────┤
│ [🔍 Type caregiver name...............] │
│                                         │
│ Results update in real-time as you type │
│                                         │
│ Examples:                               │
│ • "Priya" → Priya Jayawardana          │
│ • "Kumar" → Rajesh Kumar, Vikram Singh │
│ • "De Silva" → Nimal De Silva          │
└─────────────────────────────────────────┘
```

### 2. 📍 Location Filter
```
┌──────────────────────────────────────┐
│ Select Location                      │
├──────────────────────────────────────┤
│ [▼ All Locations            ▼]       │
│                                      │
│ Available Locations:                 │
│ • Colombo (12 caregivers)           │
│ • Kandy (8 caregivers)              │
│ • Galle (5 caregivers)              │
│ • And 12 more...                    │
└──────────────────────────────────────┘
```

### 3. 🏥 Service Type Filter
```
┌──────────────────────────────────────┐
│ Select Service Type                  │
├──────────────────────────────────────┤
│ [▼ All Services        ▼]            │
│                                      │
│ Options:                             │
│ • Childcare (5 specialists)          │
│ • Elderly Care (6 specialists)       │
│ • Hospital Companion (4 specialists) │
│ • Disability Support (3 specialists) │
└──────────────────────────────────────┘
```

### 4. 📅 Availability Categorization
```
🟢 AVAILABLE TODAY (5 caregivers)
└─ Caregivers available today or tomorrow
   • Shows in green indicator
   • Sorted by rating

🟡 LIMITED AVAILABILITY (3 caregivers)
└─ Some availability but not today
   • Shows in amber indicator
   • Can still be booked

⚫ NOT AVAILABLE (2 caregivers)
└─ Currently no availability
   • Shows in gray indicator
   • View profile for future availability
```

### 5. 👤 Caregiver Card
```
┌────────────────────────────────────┐
│ ┌──────┐  Priya Jayawardana       │
│ │      │  Childcare Specialist     │
│ │ 👩   │  ⭐ 4.9 (143 Reviews)     │
│ │      │  📍 Kandy                 │
│ └──────┘  📅 6 days available      │
│          💰 Rs. 1,200/hour         │
│                                    │
│ Tags:                              │
│ [Childcare] [Disability Support]   │
│                                    │
│ [View Profile]  [Book Now]         │
└────────────────────────────────────┘
```

### 6. 🎤 Profile Modal
```
╔════════════════════════════════════════╗
║         PROFILE VIEW                   ║
╠════════════════════════════════════════╣
║                                        ║
║ ┌──────┐ Priya Jayawardana           ║
║ │ 👩   │ Childcare Specialist         ║
║ │      │ ⭐ 4.9 (143 reviews)         ║
║ └──────┘                              ║
║                                        ║
║ CONTACT INFORMATION                   ║
║ ✉️  priya.jay@careconnect.lk         ║
║ 📞 +94 72 345 6789                   ║
║ 📍 Kandy                              ║
║                                        ║
║ PROFESSIONAL INFO                     ║
║ 💼 Experience: 6 years               ║
║ 💰 Rate: Rs. 1,200/hour              ║
║                                        ║
║ ABOUT                                 ║
║ Dedicated childcare professional...  ║
║                                        ║
║ AVAILABILITY                          ║
║ Monday-Friday: 07:00 - 19:00         ║
║ Saturday: 09:00 - 17:00              ║
║                                        ║
║ [Close]  [Book Now]                   ║
╚════════════════════════════════════════╝
```

### 7. 💼 Booking Modal
```
╔════════════════════════════════════════╗
║    BOOK CAREGIVER: Priya Jayawardana  ║
╠════════════════════════════════════════╣
║                                        ║
║ Service Type *                        ║
║ [▼ Select service type    ▼]          ║
║                                        ║
║ Start Date *                          ║
║ [📅 2026-02-01]                       ║
║                                        ║
║ End Date *                            ║
║ [📅 2026-02-05]                       ║
║                                        ║
║ Start Time                            ║
║ [🕐 09:00]                            ║
║                                        ║
║ End Time                              ║
║ [🕐 17:00]                            ║
║                                        ║
║ Special Notes                         ║
║ [📝 Add any requests...]              ║
║                                        ║
║ COST BREAKDOWN                        ║
║ ├─ Hourly Rate: Rs. 1,200            ║
║ └─ Estimated Total: Rs. 38,400       ║
║                                        ║
║ [Cancel]  [Confirm Booking]           ║
╚════════════════════════════════════════╝
```

---

## 📊 User Experience Flow

### Scenario: Client Looking for Childcare in Colombo

```
1. VISIT PAGE
   ↓
   👁️ Sees all caregivers categorized by availability
   └─ 🟢 10 Available Today
   └─ 🟡 5 Limited Availability
   └─ ⚫ 3 Not Available

2. SEARCH
   ↓
   Type "Priya" in search
   ↓
   ✅ Results filtered → Shows only caregivers with "Priya" in name

3. FILTER LOCATION
   ↓
   Select "Colombo" from location dropdown
   ↓
   ✅ Results filtered → Shows only Colombo caregivers

4. FILTER SERVICE
   ↓
   Select "Childcare" from service type dropdown
   ↓
   ✅ Results filtered → Shows only childcare specialists in Colombo

5. VIEW OPTIONS
   ↓
   Now sees refined list of caregivers
   └─ Can see all important info on card
   └─ Can see ratings and availability

6. EXPLORE PROFILE (Option A)
   ↓
   Click "View Profile" on a caregiver
   ↓
   📋 Opens modal with complete details
   └─ All professional info
   └─ Full availability schedule
   └─ Certifications
   └─ Can still click "Book Now"

7. BOOK CAREGIVER
   ↓
   Click "Book Now" (from card or profile)
   ↓
   📋 Opens booking form
   ├─ Select service type
   ├─ Select dates (range)
   ├─ Select times
   ├─ Add notes
   ├─ See cost calculation
   └─ Confirm

8. SUCCESS
   ↓
   ✅ Booking created!
   └─ Receive confirmation
   └─ Can proceed to payment (future feature)
```

---

## 🗄️ Data Example

### Sample Caregiver Document
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  user: {
    _id: "507f1f77bcf86cd799439012",
    name: "Priya Jayawardana",
    email: "priya.jay@careconnect.lk",
    phone: "+94 72 345 6789"
  },
  specialization: "Childcare",
  experience: 6,
  location: "Kandy",
  serviceTypes: ["Childcare", "Disability Support"],
  hourlyRate: 1200,
  bio: "Dedicated childcare professional with 6 years of experience...",
  availability: [
    { day: "Monday", startTime: "07:00", endTime: "19:00" },
    { day: "Tuesday", startTime: "07:00", endTime: "19:00" },
    { day: "Wednesday", startTime: "07:00", endTime: "19:00" },
    { day: "Thursday", startTime: "07:00", endTime: "19:00" },
    { day: "Friday", startTime: "07:00", endTime: "19:00" },
    { day: "Saturday", startTime: "09:00", endTime: "17:00" }
  ],
  rating: 4.9,
  reviewCount: 143,
  certifications: [
    {
      name: "Early Childhood Development",
      issuer: "Sri Lanka Institute",
      date: "2022-06-15"
    }
  ],
  profileImage: "https://...",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

### Sample Booking Document
```javascript
{
  _id: "507f1f77bcf86cd799439013",
  client: "507f1f77bcf86cd799439014",
  caregiver: "507f1f77bcf86cd799439011",
  startDate: "2026-02-01T00:00:00Z",
  endDate: "2026-02-05T00:00:00Z",
  startTime: "09:00",
  endTime: "17:00",
  serviceType: "Childcare",
  status: "pending",
  totalAmount: 38400,
  notes: "Special attention needed for 2-year-old with peanut allergy",
  createdAt: "2026-01-23T10:30:00Z",
  updatedAt: "2026-01-23T10:30:00Z"
}
```

---

## 🎨 Color Scheme

```
🟢 Available Today
   └─ Green (#10b981) - Primary action color
   └─ Indicates immediate availability

🟡 Limited Availability
   └─ Amber (#f59e0b) - Warning/caution color
   └─ Indicates some availability

⚫ Not Available
   └─ Gray (#9ca3af) - Neutral color
   └─ Indicates no current availability

🔵 Primary Actions
   └─ Teal/Cyan (#0d9488 to #06b6d4)
   └─ Used for main buttons and highlights

⚪ Secondary Actions
   └─ White/Light (#ffffff, #f8fafc)
   └─ Used for card backgrounds
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 640px)
└─ Single column layout
└─ Full-width inputs
└─ Stacked buttons

Tablet (640px - 1024px)
└─ 2 column grid for caregivers
└─ 2 column filters
└─ Optimized spacing

Desktop (> 1024px)
└─ 3 column grid for caregivers
└─ 4 column filters
└─ Full layout with sidebars
```

---

## ⚡ Performance Features

```
Search
└─ Debounced input (500ms)
└─ Real-time filtering
└─ No page reload needed

Filtering
└─ Combined filter support
└─ Instant results
└─ No network latency visible

Modals
└─ Lazy loading of profile data
└─ Smooth animations
└─ Fast transitions

Cost Calculation
└─ Real-time updates
└─ No server call needed
└─ Instant feedback
```

---

## 🔐 Data Validation

```
Search Input
└─ Accepts: Any text
└─ Matches: Name (case-insensitive)
└─ Trim: Whitespace removed

Location Filter
└─ Enum: 15 Sri Lankan cities only
└─ Default: "All Locations"
└─ Validation: Server-side

Service Type
└─ Enum: 4 approved types only
└─ Default: "All Services"
└─ Validation: Server-side

Booking Dates
└─ Min: Today's date
└─ Format: YYYY-MM-DD
└─ Validation: End > Start
└─ Server-side check: Availability

Booking Time
└─ Format: HH:MM (24-hour)
└─ Validation: End > Start
└─ Server-side check: Caregiver availability
```

---

## 🚀 Getting Started

```
STEP 1: SEED DATA
$ node backend/seed-caregivers.js

STEP 2: START BACKEND
$ cd backend && npm start

STEP 3: START FRONTEND
$ cd frontend && npm run dev

STEP 4: VISIT PAGE
→ Open http://localhost:5173/client/caregivers

STEP 5: EXPLORE
→ Search, filter, and book caregivers!
```

---

**This overview provides a complete visual guide to all features implemented in CareConnect.**
