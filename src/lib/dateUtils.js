/**
 * Get the first day of the month (0 = Sunday, 6 = Saturday)
 * @param {number} year
 * @param {number} month - 0-indexed (0 = January)
 * @returns {number}
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Get number of days in a month
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Format date as YYYY-MM-DD
 * @param {number} year
 * @param {number} month - 0-indexed
 * @param {number} day
 * @returns {string}
 */
export function formatDate(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Get today's date as YYYY-MM-DD
 * @returns {string}
 */
export function getTodayString() {
  const today = new Date();
  return formatDate(today.getFullYear(), today.getMonth(), today.getDate());
}

/**
 * Check if a date string is today
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {boolean}
 */
export function isToday(dateStr) {
  return dateStr === getTodayString();
}

/**
 * Get month name
 * @param {number} month - 0-indexed
 * @returns {string}
 */
export function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

/**
 * Generate calendar grid for a month
 * Returns array of objects representing each calendar cell
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {Array}
 */
export function generateCalendarGrid(year, month) {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  
  const grid = [];
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    grid.push({
      date: formatDate(year, month, day),
      day: day,
      isCurrentMonth: true
    });
  }
  
  // Calculate padding for first week (empty cells before month starts)
  const padding = [];
  for (let i = 0; i < firstDay; i++) {
    padding.push({
      date: null,
      day: null,
      isCurrentMonth: false
    });
  }
  
  return [...padding, ...grid];
}
