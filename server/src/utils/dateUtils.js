/**
 * Date utilities for SWEETY application
 * Calendar dates are strictly formatted and stored as 'YYYY-MM-DD' strings.
 * This completely avoids timezone drift, UTC conversion surprises, and DST offsets.
 */

/**
 * Get today's calendar date as 'YYYY-MM-DD'
 * @param {string} [timeZone] - Optional IANA time zone (defaults to system local or UTC)
 * @returns {string} 'YYYY-MM-DD'
 */
export const getTodayDateString = (timeZone) => {
  const now = new Date();
  if (timeZone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(now);
    } catch {
      // Fallback if invalid timezone
    }
  }

  // Format as YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Validates whether a string is a valid real calendar date formatted as YYYY-MM-DD
 * @param {string} dateStr 
 * @returns {boolean}
 */
export const isValidDateString = (dateStr) => {
  if (typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  // Check actual days in month (handling leap years)
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
};

/**
 * Checks if a date string is in the future compared to today
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {string} [todayStr] - optional 'YYYY-MM-DD' for testing
 * @returns {boolean}
 */
export const isFutureDate = (dateStr, todayStr = getTodayDateString()) => {
  if (!isValidDateString(dateStr)) return false;
  return dateStr > todayStr;
};

/**
 * Calculates the Month-to-Date range for a given date
 * From the first day of that month through the selected date.
 * Example: 2026-10-15 -> { startDate: '2026-10-01', endDate: '2026-10-15' }
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {{ startDate: string, endDate: string, year: number, month: number }}
 */
export const getMonthToDateRange = (dateStr) => {
  const [yearStr, monthStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const startDate = `${yearStr}-${monthStr}-01`;
  const endDate = dateStr;

  return {
    startDate,
    endDate,
    year,
    month,
  };
};

/**
 * Calculates the entire Previous Calendar Month range relative to the selected date's month
 * Example: 2026-10-15 -> { startDate: '2026-09-01', endDate: '2026-09-30' }
 * Example: 2026-01-10 -> { startDate: '2025-12-01', endDate: '2025-12-31' }
 * Example: 2024-03-05 -> { startDate: '2024-02-01', endDate: '2024-02-29' } (Leap year)
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {{ startDate: string, endDate: string, year: number, month: number, monthName: string }}
 */
export const getPreviousCalendarMonthRange = (dateStr) => {
  const [yearStr, monthStr] = dateStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  // Previous month
  if (month === 1) {
    year -= 1;
    month = 12;
  } else {
    month -= 1;
  }

  const prevMonthStr = String(month).padStart(2, '0');
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDayStr = String(daysInMonth).padStart(2, '0');

  const startDate = `${year}-${prevMonthStr}-01`;
  const endDate = `${year}-${prevMonthStr}-${lastDayStr}`;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    startDate,
    endDate,
    year,
    month,
    monthName: monthNames[month - 1],
  };
};

