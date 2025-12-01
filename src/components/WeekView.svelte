<script>
  import { onMount } from 'svelte';
  import { tasks } from '../lib/taskStore.js';
  import { filteredTasks } from '../lib/filterStore.js';
  import { isToday } from '../lib/dateUtils.js';
  import { generateRecurringInstances, createQuickNote, sortTasksByOrder } from '../lib/taskHelpers.js';
  import { 
    getWeekDates, 
    formatWeekRange, 
    getDayName, 
    formatDayMonth 
  } from '../lib/weekUtils.js';
  import { getTodayString } from '../lib/dateUtils.js';
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
  
  // Current week state
  let currentDate = new Date();
  
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
  
  const borderColorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    purple: 'border-purple-500',
    orange: 'border-orange-500',
    gray: 'border-gray-500',
    pink: 'border-pink-500'
  };
  
  $: weekDates = getWeekDates(currentDate);
  $: weekRange = formatWeekRange(currentDate);
  
  // Build a map of date -> tasks (including recurring instances)
  $: tasksForWeek = (() => {
    const taskMap = {};
    
    // Initialize empty arrays for each day
    weekDates.forEach(date => {
      taskMap[date] = [];
    });
    
    // Add regular tasks
    $filteredTasks.forEach(task => {
      if (!task.parentTaskId && weekDates.includes(task.date)) {
        if (!task.isRecurring) {
          taskMap[task.date].push(task);
        }
      }
    });
    
    // Add recurring task instances
    const recurringTasks = $filteredTasks.filter(t => t.isRecurring && !t.parentTaskId);
    weekDates.forEach(date => {
      recurringTasks.forEach(parent => {
        const instances = generateRecurringInstances(parent, date, date);
        if (instances.length > 0) {
          taskMap[date].push(...instances);
        }
      });
    });
    
    return taskMap;
  })();
  
  function previousWeek() {
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() - 7);
  }
  
  function nextWeek() {
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  function goToToday() {
    currentDate = new Date();
  }
  
  function handleDayClick(date) {
    if (onDayClick) {
      onDayClick(date);
    } else {
      // Open form to add task
      formDefaultDate = date;
      taskToEdit = null;
      isFormOpen = true;
    }
  }
  
  function editTask(task) {
    taskToEdit = task;
    isFormOpen = true;
  }
  
  function handleTaskToggle(task, event) {
    event.stopPropagation(); // Prevent day click
    // If it's a recurring instance, toggle the parent
    const idToToggle = task.parentTaskId || task.id;
    tasks.toggleComplete(idToToggle);
  }
</script>

<TaskForm 
  bind:isOpen={isFormOpen} 
  bind:taskToEdit={taskToEdit}
  defaultDate={formDefaultDate}
/>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
  <!-- Week Header -->
  <div class="p-6 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {weekRange}
      </h2>
      
      <div class="flex gap-2">
        <button
          on:click={goToToday}
          class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Today
        </button>
        <button
          on:click={previousWeek}
          class="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ←
        </button>
        <button
          on:click={nextWeek}
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
  
  <!-- Week Grid -->
  <div class="p-6">
    <div class="grid grid-cols-7 gap-4">
      {#each weekDates as date}
        <div 
          class="flex flex-col cursor-pointer"
          on:click={() => handleDayClick(date)}
          on:keydown={(e) => e.key === 'Enter' && handleDayClick(date)}
          role="button"
          tabindex="0"
        >
          <!-- Day Header -->
          <div class="text-center pb-3 border-b-2 mb-3
                     {isToday(date) ? 'border-blue-500' : 'border-gray-200'}">
            <div class="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {getDayName(date)}
            </div>
            <div class="text-lg font-bold mt-1
                       {isToday(date) ? 'text-blue-600' : 'text-gray-900'}">
              {formatDayMonth(date).split(' ')[1]}
            </div>
          </div>
          
          <!-- Tasks Column -->
          <div class="space-y-2 flex-1">
            {#each sortTasksByOrder(tasksForWeek[date]) as task}
              <div 
                class="p-3 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:bg-gray-600 transition-colors cursor-pointer
                       {borderColorClasses[task.color] || borderColorClasses.blue}
                       {task.completed ? 'opacity-60' : ''}"
                on:click={(e) => {
                  e.stopPropagation();
                  editTask(task);
                }}
                on:keydown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    editTask(task);
                  }
                }}
                role="button"
                tabindex="0"
              >
                <div class="flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    on:click={(e) => {
                      e.stopPropagation();
                    }}
                    on:change={(e) => handleTaskToggle(task, e)}
                    class="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm {task.completed ? 'line-through text-gray-500' : 'text-gray-900'}">
                      {task.title}
                    </div>
                    {#if task.description}
                      <div class="text-xs text-gray-600 mt-1 line-clamp-2">
                        {task.description}
                      </div>
                    {/if}
                    {#if task.isRecurring && !task.parentTaskId}
                      <div class="text-xs text-blue-600 mt-1">
                        🔁 {task.recurrenceFrequency}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
            
            {#if tasksForWeek[date].length === 0}
              <div class="text-sm text-gray-400 text-center py-8">
                {#if $tasks.length === 0 && isToday(date)}
                  <div class="text-blue-500 font-medium">Click to add your first task</div>
                {:else}
                  No tasks
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
