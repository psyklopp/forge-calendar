const STORAGE_KEY = 'forge_calendar_tasks';

/**
 * Load all tasks from localStorage
 * @returns {Array} Array of task objects
 */
export function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

/**
 * Save tasks to localStorage
 * @param {Array} tasks - Array of task objects to save
 */
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

/**
 * Clear all tasks from localStorage
 */
export function clearAllTasks() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing tasks:', error);
  }
}
