<script>
  import { onMount } from 'svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import { tasks } from '../lib/taskStore.js';
  import { filteredTasks } from '../lib/filterStore.js';
  import { isToday, getMonthName } from '../lib/dateUtils.js';
  import { generateRecurringInstances, isTaskExpired, createQuickNote, sortTasksByOrder, formatTimeSpent } from '../lib/taskHelpers.js';
  import TaskForm from './TaskForm.svelte';
  import FocusTimer from './FocusTimer.svelte';
  
  export let selectedDate = null; // YYYY-MM-DD
  
  // Task form state
  let isFormOpen = false;
  let taskToEdit = null;
  
  // Focus timer state
  let showFocusTimer = false;
  let focusTask = null;
  let focusDuration = 45;
  let lastCompletedDuration = 0;
  let showCompletionNotice = false;
  
  // Quick note state
  let showQuickNoteInput = false;
  let quickNoteText = '';
  
  function handleQuickNote() {
    if (!quickNoteText.trim()) return;
    
    const note = createQuickNote(quickNoteText.trim(), selectedDate || new Date().toISOString().split('T')[0]);
    tasks.addTask(note);
    
    quickNoteText = '';
    showQuickNoteInput = false;
  }
  
  // Listen for quick note shortcut
  function handleQuickNoteShortcut() {
    if (selectedDate && !showQuickNoteInput) {
      showQuickNoteInput = true;
    }
  }
  
  onMount(() => {
    window.addEventListener('quickNoteShortcut', handleQuickNoteShortcut);
    return () => {
      window.removeEventListener('quickNoteShortcut', handleQuickNoteShortcut);
    };
  });
  
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
  
  // Get tasks for the selected day
  $: tasksForDay = (() => {
    if (!selectedDate) return [];
    
    const dayTasks = [];
    
    // Add regular tasks
    $filteredTasks.forEach(task => {
      if (task.date === selectedDate && !task.parentTaskId && !task.isRecurring) {
        dayTasks.push(task);
      }
    });
    
    // Add recurring task instances
    const recurringTasks = $filteredTasks.filter(t => t.isRecurring && !t.parentTaskId);
    recurringTasks.forEach(parent => {
      const instances = generateRecurringInstances(parent, selectedDate, selectedDate);
      if (instances.length > 0) {
        dayTasks.push(...instances);
      }
    });
    
    return sortTasksByOrder(dayTasks);
  })();
  
  // Make tasks draggable (need unique items array for dnd)
  $: dragItems = tasksForDay.map(task => ({ id: task.id, task }));
  
  const flipDurationMs = 200;
  
  function handleDndConsider(e) {
    dragItems = e.detail.items;
  }
  
  function handleDndFinalize(e) {
    dragItems = e.detail.items;
    
    // Update order for all tasks
    const now = Date.now();
    dragItems.forEach((item, index) => {
      const newOrder = now - index; // Higher order = earlier in list
      tasks.updateTask(item.task.id, { order: newOrder });
    });
  }
  
  $: formattedDate = selectedDate ? formatDateLong(selectedDate) : '';
  
  function formatDateLong(dateStr) {
    const date = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];
    const month = getMonthName(date.getMonth());
    const day = date.getDate();
    const year = date.getFullYear();
    return `${dayName}, ${month} ${day}, ${year}`;
  }
  
  function previousDay() {
    if (!selectedDate) return;
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    selectedDate = date.toISOString().split('T')[0];
  }
  
  function nextDay() {
    if (!selectedDate) return;
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    selectedDate = date.toISOString().split('T')[0];
  }
  
  function goToToday() {
    const today = new Date();
    selectedDate = today.toISOString().split('T')[0];
  }
  
  function addTask() {
    taskToEdit = null;
    isFormOpen = true;
  }
  
  function editTask(task) {
    taskToEdit = task;
    isFormOpen = true;
  }
  
  function startFocusTimer(task, duration) {
    focusTask = task;
    focusDuration = duration;
    showFocusTimer = true;
  }
  
  function handleFocusComplete(duration) {
    showFocusTimer = false;
    lastCompletedDuration = duration;
    showCompletionNotice = true;
    
    // Hide notification after 5 seconds
    setTimeout(() => {
      showCompletionNotice = false;
    }, 5000);
  }
  
  function deleteTask(task) {
    // Check if this is a recurring instance
    if (task.parentTaskId) {
      const confirmMsg = 'This is a recurring task. Delete the entire series?';
      if (confirm(confirmMsg)) {
        tasks.deleteTask(task.parentTaskId);
      }
    } else {
      if (confirm('Delete this task?')) {
        tasks.deleteTask(task.id);
      }
    }
  }
</script>

