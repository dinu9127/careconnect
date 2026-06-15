/**
 * Calculates standard and overtime hours and costs for caregiver bookings.
 * Standard hours are 9:00 AM – 5:00 PM (9.0 to 17.0 hours since midnight).
 * Any portion of booking slot before 9 AM or after 5 PM is overtime (OT),
 * billed at 1.5x the caregiver's hourly rate.
 *
 * @param {string} startTime - The start time in "HH:mm" format.
 * @param {string} endTime - The end time in "HH:mm" format.
 * @param {number} hourlyRate - The caregiver's standard hourly rate.
 * @param {number} daysCount - The total number of days booked.
 * @returns {object} The breakdown of hours, rates, costs per day, and total amount.
 */
export const calculateBookingPricing = (startTime, endTime, hourlyRate, daysCount = 1) => {
  if (!startTime || !endTime || !hourlyRate) {
    return {
      normalHours: 0,
      otHours: 0,
      totalHoursPerDay: 0,
      costPerDay: 0,
      totalAmount: 0
    };
  }

  // Parse time "HH:mm" to decimal hours since midnight
  const parseTimeToHours = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m || 0) / 60;
  };

  const start = parseTimeToHours(startTime);
  const end = parseTimeToHours(endTime);
  const duration = Math.max(0, end - start);

  const stdStart = 9.0; // 9:00 AM
  const stdEnd = 17.0;  // 5:00 PM

  // Calculate intersection of the booking slot with standard hours [9.0, 17.0]
  const normalHours = Math.max(0, Math.min(end, stdEnd) - Math.max(start, stdStart));
  const otHours = Math.max(0, duration - normalHours);

  const normalCostPerDay = normalHours * hourlyRate;
  const otCostPerDay = otHours * hourlyRate * 1.5;
  const costPerDay = normalCostPerDay + otCostPerDay;
  const totalAmount = Math.round(costPerDay * daysCount);

  return {
    normalHours,
    otHours,
    totalHoursPerDay: duration,
    costPerDay,
    totalAmount
  };
};
