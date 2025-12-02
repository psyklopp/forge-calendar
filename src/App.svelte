<script>
  import { onMount } from 'svelte';
  import { tasks } from './lib/taskStore.js';
  import { selectedTagsFilter, allTags } from './lib/filterStore.js';
  import MonthView from './components/MonthView.svelte';
  import WeekView from './components/WeekView.svelte';
  import DayView from './components/DayView.svelte';
  import BrainView from './components/BrainView.svelte';
  import TaskForm from './components/TaskForm.svelte';
  
  let currentView = 'month'; // month, week, day, brain
  let selectedDate = null; // For day view
  let isFormOpen = false;
  let showMenu = false;
  let showTagFilter = false;
  let showQuickNotesOnly = false;
  let darkMode = false;
  
  // Load dark mode preference from localStorage
  onMount(() => {
    const savedDarkMode = localStorage.getItem('forge_dark_mode');
    if (savedDarkMode === 'true') {
      darkMode = true;
      document.documentElement.classList.add('dark');
    }
    
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
  
  function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('forge_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('forge_dark_mode', 'false');
    }
  }
  
  function toggleTagFilter(tag) {
    selectedTagsFilter.update(tags => {
      const newTags = new Set(tags);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  }
  
  function clearTagFilter() {
    selectedTagsFilter.set(new Set());
  }
  
  function handleDayClick(date) {
    selectedDate = date;
    currentView = 'day';
  }
  
  function openAddTaskForm() {
    if (!selectedDate) {
      selectedDate = new Date().toISOString().split('T')[0];
    }
    isFormOpen = true;
  }
  
  // Keyboard shortcuts
  function handleKeydown(event) {
    // Don't trigger shortcuts when typing in input fields or textareas
    const activeElement = document.activeElement;
    const isTyping = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );
    
    // If typing, only allow ESC to work
    if (isTyping && event.key !== 'Escape') {
      return;
    }
    
    // SHIFT + Q = Month view
    if (event.shiftKey && event.key === 'Q') {
      event.preventDefault();
      currentView = 'month';
    }
    // SHIFT + W = Week view
    else if (event.shiftKey && event.key === 'W') {
      event.preventDefault();
      currentView = 'week';
    }
    // SHIFT + E = Day view
    else if (event.shiftKey && event.key === 'E') {
      event.preventDefault();
      if (!selectedDate) {
        selectedDate = new Date().toISOString().split('T')[0];
      }
      currentView = 'day';
    }

    // SHIFT + B = Brain view
    else if (event.shiftKey && event.key === 'B') {
      event.preventDefault();
      currentView = 'brain';
    }

    // SHIFT + A = Add task
    else if (event.shiftKey && event.key === 'A') {
      event.preventDefault();
      openAddTaskForm();
    }
    // SHIFT + N = Quick note (triggers quick note in current view)
    else if (event.shiftKey && event.key === 'N') {
      event.preventDefault();
      // This will be handled by the individual views
      window.dispatchEvent(new CustomEvent('quickNoteShortcut'));
    }
  }
  
  // Export tasks to JSON
  function exportTasks() {
    const allTasks = $tasks;
    const dataStr = JSON.stringify(allTasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forge-tasks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
  
  // Import tasks from JSON
  function importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        if (Array.isArray(importedTasks)) {
          if (confirm(`Import ${importedTasks.length} tasks? This will replace all existing tasks.`)) {
            tasks.clearAll();
            importedTasks.forEach(task => tasks.addTask(task));
            alert('Tasks imported successfully!');
          }
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error reading file: ' + error.message);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  }
  
  // Clear all tasks
  function clearAllTasks() {
    if (confirm('Delete ALL tasks? This cannot be undone!')) {
      tasks.clearAll();
      alert('All tasks cleared');
    }
  }

</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors" on:click={() => {
  showMenu = false;
  showTagFilter = false;
}}>
  <!-- Header -->
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors" on:click={(e) => e.stopPropagation()}>
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">FORGE</h1>
          <div class="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            {$tasks.length} task{$tasks.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- View Toggle -->
          <div class="flex gap-2">
            <button 
              class="px-4 py-2 rounded-lg transition-colors {currentView === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}"
              on:click={() => currentView = 'month'}
              title="Month View (Shift+Q)"
            >
              Month
            </button>
            <button 
              class="px-4 py-2 rounded-lg transition-colors {currentView === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}"
              on:click={() => currentView = 'week'}
              title="Week View (Shift+W)"
            >
              Week
            </button>
            <button 
              class="px-4 py-2 rounded-lg transition-colors {currentView === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}"
              on:click={() => {
                if (!selectedDate) {
                  selectedDate = new Date().toISOString().split('T')[0];
                }
                currentView = 'day';
              }}
              title="Day View (Shift+E)"
            >
              Day
            </button>

            <button 
              class="px-4 py-2 rounded-lg transition-colors {currentView === 'brain' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
              on:click={() => currentView = 'brain'}
              title="Brain Health (Shift+B)"
            >
              🧠 Brain
            </button>
          </div>
          
          <!-- Quick Notes Filter Button -->
          <button
            on:click={() => {
              showQuickNotesOnly = !showQuickNotesOnly;
              if (showQuickNotesOnly) {
                // Filter to show only quick notes
                selectedTagsFilter.set(new Set(['quick-note']));
              } else {
                // Clear filter
                selectedTagsFilter.set(new Set());
              }
            }}
            class="px-4 py-2 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors flex items-center gap-2
                   {showQuickNotesOnly ? 'bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}"
            title="Show only quick notes"
          >
            📝 {showQuickNotesOnly ? 'Notes' : ''}
          </button>
          
          <!-- Tag Filter Button -->
          {#if $allTags.length > 0}
            <div class="relative">
              <button
                on:click={() => showTagFilter = !showTagFilter}
                class="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2
                       {$selectedTagsFilter.size > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}"
                title="Filter by tags"
              >
                🏷️ {$selectedTagsFilter.size > 0 ? `(${$selectedTagsFilter.size})` : ''}
              </button>
              
              {#if showTagFilter}
                <div class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-64 overflow-y-auto">
                  <div class="p-2">
                    <div class="text-xs font-semibold text-gray-600 dark:text-gray-300 px-2 py-1">Filter by Tags</div>
                    {#each $allTags as tag}
                      <button
                        on:click={() => toggleTagFilter(tag)}
                        class="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center justify-between text-gray-900 dark:text-gray-100"
                      >
                        <span class="text-sm">{tag}</span>
                        {#if $selectedTagsFilter.has(tag)}
                          <span class="text-blue-600 dark:text-blue-400">✓</span>
                        {/if}
                      </button>
                    {/each}
                    {#if $selectedTagsFilter.size > 0}
                      <button
                        on:click={() => {
                          clearTagFilter();
                          showTagFilter = false;
                        }}
                        class="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 text-sm border-t border-gray-100 dark:border-gray-700 mt-1"
                      >
                        Clear Filter
                      </button>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
          
          <!-- Dark Mode Toggle -->
          <button
            on:click={toggleDarkMode}
            class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="{darkMode ? 'Light' : 'Dark'} mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <!-- Menu Button -->
          <div class="relative">
            <button
              on:click={() => showMenu = !showMenu}
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Menu"
            >
              ⋮
            </button>
            
            {#if showMenu}
              <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <button
                  on:click={() => {
                    openAddTaskForm();
                    showMenu = false;
                  }}
                  class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-t-lg"
                >
                  ➕ Add Task (Shift+A)
                </button>
                <button
                  on:click={() => {
                    exportTasks();
                    showMenu = false;
                  }}
                  class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-t border-gray-100 dark:border-gray-700"
                >
                  💾 Export Tasks
                </button>
                <label class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-t border-gray-100 dark:border-gray-700 cursor-pointer block">
                  📥 Import Tasks
                  <input
                    type="file"
                    accept=".json"
                    on:change={importTasks}
                    class="hidden"
                  />
                </label>
                <button
                  on:click={() => {
                    clearAllTasks();
                    showMenu = false;
                  }}
                  class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 border-t border-gray-100 dark:border-gray-700 rounded-b-lg"
                >
                  🗑️ Clear All Tasks
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Keyboard shortcuts hint -->
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
        Shortcuts: Shift+Q (Month) • Shift+W (Week) • Shift+E (Day) • Shift+A (Add Task) • Shift+B (Brain) • Shift+N (Quick Note)
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8" on:click={(e) => e.stopPropagation()}>
    {#if currentView === 'month'}
      <MonthView onDayClick={handleDayClick} />
    {:else if currentView === 'week'}
      <WeekView onDayClick={handleDayClick} />
    {:else if currentView === 'day'}
      <DayView bind:selectedDate={selectedDate} />
    {:else if currentView === 'brain'}
      <BrainView />
    {/if}
  </main>
</div>

<TaskForm 
  bind:isOpen={isFormOpen}
  defaultDate={selectedDate}
/>