{#if selectedDate}
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
    <!-- Day Header -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {formattedDate}
          {#if isToday(selectedDate)}
            <span class="text-blue-600 text-lg ml-2">• Today</span>
          {/if}
        </h2>
        
        <div class="flex gap-2">
          <button
            on:click={goToToday}
            class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Today
          </button>
          <button
            on:click={previousDay}
            class="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ←
          </button>
          <button
            on:click={nextDay}
            class="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            →
          </button>
        </div>
      </div>
      
      <!-- Add Task Button -->
      <button
        on:click={addTask}
        class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3"
      >
        + Add Task
      </button>
      
      <!-- Quick Note Input -->
      {#if !showQuickNoteInput}
        <button
          on:click={() => showQuickNoteInput = true}
          class="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
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
    
    <!-- Tasks List -->
    <div class="p-6">
      {#if tasksForDay.length === 0}
        <div class="text-center py-12">
          <div class="text-6xl mb-4">📝</div>
          <p class="text-gray-500 text-lg mb-2">No tasks for this day</p>
          <p class="text-gray-400 text-sm">Click "Add Task" above to get started</p>
        </div>
      {:else}
        <div 
          class="space-y-3"
          use:dndzone={{ items: dragItems, flipDurationMs, dropTargetStyle: {} }}
          on:consider={handleDndConsider}
          on:finalize={handleDndFinalize}
        >
          {#each dragItems as item (item.id)}
            {@const task = item.task}
            <div 
              animate:flip={{ duration: flipDurationMs }}
              class="p-4 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:bg-gray-600 transition-colors cursor-pointer
                     {borderColorClasses[task.color] || borderColorClasses.blue}
                     {task.completed ? 'opacity-60' : ''}
                     {task.isQuickNote && isTaskExpired(task) ? 'opacity-50 bg-gray-100' : ''}"
              on:click={() => editTask(task)}
              on:keydown={(e) => e.key === 'Enter' && editTask(task)}
              role="button"
              tabindex="0"
            >
              <div class="flex items-start gap-3">
                <!-- Drag Handle -->
                <div class="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1">
                  ⋮⋮
                </div>
                <!-- Checkbox -->
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  on:click={(e) => {
                    e.stopPropagation();
                  }}
                  on:change={(e) => {
                    e.stopPropagation();
                    // If it's a recurring instance, toggle the parent
                    const idToToggle = task.parentTaskId || task.id;
                    tasks.toggleComplete(idToToggle);
                  }}
                  class="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                
                <!-- Task Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-lg {task.completed ? 'line-through text-gray-500' : 'text-gray-900'}">
                      {task.title}
                    </h3>
                    {#if task.isQuickNote}
                      <span class="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded">📝 Note</span>
                    {/if}
                    {#if task.isQuickNote && isTaskExpired(task)}
                      <span class="text-xs px-2 py-0.5 bg-red-200 text-red-800 rounded">Expired</span>
                    {/if}
                  </div>
                  
                  {#if task.description}
                    <p class="text-gray-600 mt-2 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  {/if}
                  
                  <div class="flex items-center gap-4 mt-3 flex-wrap">
                    <!-- Color Badge -->
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full {colorClasses[task.color] || colorClasses.blue}"></div>
                      <span class="text-xs text-gray-500 capitalize">{task.color}</span>
                    </div>
                    
                    <!-- Tags -->
                    {#if task.tags && task.tags.length > 0}
                      <div class="flex flex-wrap gap-1">
                        {#each task.tags as tag}
                          <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {tag}
                          </span>
                        {/each}
                      </div>
                    {/if}
                    
                    <!-- Recurring Badge -->
                    {#if task.isRecurring && !task.parentTaskId}
                      <div class="text-xs text-blue-600 font-medium">
                        🔁 Repeats {task.recurrenceFrequency}
                        {#if task.recurrenceEndDate}
                          until {task.recurrenceEndDate}
                        {/if}
                      </div>
                    {/if}
                    
                    {#if task.parentTaskId}
                      <div class="text-xs text-blue-600 font-medium">
                        🔁 Recurring task
                      </div>
                    {/if}
                    
                    <!-- Time Spent Display -->
                    {#if task.timeSpent && task.timeSpent > 0}
                      <div class="text-xs text-green-600 font-medium">
                        ⏱️ {formatTimeSpent(task.timeSpent)} focused
                      </div>
                    {/if}
                  </div>
                </div>
                
                <!-- Action Buttons Column (Right Side) -->
                <div class="flex flex-col gap-1 ml-3">
                  <!-- Focus Timer Buttons (only for active tasks) -->
                  {#if !task.completed}
                    <button
                      on:click={(e) => {
                        e.stopPropagation();
                        startFocusTimer(task, 30);
                      }}
                      class="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors whitespace-nowrap"
                      title="Focus for 30 minutes"
                    >
                      ⏱️ 30m
                    </button>
                    <button
                      on:click={(e) => {
                        e.stopPropagation();
                        startFocusTimer(task, 45);
                      }}
                      class="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors whitespace-nowrap"
                      title="Focus for 45 minutes"
                    >
                      ⏱️ 45m
                    </button>
                  {/if}
                  
                  <!-- Delete Button -->
                  <button
                    on:click={(e) => {
                      e.stopPropagation();
                      deleteTask(task);
                    }}
                    class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="bg-white rounded-lg shadow p-12 text-center">
    <p class="text-gray-500 text-lg">Select a day to view tasks</p>
    <p class="text-gray-400 text-sm mt-2">Click on a date from Month or Week view</p>
  </div>
{/if}

<!-- Task Form Modal -->
<TaskForm 
  bind:isOpen={isFormOpen}
  bind:taskToEdit={taskToEdit}
  defaultDate={selectedDate}
/>

<!-- Focus Timer Full Screen -->
{#if showFocusTimer}
  <FocusTimer 
    task={focusTask}
    duration={focusDuration}
    onComplete={handleFocusComplete}
  />
{/if}

<!-- Focus Completion Notice -->
{#if showCompletionNotice}
  <div class="fixed bottom-6 right-6 z-40 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg animate-slide-up">
    <div class="flex items-center gap-3">
      <div class="text-2xl">✅</div>
      <div>
        <div class="font-semibold">Focus session complete!</div>
        <div class="text-sm text-green-100">{lastCompletedDuration} minutes tracked</div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
</style>
