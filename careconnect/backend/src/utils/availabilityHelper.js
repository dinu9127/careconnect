// Helper function to check if two time ranges overlap
export const timeRangesOverlap = (start1, end1, start2, end2) => {
  // Convert time strings (HH:mm) to minutes for comparison
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start1Min = toMinutes(start1);
  const end1Min = toMinutes(end1);
  const start2Min = toMinutes(start2);
  const end2Min = toMinutes(end2);

  return start1Min < end2Min && end1Min > start2Min;
};

// Helper function to normalize date to midnight UTC
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Helper function to check if a caregiver is available for multi-day booking
export const isCaregiverAvailable = (caregiver, startDate, endDate, startTime, endTime, bookingSlots = null) => {
  // If bookingSlots provided, use per-day logic
  if (bookingSlots && bookingSlots.length > 0) {
    return isCaregiverAvailableForSlots(caregiver, bookingSlots);
  }

  // Fallback: legacy single time range logic
  return isCaregiverAvailableForDateRange(caregiver, startDate, endDate, startTime, endTime);
};

// Check availability for per-day booking slots
const isCaregiverAvailableForSlots = (caregiver, bookingSlots) => {
  for (const slot of bookingSlots) {
    const slotDate = normalizeDate(slot.date);

    // Check against confirmed bookings
    for (const bookedDate of caregiver.bookedDates || []) {
      const bookedStart = normalizeDate(bookedDate.startDate);
      const bookedEnd = normalizeDate(bookedDate.endDate);

      // Check if dates overlap
      if (slotDate >= bookedStart && slotDate <= bookedEnd) {
        // Check if times overlap
        if (timeRangesOverlap(slot.startTime, slot.endTime, bookedDate.startTime, bookedDate.endTime)) {
          return {
            available: false,
            reason: `Already booked on ${slot.date.toISOString().split('T')[0]} from ${bookedDate.startTime} to ${bookedDate.endTime}`
          };
        }
      }
    }

    // Check against caregiver leave slots
    for (const leave of caregiver.leaveSlots || []) {
      const leaveDate = normalizeDate(leave.date);

      if (slotDate.getTime() === leaveDate.getTime()) {
        // Check if times overlap
        if (timeRangesOverlap(slot.startTime, slot.endTime, leave.startTime, leave.endTime)) {
          return {
            available: false,
            reason: `Caregiver has scheduled leave on ${slot.date.toISOString().split('T')[0]} from ${leave.startTime} to ${leave.endTime}`
          };
        }
      }
    }
  }

  return { available: true };
};

// Legacy check: single time range across multiple days (24/7 available by default, only blocked by bookings and leave)
const isCaregiverAvailableForDateRange = (caregiver, startDate, endDate, startTime, endTime) => {
  const requestStart = normalizeDate(startDate);
  const requestEnd = normalizeDate(endDate);

  // Check against booked dates
  for (const bookedDate of caregiver.bookedDates || []) {
    const bookedStart = normalizeDate(bookedDate.startDate);
    const bookedEnd = normalizeDate(bookedDate.endDate);

    // Check if date ranges overlap
    const datesOverlap = !(requestEnd < bookedStart || requestStart > bookedEnd);

    if (datesOverlap) {
      // If dates overlap, check if times also overlap
      if (timeRangesOverlap(startTime, endTime, bookedDate.startTime, bookedDate.endTime)) {
        return {
          available: false,
          reason: `Already booked from ${bookedDate.startDate.toISOString().split('T')[0]} to ${bookedDate.endDate.toISOString().split('T')[0]} (${bookedDate.startTime} - ${bookedDate.endTime})`
        };
      }
    }
  }

  // Check against leave slots for each day in the range
  let currentDate = new Date(requestStart);
  while (currentDate <= requestEnd) {
    const currentNormalized = normalizeDate(currentDate);

    for (const leave of caregiver.leaveSlots || []) {
      const leaveDate = normalizeDate(leave.date);

      if (currentNormalized.getTime() === leaveDate.getTime()) {
        // Check if times overlap
        if (timeRangesOverlap(startTime, endTime, leave.startTime, leave.endTime)) {
          return {
            available: false,
            reason: `Caregiver has scheduled leave on ${currentDate.toISOString().split('T')[0]} from ${leave.startTime} to ${leave.endTime}`
          };
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { available: true };
};

// Helper function to add booked date to caregiver
export const addBookedDate = (caregiver, booking) => {
  if (!caregiver.bookedDates) {
    caregiver.bookedDates = [];
  }
  caregiver.bookedDates.push({
    startDate: booking.startDate,
    endDate: booking.endDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    bookingId: booking._id
  });
};

// Helper function to remove booked date from caregiver
export const removeBookedDate = (caregiver, bookingId) => {
  if (!caregiver.bookedDates) {
    caregiver.bookedDates = [];
    return;
  }
  caregiver.bookedDates = caregiver.bookedDates.filter(
    (booked) => booked.bookingId.toString() !== bookingId.toString()
  );
};
