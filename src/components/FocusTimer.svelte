<script>
  import { onMount, onDestroy } from 'svelte';
  import { tasks } from '../lib/taskStore.js';
  
  export let task = null;
  export let duration = 45; // Duration in minutes
  export let onComplete = null;
  
  let timeRemaining = duration * 60; // Convert to seconds
  let interval = null;
  let progress = 0;
  
  onMount(() => {
    // Start countdown
    interval = setInterval(() => {
      timeRemaining--;
      progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;
      
      if (timeRemaining <= 0) {
        finishSession();
      }
    }, 1000);
  });
  
  onDestroy(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
  
  function finishSession() {
    clearInterval(interval);
    
    // Add time to task
    if (task) {
      const currentTimeSpent = task.timeSpent || 0;
      tasks.updateTask(task.id, { 
        timeSpent: currentTimeSpent + duration 
      });
    }
    
    // Call completion callback
    if (onComplete) {
      onComplete(duration);
    }
  }
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<!-- Full Screen Focus Overlay -->
<div class="fixed inset-0 z-50 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center">
  <!-- Pixel Art Decoration -->
  <div class="absolute top-10 left-10 w-16 h-16 bg-yellow-400 opacity-20" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"></div>
  <div class="absolute top-20 right-20 w-12 h-12 bg-pink-400 opacity-20 rounded-full"></div>
  <div class="absolute bottom-20 left-20 w-20 h-20 bg-blue-400 opacity-20" style="clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);"></div>
  <div class="absolute bottom-10 right-10 w-14 h-14 bg-green-400 opacity-20 rotate-45"></div>
  
  <!-- Main Content -->
  <div class="text-center space-y-8 max-w-3xl px-8">
    <!-- Do Not Disturb Message -->
    <div class="space-y-4">
      <div class="text-6xl font-bold text-white tracking-tight pixel-font">
        🔇 DO NOT DISTURB
      </div>
      <div class="text-4xl text-purple-200 font-medium pixel-font">
        I am focusing
      </div>
    </div>
    
    <!-- Task Name -->
    {#if task}
      <div class="text-2xl text-white/80 font-light italic">
        "{task.title}"
      </div>
    {/if}
    
    <!-- Timer Display -->
    <div class="space-y-6">
      <div class="text-7xl font-mono font-bold text-white tabular-nums">
        {formatTime(timeRemaining)}
      </div>
      
      <!-- Progress Bar -->
      <div class="w-full max-w-2xl mx-auto">
        <div class="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            class="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 ease-linear rounded-full"
            style="width: {progress}%"
          ></div>
        </div>
      </div>
      
      <!-- Duration Label -->
      <div class="text-lg text-purple-300">
        {duration} minute focus session
      </div>
    </div>
    
    <!-- Motivational Message -->
    <div class="text-xl text-white/60 italic">
      Stay focused. You've got this. 💪
    </div>
  </div>
  
  <!-- Small hint at bottom -->
  <div class="absolute bottom-6 text-white/40 text-sm">
    Timer cannot be paused or stopped
  </div>
</div>

<style>
  .pixel-font {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
</style>
