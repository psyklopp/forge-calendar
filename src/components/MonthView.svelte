<script>
  import { onMount } from 'svelte';
  import { tasks } from '../lib/taskStore.js';
  import { filteredTasks } from '../lib/filterStore.js';
  import { 
    generateCalendarGrid, 
    getMonthName, 
    isToday,
    getTodayString 
  } from '../lib/dateUtils.js';
  import { getTasksForDate, generateRecurringInstances, createQuickNote, sortTasksByOrder } from '../lib/taskHelpers.js';
  import TaskForm from './TaskForm.svelte';
  
  export let onDayClick = null; // Callback for when a day is clicked
  
  // Task form state
  let isFormOpen = false;
  let taskToEdit = null;
  let formDefaultDate = null;
  
  // Quick note state
  let showQuickNoteInput = false;
  let quickNoteText = '';
  
  function handleQuickNote() {
    if (!quickNoteText.trim()) return;
    
    const note = createQuickNote(quickNoteText.trim(), getTodayString());
    tasks.addTask(note);
    
    quickNoteText = '';
    showQuickNoteInput = false;
  }
  
  // Listen for quick note shortcut
  function handleQuickNoteShortcut() {
    if (!showQuickNoteInput) {
      showQuickNoteInput = true;
    }
  }
  
  onMount(() => {
    window.addEventListener('quickNoteShortcut', handleQuickNoteShortcut);
    return () => {
      window.removeEventListener('quickNoteShortcut', handleQuickNoteShortcut);
    };
  });
  
  // Current month/year state
  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth();
  
  // Task colors mapping
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    gray: 'bg-gray-500',
    pink: 'bg-pink-500'
  };
  
  $: calendarGrid = generateCalendarGrid(year, month);
  
  // Build a map of date -> tasks (including recurring instances)
  $: tasksForCalendar = (() => {
    const taskMap = {};
    
    // Add regular tasks
    $filteredTasks.forEach(task => {
      if (!task.parentTaskId) {
        if (!taskMap[task.date]) taskMap[task.date] = [];
        if (!task.isRecurring) {
          taskMap[task.date].push(task);
        }
      }
    });
    
    // Add recurring task instances for visible dates
    const recurringTasks = $filteredTasks.filter(t => t.isRecurring && !t.parentTaskId);
    calendarGrid.forEach(cell => {
      if (cell.date) {
        recurringTasks.forEach(parent => {
          const instances = generateRecurringInstances(parent, cell.date, cell.date);
          if (instances.length > 0) {
            if (!taskMap[cell.date]) taskMap[cell.date] = [];
            taskMap[cell.date].push(...instances);
          }
        });
      }
    });
    
    return taskMap;
  })();
  
  function previousMonth() {
    if (month === 0) {
      month = 11;
      year--;
    } else {
      month--;
    }
  }
  
  function nextMonth() {
    if (month === 11) {
      month = 0;
      year++;
    } else {
      month++;
    }
  }
  
  function goToToday() {
    const today = new Date();
    year = today.getFullYear();
    month = today.getMonth();
  }
  
  function handleDateClick(date) {
    if (!date) return;
    
    if (onDayClick) {
      onDayClick(date);
    } else {
      // Open form to add task
      formDefaultDate = date;
      taskToEdit = null;
      isFormOpen = true;
    }
  }
</script>

<TaskForm 
  bind:isOpen={isFormOpen} 
  bind:taskToEdit={taskToEdit}
  defaultDate={formDefaultDate}
/>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
  <!-- Month Header -->
  <div class="p-6 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {getMonthName(month)} {year}
      </h2>
      
      <div class="flex gap-2">
        <button
          on:click={goToToday}
          class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Today
        </button>
        <button
          on:click={previousMonth}
          class="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ←
        </button>
        <button
          on:click={nextMonth}
          class="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          →
        </button>
      </div>
    </div>
    
    <!-- Quick Note Input -->
    {#if !showQuickNoteInput}
      <button
        on:click={() => showQuickNoteInput = true}
        class="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
      >
        📝 Quick Note
      </button>
    {:else}
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={quickNoteText}
          on:keydown={(e) => e.key === 'Enter' && handleQuickNote()}
          placeholder="Type a quick note..."
          class="flex-1 px-3 py-2 text-sm border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-50"
          autofocus
        />
        <button
          on:click={handleQuickNote}
          class="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Save
        </button>
        <button
          on:click={() => {
            showQuickNoteInput = false;
            quickNoteText = '';
          }}
          class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    {/if}
  </div>
  
  <!-- Calendar Grid -->
  <div class="p-6">
    <!-- Day of week headers -->
    <div class="grid grid-cols-7 gap-2 mb-2">
      {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
        <div class="text-center text-sm font-semibold text-gray-600 py-2">
          {day}
        </div>
      {/each}
    </div>
    
    <!-- Calendar cells -->
    <div class="grid grid-cols-7 gap-2">
      {#each calendarGrid as cell}
        <div
          class="border rounded-lg p-2 transition-colors cursor-pointer
                 {cell.isCurrentMonth ? 'bg-white hover:bg-gray-50 dark:bg-gray-700 border-gray-200' : 'bg-gray-50 dark:bg-gray-700 border-gray-100'}
                 {cell.date && isToday(cell.date) ? 'ring-2 ring-blue-500 bg-blue-50 min-h-32' : 'min-h-24'}"
          on:click={() => handleDateClick(cell.date)}
          on:keydown={(e) => e.key === 'Enter' && handleDateClick(cell.date)}
          role="button"
          tabindex="0"
        >
          {#if cell.isCurrentMonth}
            <div class="text-sm font-medium mb-2
                       {isToday(cell.date) ? 'text-blue-600' : 'text-gray-900'}">
              {cell.day}
            </div>
            
            <!-- Tasks for this day -->
            {#if tasksForCalendar[cell.date]}
              {@const dayTasks = sortTasksByOrder(tasksForCalendar[cell.date])}
              {@const maxTasks = isToday(cell.date) ? 5 : 3}
              <div class="space-y-1">
                {#each dayTasks.slice(0, maxTasks) as task}
                  <div 
                    class="text-xs px-2 py-1 rounded truncate flex items-center gap-1
                           {task.completed ? 'opacity-50 line-through' : ''}"
                  >
                    <div class="w-2 h-2 rounded-full flex-shrink-0 {colorClasses[task.color] || colorClasses.blue}"></div>
                    <span class="truncate">{task.title}</span>
                  </div>
                {/each}
                
                {#if dayTasks.length > maxTasks}
                  <div class="text-xs text-gray-500 px-2">
                    +{dayTasks.length - maxTasks} more
                  </div>
                {/if}
              </div>
            {:else if $tasks.length === 0 && isToday(cell.date)}
              <div class="text-xs text-gray-400 text-center">
                Click to add task
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
