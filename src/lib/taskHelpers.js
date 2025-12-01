/**
 * Generate a unique ID for tasks
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new task object
 * @param {Object} taskData - Task properties
 * @returns {Object} Complete task object
 */
export function createTask({
  title,
  description = '',
  date,
  color = 'blue',
  tags = [],
  isRecurring = false,
  recurrenceFrequency = null,
  recurrenceEndDate = null,
  parentTaskId = null,
  isQuickNote = false,
  expiresAt = null,
  deletesAt = null,
  order = null,
  timeSpent = 0
}) {
  return {
    id: generateId(),
    title,
    description,
    date,
    completed: false,
    color,
    tags,
    isRecurring,
    recurrenceFrequency,
    recurrenceEndDate,
    parentTaskId,
    isQuickNote,
    expiresAt,
    deletesAt,
    createdAt: new Date().toISOString(),
    order: order ?? Date.now(), // Default to timestamp for newest-first
    timeSpent: timeSpent ?? 0 // Time spent in minutes
  };
}

/**
 * Add days to a date
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {number} days - Number of days to add
 * @returns {string} New date in YYYY-MM-DD format
 */
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Add months to a date
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {number} months - Number of months to add
 * @returns {string} New date in YYYY-MM-DD format
 */
function addMonths(dateStr, months) {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

/**
 * Generate recurring task instances
 * @param {Object} parentTask - The original recurring task
 * @param {string} startDate - Start date for generation
 * @param {string} endDate - End date for generation
 * @returns {Array} Array of task instances
 */
export function generateRecurringInstances(parentTask, startDate, endDate) {
  if (!parentTask.isRecurring || !parentTask.recurrenceFrequency) {
    return [];
  }

  const instances = [];
  let currentDate = parentTask.date;
  const end = parentTask.recurrenceEndDate || endDate;

  // Limit iterations to prevent infinite loops
  let iterations = 0;
  const MAX_ITERATIONS = 365; // Max 1 year of daily tasks

  while (currentDate <= end && currentDate <= endDate && iterations < MAX_ITERATIONS) {
    if (currentDate >= startDate) {
      instances.push(createTask({
        ...parentTask,
        id: generateId(),
        date: currentDate,
        parentTaskId: parentTask.id
      }));
    }

    // Move to next occurrence
    switch (parentTask.recurrenceFrequency) {
      case 'daily':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        currentDate = addDays(currentDate, 7);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      default:
        return instances;
    }

    iterations++;
  }

  return instances;
}

/**
 * Get all tasks for a specific date (including recurring instances)
 * @param {Array} tasks - All tasks
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Tasks for the specified date
 */
export function getTasksForDate(tasks, date) {
  const regularTasks = tasks.filter(task => 
    task.date === date && !task.parentTaskId
  );

  const recurringParents = tasks.filter(task => 
    task.isRecurring && !task.parentTaskId
  );

  const recurringInstances = [];
  recurringParents.forEach(parent => {
    const instances = generateRecurringInstances(parent, date, date);
    recurringInstances.push(...instances);
  });

  return [...regularTasks, ...recurringInstances];
}

/**
 * Get tasks for a date range
 * @param {Array} tasks - All tasks
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} Tasks in the date range
 */
export function getTasksForRange(tasks, startDate, endDate) {
  const regularTasks = tasks.filter(task => 
    task.date >= startDate && task.date <= endDate && !task.parentTaskId
  );

  const recurringParents = tasks.filter(task => 
    task.isRecurring && !task.parentTaskId
  );

  const recurringInstances = [];
  recurringParents.forEach(parent => {
    const instances = generateRecurringInstances(parent, startDate, endDate);
    recurringInstances.push(...instances);
  });

  return [...regularTasks, ...recurringInstances];
}

/**
 * Check if a task is expired
 * @param {Object} task - Task to check
 * @returns {boolean} True if expired
 */
export function isTaskExpired(task) {
  if (!task.expiresAt) return false;
  return new Date() > new Date(task.expiresAt);
}

/**
 * Check if a task should be deleted
 * @param {Object} task - Task to check
 * @returns {boolean} True if should be deleted
 */
export function shouldDeleteTask(task) {
  if (!task.deletesAt) return false;
  return new Date() > new Date(task.deletesAt);
}

/**
 * Create a quick note
 * @param {string} title - Note content
 * @param {string} date - Date for the note
 * @returns {Object} Task object configured as quick note
 */
export function createQuickNote(title, date) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
  const deletesAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  return createTask({
    title,
    description: '',
    date,
    color: 'yellow',
    tags: ['quick-note'],
    isQuickNote: true,
    expiresAt: expiresAt.toISOString(),
    deletesAt: deletesAt.toISOString()
  });
}

/**
 * Sort tasks by order, with completed tasks at the bottom
 * @param {Array} tasks - Tasks to sort
 * @returns {Array} Sorted tasks
 */
export function sortTasksByOrder(tasks) {
  return [...tasks].sort((a, b) => {
    // Completed tasks go to bottom
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Within same completion status, sort by order (higher = newer/top)
    return (b.order ?? 0) - (a.order ?? 0);
  });
}

/**
 * Format time spent in minutes to readable format
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
export function formatTimeSpent(minutes) {
  if (!minutes || minutes === 0) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}
