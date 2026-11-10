import { Carpark } from '../types/carpark';

export interface CalculationResult {
  totalFee: number;
  breakdown: string;
  isGracePeriod: boolean;
  isFreeSunday: boolean;
  durationFormatted: string;
}

/**
 * Calculates estimated parking fee for a Singapore carpark given start date/time and duration in minutes.
 */
export function calculateParkingFee(
  carpark: Carpark,
  startDateTime: Date,
  durationMinutes: number
): CalculationResult {
  const durationHours = durationMinutes / 60;
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationFormatted = `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim() || '0m';

  // 1. Grace period check (SG standard: 10 or 15 mins)
  if (durationMinutes <= carpark.rates.gracePeriodMinutes) {
    return {
      totalFee: 0,
      breakdown: `Grace period (${carpark.rates.gracePeriodMinutes} mins) active. Free exit.`,
      isGracePeriod: true,
      isFreeSunday: false,
      durationFormatted,
    };
  }

  const dayOfWeek = startDateTime.getDay(); // 0 is Sunday
  const startHour = startDateTime.getHours();

  // 2. Check for HDB Sunday Free Parking Scheme (07:00 to 22:30 on Sundays/PH)
  if (carpark.agency === 'HDB' && dayOfWeek === 0) {
    if (startHour >= 7 && startHour < 22) {
      return {
        totalFee: 0,
        breakdown: 'HDB Sunday Free Parking Scheme (07:00 - 22:30).',
        isGracePeriod: false,
        isFreeSunday: true,
        durationFormatted,
      };
    }
  }

  // 3. Hourly / half-hourly rate calculation
  const isNight = startHour >= 18 || startHour < 7;
  const ratePerHour = isNight
    ? carpark.rates.estimatedPerHourNight
    : carpark.rates.estimatedPerHourDay;

  // Charge in 30-minute blocks (Singapore standard)
  const halfHourBlocks = Math.ceil(durationMinutes / 30);
  const halfHourRate = ratePerHour / 2;
  let totalFee = halfHourBlocks * halfHourRate;

  // HDB Night Parking Cap ($5.00 max between 22:30 and 07:00)
  if (carpark.agency === 'HDB' && isNight && totalFee > 5.0) {
    totalFee = 5.0;
  }

  // Round to 2 decimal places
  totalFee = Math.round(totalFee * 100) / 100;

  return {
    totalFee,
    breakdown: `${halfHourBlocks} x 30-min blocks @ S$${halfHourRate.toFixed(2)}/block (${isNight ? 'Evening/Night' : 'Day'})`,
    isGracePeriod: false,
    isFreeSunday: false,
    durationFormatted,
  };
}
