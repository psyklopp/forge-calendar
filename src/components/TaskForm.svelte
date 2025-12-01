<script>
  import { fade, scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { tasks } from '../lib/taskStore.js';
  
  export let isOpen = false;
  export let taskToEdit = null; // If editing, pass the task object
  export let defaultDate = null; // Pre-fill date when adding
  
  let modalElement = null;
  
  // Form state
  let title = '';
  let description = '';
  let date = '';
  let color = 'blue';
  let tags = [];
  let tagInput = '';
  let isRecurring = false;
  let recurrenceFrequency = 'daily';
  let recurrenceEndDate = '';
  
  // Available colors
  const colors = [
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'green', class: 'bg-green-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'yellow', class: 'bg-yellow-500' },
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'gray', class: 'bg-gray-500' },
    { name: 'pink', class: 'bg-pink-500' }
  ];
  
  // Watch for form open/task changes
  $: if (isOpen) {
    if (taskToEdit) {
      // Editing existing task
      title = taskToEdit.title;
      description = taskToEdit.description || '';
      date = taskToEdit.date;
      color = taskToEdit.color || 'blue';
      tags = taskToEdit.tags || [];
      tagInput = '';
      isRecurring = taskToEdit.isRecurring || false;
      recurrenceFrequency = taskToEdit.recurrenceFrequency || 'daily';
      recurrenceEndDate = taskToEdit.recurrenceEndDate || '';
    } else {
      // Adding new task
      title = '';
      description = '';
      date = defaultDate || new Date().toISOString().split('T')[0];
      color = 'blue';
      tags = [];
      tagInput = '';
      isRecurring = false;
      recurrenceFrequency = 'daily';
      recurrenceEndDate = '';
    }
    
    // Focus modal after it opens
    setTimeout(() => {
      if (modalElement) {
        modalElement.focus();
      }
    }, 100);
  }
  
  function handleSubmit() {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }
    
    if (!date) {
      alert('Please select a date');
      return;
    }
    
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      date,
      color,
      tags,
      isRecurring,
      recurrenceFrequency: isRecurring ? recurrenceFrequency : null,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : null
    };
    
    if (taskToEdit) {
      // Check if editing a recurring instance (generated task)
      if (taskToEdit.parentTaskId) {
        // Find and update the parent task instead
        const parentId = taskToEdit.parentTaskId;
        tasks.updateTask(parentId, taskData);
      } else {
        // Update the actual task
        tasks.updateTask(taskToEdit.id, taskData);
      }
    } else {
      // Create new task
      tasks.addTask(taskData);
    }
    
    close();
  }
  
  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      tags = [...tags, tag];
      tagInput = '';
    }
  }
  
  function removeTag(tagToRemove) {
    tags = tags.filter(t => t !== tagToRemove);
  }
  
  function handleTagKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    }
  }
  
  function close() {
    isOpen = false;
    taskToEdit = null;
  }
  
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }
</script>

{#if isOpen}
  <!-- Modal Backdrop -->
  <div 
    bind:this={modalElement}
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 outline-none"
    on:click={handleBackdropClick}
    on:keydown={(e) => {
      if (e.key === 'Escape') {
        close();
      }
    }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Modal Content -->
    <div 
      transition:scale={{ duration: 200, start: 0.95 }}
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <!-- Modal Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {taskToEdit ? 'Edit Task' : 'New Task'}
        </h2>
      </div>
      
      <!-- Modal Body -->
      <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            bind:value={title}
            placeholder="Enter task title"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autofocus
          />
        </div>
        
        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Description
          </label>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Add details (optional)"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          ></textarea>
        </div>
        
        <!-- Date -->
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Date <span class="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            bind:value={date}
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <!-- Color -->
        <div>
          <label for="color-picker" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Color
          </label>
          <div id="color-picker" class="flex gap-3" role="group" aria-label="Color selection">
            {#each colors as colorOption}
              <button
                type="button"
                on:click={() => color = colorOption.name}
                class="w-10 h-10 rounded-lg transition-all {colorOption.class}
                       {color === colorOption.name ? 'ring-4 ring-gray-400 scale-110' : 'hover:scale-105'}"
                title={colorOption.name}
              ></button>
            {/each}
          </div>
        </div>
        
        <!-- Tags/Categories -->
        <div>
          <label for="tags-input" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Tags/Categories
          </label>
          
          <!-- Display existing tags -->
          {#if tags.length > 0}
            <div class="flex flex-wrap gap-2 mb-2">
              {#each tags as tag}
                <span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {tag}
                  <button
                    type="button"
                    on:click={() => removeTag(tag)}
                    class="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              {/each}
            </div>
          {/if}
          
          <!-- Tag input -->
          <div class="flex gap-2">
            <input
              id="tags-input"
              type="text"
              bind:value={tagInput}
              on:keydown={handleTagKeydown}
              placeholder="Add a tag (press Enter)"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              on:click={addTag}
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Add
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">Add multiple tags to organize your tasks</p>
        </div>
        
        <!-- Recurring -->
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              id="recurring"
              type="checkbox"
              bind:checked={isRecurring}
              class="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            />
            <label for="recurring" class="ml-2 text-sm font-medium text-gray-700">
              Recurring task
            </label>
          </div>
          
          {#if isRecurring}
            <div class="ml-7 space-y-4 p-4 bg-gray-50 rounded-lg">
              <!-- Frequency -->
              <div>
                <label for="frequency" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Repeat
                </label>
                <select
                  id="frequency"
                  bind:value={recurrenceFrequency}
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <!-- End Date -->
              <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  End Date (optional)
                </label>
                <input
                  id="endDate"
                  type="date"
                  bind:value={recurrenceEndDate}
                  min={date}
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p class="text-xs text-gray-500 mt-1">Leave empty for no end date</p>
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            on:click={close}
            class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
