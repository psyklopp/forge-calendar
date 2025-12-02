const STATS_KEY = 'forge_focus_stats';

/**
 * Load focus session statistics from localStorage
 * @returns {Object} Stats object with attempts and completions for each duration
 */
export function loadFocusStats() {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : {
      duration30: { attempts: 0, completed: 0 },
      duration45: { attempts: 0, completed: 0 }
    };
  } catch (error) {
    console.error('Error loading focus stats:', error);
    return {
      duration30: { attempts: 0, completed: 0 },
      duration45: { attempts: 0, completed: 0 }
    };
  }
}

/**
 * Save focus session statistics to localStorage
 * @param {Object} stats - Stats object to save
 */
export function saveFocusStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving focus stats:', error);
  }
}

/**
 * Record a focus session attempt
 * @param {number} duration - Duration in minutes (30 or 45)
 */
export function recordAttempt(duration) {
  const stats = loadFocusStats();
  const key = `duration${duration}`;
  
  if (stats[key]) {
    stats[key].attempts++;
    saveFocusStats(stats);
  }
}

/**
 * Record a completed focus session
 * @param {number} duration - Duration in minutes (30 or 45)
 */
export function recordCompletion(duration) {
  const stats = loadFocusStats();
  const key = `duration${duration}`;
  
  if (stats[key]) {
    stats[key].completed++;
    saveFocusStats(stats);
  }
}

/**
 * Get stats for a specific duration
 * @param {number} duration - Duration in minutes (30 or 45)
 * @returns {Object} Object with attempts and completed counts
 */
export function getStatsForDuration(duration) {
  const stats = loadFocusStats();
  const key = `duration${duration}`;
  return stats[key] || { attempts: 0, completed: 0 };
}

/**
 * Format stats for display
 * @param {number} duration - Duration in minutes (30 or 45)
 * @returns {string} Formatted string like "✓2/4"
 */
export function formatStats(duration) {
  const { completed, attempts } = getStatsForDuration(duration);
  return `✓${completed}/${attempts}`;
}
