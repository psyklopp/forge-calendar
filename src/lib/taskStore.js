import { writable } from 'svelte/store';
import { loadTasks, saveTasks } from './storage.js';
import { createTask, getTasksForDate, getTasksForRange, shouldDeleteTask } from './taskHelpers.js';

/**
 * Clean up expired tasks (auto-delete after 30 days)
 */
function cleanupExpiredTasks(tasks) {
  return tasks.filter(task => !shouldDeleteTask(task));
}

/**
 * Create the tasks store
 */
function createTaskStore() {
  // Load and clean up tasks on init
  const initialTasks = cleanupExpiredTasks(loadTasks());
  if (initialTasks.length !== loadTasks().length) {
    saveTasks(initialTasks); // Save cleaned list
  }
  
  const { subscribe, set, update } = writable(initialTasks);

  return {
    subscribe,
    
    /**
     * Add a new task
     * @param {Object} taskData - Task properties
     */
    addTask: (taskData) => {
      update(tasks => {
        const newTask = createTask(taskData);
        const updatedTasks = [...tasks, newTask];
        saveTasks(updatedTasks);
        return updatedTasks;
      });
    },

    /**
     * Update an existing task
     * @param {string} id - Task ID
     * @param {Object} updates - Properties to update
     */
    updateTask: (id, updates) => {
      update(tasks => {
        const updatedTasks = tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        );
        saveTasks(updatedTasks);
        return updatedTasks;
      });
    },

    /**
     * Delete a task
     * @param {string} id - Task ID
     */
    deleteTask: (id) => {
      update(tasks => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        saveTasks(updatedTasks);
        return updatedTasks;
      });
    },

    /**
     * Toggle task completion
     * @param {string} id - Task ID
     */
    toggleComplete: (id) => {
      update(tasks => {
        const updatedTasks = tasks.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks(updatedTasks);
        return updatedTasks;
      });
    },

    /**
     * Get tasks for a specific date
     * @param {Array} tasks - Current tasks
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Array} Tasks for the date
     */
    getTasksForDate: (tasks, date) => getTasksForDate(tasks, date),

    /**
     * Get tasks for a date range
     * @param {Array} tasks - Current tasks
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Array} Tasks in range
     */
    getTasksForRange: (tasks, startDate, endDate) => getTasksForRange(tasks, startDate, endDate),

    /**
     * Clear all tasks
     */
    clearAll: () => {
      set([]);
      saveTasks([]);
    },

    /**
     * Reload tasks from storage
     */
    reload: () => {
      set(loadTasks());
    }
  };
}

export const tasks = createTaskStore();
