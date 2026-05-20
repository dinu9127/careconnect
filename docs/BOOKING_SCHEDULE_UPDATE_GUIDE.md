# Booking Schedule & Availability Update Implementation

## Overview
When a client books a caregiver and the booking is confirmed by the caregiver, the caregiver's schedule and available dates now update correctly to reflect the booking.

## Changes Made

### 1. **Caregiver Model Update** (`backend/src/models/Caregiver.js`)
Added a new `bookedDates` field to track confirmed bookings:

```javascript
bookedDates: [{
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
}]
```

This array stores all confirmed bookings and prevents the caregiver from being booked during overlapping times.

### 2. **Availability Helper Utility** (`backend/src/utils/availabilityHelper.js`)
Created utility functions for availability management:

#### `isCaregiverAvailable(caregiver, startDate, endDate, startTime, endTime)`
- Checks if a caregiver is available for requested dates and times
- Validates against:
  - **Booked Dates**: Prevents double-booking by checking against `bookedDates`
  - **Weekly Availability**: Ensures the caregiver has availability set for those days
  - **Time Conflicts**: Ensures requested times fall within caregiver's available hours

#### `addBookedDate(caregiver, booking)`
- Adds a confirmed booking to the caregiver's `bookedDates` array
- Called when a booking is confirmed

#### `removeBookedDate(caregiver, bookingId)`
- Removes a booking from the caregiver's `bookedDates` array
- Called when a confirmed booking is cancelled or status changes

#### `timeRangesOverlap(start1, end1, start2, end2)`
- Helper function to check if two time ranges overlap
- Converts time strings to minutes for accurate comparison

### 3. **Booking Controller Updates** (`backend/src/controllers/bookingController.js`)

#### `createBooking()`
**Before:** Simply created a booking without checking availability
**After:** 
- Validates that the caregiver exists
- Checks if caregiver is available for requested dates/times
- Returns error if not available: `"Caregiver is not available for the requested dates/times"`
- Creates booking only if availability check passes

#### `updateBooking()`
**Before:** Simple update without schedule modifications
**After:**
- Detects when booking status changes to `'confirmed'`
- Automatically adds the booking dates to the caregiver's `bookedDates`
- If status changes away from confirmed, removes the booking from `bookedDates`
- Updates caregiver profile in database

#### `cancelBooking()`
**Before:** Simply changed status to cancelled
**After:**
- Checks if booking was in `'confirmed'` status
- If confirmed, removes the booking from caregiver's `bookedDates`
- Updates caregiver profile to free up the time slots
- Changes booking status to `'cancelled'`

## Workflow

### Creating a Booking
```
1. Client requests booking for caregiver
2. System checks if caregiver is available
3. If available → Creates pending booking
4. If not available → Returns error
```

### Confirming a Booking
```
1. Caregiver confirms the booking (status: pending → confirmed)
2. Booking dates are automatically added to caregiver's bookedDates
3. Caregiver's schedule is updated and becomes unavailable for those dates
4. Other clients cannot book the same caregiver for overlapping times
```

### Cancelling a Booking
```
1. Booking is cancelled (status: confirmed → cancelled)
2. Booking dates are removed from caregiver's bookedDates
3. Caregiver becomes available again for those dates
4. Other clients can now book the caregiver for those times
```

## API Endpoints

### Create Booking (POST /api/bookings)
**Request:**
```json
{
  "caregiver": "caregiverId",
  "startDate": "2026-02-01",
  "endDate": "2026-02-05",
  "startTime": "09:00",
  "endTime": "17:00",
  "serviceType": "Childcare",
  "totalAmount": 500,
  "notes": "Daily care required"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": { booking object }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Caregiver is not available for the requested dates/times"
}
```

### Update Booking (PUT /api/bookings/:id)
**Request (to confirm):**
```json
{
  "status": "confirmed"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { updated booking with confirmed status }
}
```

### Cancel Booking (DELETE /api/bookings/:id)
**Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": { booking with cancelled status }
}
```

## Key Features

✅ **Double-Booking Prevention**: Caregivers cannot accept overlapping bookings
✅ **Schedule Synchronization**: Booked dates automatically update caregiver availability
✅ **Time Slot Management**: Considers both date ranges and specific time slots
✅ **Weekly Schedule Compliance**: Respects caregiver's set weekly availability
✅ **Automatic Cleanup**: Cancelling a booking frees up the time slot
✅ **Status-Based Logic**: Actions triggered based on booking status changes

## Testing

### Test Case 1: Book Available Caregiver
```
1. Caregiver available: Monday-Friday, 09:00-17:00
2. Client books: Mon-Fri, 10:00-14:00
3. Expected: Booking created, dates added to bookedDates after confirmation
```

### Test Case 2: Book Unavailable Caregiver
```
1. Caregiver booked: Mon-Fri, 10:00-14:00 (confirmed)
2. Client tries to book: Mon-Fri, 12:00-16:00 (overlaps)
3. Expected: Error - "Caregiver is not available"
```

### Test Case 3: Cancel Booking Frees Slot
```
1. Booking confirmed and dates in bookedDates
2. Cancel the booking
3. New booking for same dates should succeed
```

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Caregiver not found | 404 | "Caregiver not found" |
| Not available | 400 | "Caregiver is not available for the requested dates/times" |
| Booking not found | 404 | "Booking not found" |
| Validation error | 500 | Error message |

## Future Enhancements

- [ ] Add notification system when booking is confirmed
- [ ] Implement weekend/holiday handling
- [ ] Add recurring booking support
- [ ] Implement time slot availability view for clients
- [ ] Add caregiver preference for booking gaps between jobs
- [ ] Create availability calendar visualization
