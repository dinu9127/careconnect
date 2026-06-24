import { calculateBookingPricing } from '../../src/utils/pricingHelper.js';

describe('pricingHelper - calculateBookingPricing', () => {
  const hourlyRate = 1000;

  it('should calculate standard hours only (9:00 AM - 5:00 PM)', () => {
    const pricing = calculateBookingPricing('09:00', '17:00', hourlyRate, 1);
    expect(pricing.normalHours).toBe(8);
    expect(pricing.otHours).toBe(0);
    expect(pricing.totalHoursPerDay).toBe(8);
    expect(pricing.costPerDay).toBe(8000);
    expect(pricing.totalAmount).toBe(8000);
  });

  it('should calculate overtime before 9:00 AM and after 5:00 PM (8:00 AM - 6:00 PM)', () => {
    const pricing = calculateBookingPricing('08:00', '18:00', hourlyRate, 1);
    expect(pricing.normalHours).toBe(8);
    expect(pricing.otHours).toBe(2);
    expect(pricing.totalHoursPerDay).toBe(10);
    expect(pricing.costPerDay).toBe(11000); // 8 * 1000 + 2 * 1500
    expect(pricing.totalAmount).toBe(11000);
  });

  it('should calculate pure overtime before 9:00 AM (7:00 AM - 8:30 AM)', () => {
    const pricing = calculateBookingPricing('07:00', '08:30', hourlyRate, 1);
    expect(pricing.normalHours).toBe(0);
    expect(pricing.otHours).toBe(1.5);
    expect(pricing.totalHoursPerDay).toBe(1.5);
    expect(pricing.costPerDay).toBe(2250); // 1.5 * 1500
    expect(pricing.totalAmount).toBe(2250);
  });

  it('should calculate correct amounts for multiple days', () => {
    const pricing = calculateBookingPricing('08:00', '18:00', hourlyRate, 3);
    expect(pricing.normalHours).toBe(8);
    expect(pricing.otHours).toBe(2);
    expect(pricing.totalHoursPerDay).toBe(10);
    expect(pricing.costPerDay).toBe(11000);
    expect(pricing.totalAmount).toBe(33000); // 11000 * 3
  });
});
