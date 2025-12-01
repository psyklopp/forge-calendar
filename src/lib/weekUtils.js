/**
 * Get the start of the week (Sunday) for a given date
 * @param {Date} date
 * @returns {Date}
 */
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day; // Sunday is 0, so difference is just the day
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the week (Saturday) for a given date
 * @param {Date} date
 * @returns {Date}
 */
export function getWeekEnd(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = 6 - day; // Saturday is 6
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Generate array of 7 dates for the week containing the given date
 * @param {Date} date
 * @returns {Array} Array of date strings (YYYY-MM-DD)
 */
export function getWeekDates(date) {
  const weekStart = getWeekStart(date);
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  
  return dates;
}

/**
 * Format week range for display
 * @param {Date} date - Any date in the week
 * @returns {string} e.g., "Nov 24 - Nov 30, 2024"
 */
export function formatWeekRange(date) {
  const weekStart = getWeekStart(date);
  const weekEnd = getWeekEnd(date);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const startMonth = months[weekStart.getMonth()];
  const startDay = weekStart.getDate();
  const endMonth = months[weekEnd.getMonth()];
  const endDay = weekEnd.getDate();
  const year = weekEnd.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}

/**
 * Get day name abbreviation
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string} e.g., "Sun", "Mon"
 */
export function getDayName(dateStr) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr);
  return days[date.getDay()];
}

/**
 * Get day and month for display
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string} e.g., "Nov 24"
 */
export function formatDayMonth(dateStr) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(dateStr);
  return `${months[date.getMonth()]} ${date.getDate()}`;
}
