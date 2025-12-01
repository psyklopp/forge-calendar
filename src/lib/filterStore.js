import { writable, derived } from 'svelte/store';
import { tasks } from './taskStore.js';

// Selected tags for filtering
export const selectedTagsFilter = writable(new Set());

// Derived store that filters tasks based on selected tags
export const filteredTasks = derived(
  [tasks, selectedTagsFilter],
  ([$tasks, $selectedTags]) => {
    if ($selectedTags.size === 0) {
      return $tasks;
    }
    
    return $tasks.filter(task => {
      if (!task.tags || task.tags.length === 0) return false;
      return task.tags.some(tag => $selectedTags.has(tag));
    });
  }
);

// Helper to get all unique tags
export const allTags = derived(
  tasks,
  ($tasks) => [...new Set($tasks.flatMap(t => t.tags || []))].sort()
);
