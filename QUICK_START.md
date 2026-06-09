# Quick Start Guide - CareConnect Caregiver Features

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js installed
- MongoDB running
- Backend and Frontend dependencies installed

### Step 1: Seed the Database
```bash
cd backend
node seed-caregivers.js
```
✅ This creates 10 sample caregivers with Sri Lankan data

### Step 2: Start Backend
```bash
cd backend
npm start
```
✅ API running on http://localhost:5000

### Step 3: Start Frontend  
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

### Step 4: Test
1. Open http://localhost:5173 in browser
2. Navigate to "Find Caregivers" or `/client/caregivers`
3. Test search, filters, and booking

---

## 🎯 Feature Overview

### Search
```
Type caregiver name → Results update in real-time
Example: "Priya", "Kumar", "De Silva"
```

### Filter by Location (15 cities)
```
Colombo, Kandy, Galle, Jaffna, Trincomalee,
Matara, Negombo, Badulla, Ratnapura, Anuradhapura,
Polonnaruwa, Ampara, Batticaloa, Mullaitvu, Vavuniya
```

### Filter by Service Type (4 types)
```
- Childcare
- Elderly Care
- Hospital Companion Care
- Disability Support
```

### View Profile
```
Click "View Profile" → See complete details → Optional: "Book Now"
```

### Book Caregiver
```
Click "Book Now" → Select dates/times → Enter notes → Confirm
System calculates: Days × Hours per Day × Hourly Rate
```

---

## 📁 Key Files Created

### Backend
```
✅ backend/src/seeds/caregiverSeeds.js
✅ backend/seed-caregivers.js
✅ backend/src/models/Caregiver.js (UPDATED)
✅ backend/src/controllers/caregiverController.js (UPDATED)
```

### Frontend
```
✅ frontend/src/pages/client/Caregivers.jsx (REWRITTEN)
✅ frontend/src/components/ui/CaregiverProfileModal.jsx
✅ frontend/src/components/ui/BookingModal.jsx
```

---

## 🔍 Testing

### Test Search
- Search for "Priya" → Shows Priya Jayawardana
- Search for "Kumar" → Shows Rajesh Kumar, Vikram Singh

### Test Filters
- Select "Colombo" → Shows only Colombo caregivers
- Select "Childcare" → Shows only childcare specialists
- Combine both → Refined results

### Test Profile
- Click any "View Profile" → Full profile modal opens
- See all details, ratings, availability, experience

### Test Booking
- Click "Book Now" → Booking modal opens
- Select dates, times, service type
- Enter notes
- See estimated cost update
- Confirm booking

---

## 🚀 Deployment Checklist

- [ ] MongoDB configured and running
- [ ] Backend environment variables set
- [ ] Frontend VITE_API_URL configured
- [ ] Run `node seed-caregivers.js` to populate data
- [ ] Backend starts without errors
- [ ] Frontend builds without errors
- [ ] Can access `/client/caregivers` page
- [ ] Search works
- [ ] Filters work
- [ ] Profile modal opens
- [ ] Booking modal opens
- [ ] Cost calculation works

---

## 📊 Sample Data Included

### 10 Caregivers
Each with:
- Sri Lankan name
- Professional photo placeholder
- Specialization
- 1-5 service types
- Location (Sri Lankan city)
- Availability schedule (different days/times)
- Hourly rate (Rs. 1000-1800)
- Experience (4-10 years)
- Rating (4.5-5.0)
- Review count (76-189)

### Example
```javascript
{
  name: "Priya Jayawardana",
  location: "Kandy",
  specialization: "Childcare",
  serviceTypes: ["Childcare", "Disability Support"],
  hourlyRate: 1200,
  experience: 6,
  rating: 4.9,
  availability: [
    { day: "Monday", startTime: "07:00", endTime: "19:00" },
    // ... more days
  ]
}
```

---

## 🎨 UI Components

### Caregivers Page
- Search bar (name search)
- Location dropdown (15 options)
- Service type dropdown (4 options)
- Caregiver cards with:
  - Profile image
  - Name, rating, reviews
  - Location
  - Availability count
  - Service types (max 2 shown + count)
  - View Profile & Book Now buttons
- Categorized sections:
  - 🟢 Available Today (green)
  - 🟡 Limited Availability (amber)
  - ⚫ Not Available (gray)

### Profile Modal
- Full profile with photo
- Contact info
- Professional details (experience, rate)
- Bio
- Availability schedule with times
- Certifications
- Close & Book Now buttons

### Booking Modal
- Service type dropdown
- Start date picker
- End date picker
- Start time input
- End time input
- Notes textarea
- Cost breakdown
- Cancel & Confirm buttons

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
# Or reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database connection fails
```bash
# Make sure MongoDB is running
mongod

# Or using Docker
docker run -d -p 27017:27017 mongo
```

### API returns 404
- Check backend is running on correct port
- Check VITE_API_URL in frontend
- Check caregiverRoutes.js has correct paths

### Modals not opening
- Check browser console for errors
- Verify React state updates
- Ensure imports are correct

---

## 📚 Documentation

- **IMPLEMENTATION_GUIDE.md** - Complete setup guide
- **FEATURES_IMPLEMENTATION.md** - Detailed features
- **IMPLEMENTATION_SUMMARY.md** - Changes summary
- **API_DOCUMENTATION.md** - API specs

---

## ✨ What You Get

✅ Search caregivers by name
✅ Filter by 15 Sri Lankan locations
✅ Filter by 4 service categories
✅ View caregiver profiles
✅ Book caregivers with dates/times
✅ Automatic cost calculation
✅ Real-time availability status
✅ Professional ratings system
✅ Responsive design
✅ Error handling
✅ Loading states
✅ 10 sample caregivers ready to use

---

## 🎓 Example Workflow

1. **User visits caregivers page**
   ↓
2. **Sees "Available Today" caregivers** (green indicator)
   ↓
3. **Searches for "Priya"** → Results filter in real-time
   ↓
4. **Filters by location "Kandy"** → Only shows Kandy caregivers
   ↓
5. **Filters by service "Childcare"** → Only childcare specialists
   ↓
6. **Clicks "View Profile"** → Sees all details and availability
   ↓
7. **Clicks "Book Now"** → Booking form opens
   ↓
8. **Selects dates and times** → Cost calculates automatically
   ↓
9. **Confirms booking** → Success!

---

## 🔗 API Quick Reference

### Search & Filter
```
GET /api/caregivers?name=Priya&location=Kandy&serviceType=Childcare
```

### Get Single Caregiver
```
GET /api/caregivers/{id}
```

### Book Caregiver
```
POST /api/bookings
{
  "caregiver": "ID",
  "startDate": "2026-02-01",
  "endDate": "2026-02-05",
  "startTime": "09:00",
  "endTime": "17:00",
  "serviceType": "Childcare",
  "totalAmount": 30000,
  "notes": "Optional notes"
}
```

---

**Ready to go? Run `node seed-caregivers.js` and start the application! 🚀**
