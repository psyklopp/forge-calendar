<script>
  import { isToday, getTodayString } from '../lib/dateUtils.js';
  import { 
    getRecordForDate, 
    updateRecord, 
    calculateDailyScore,
    getWeekData,
    getCurrentStreak
  } from '../lib/brainHealth.js';
  
  let selectedDate = $state(getTodayString());
  let record = $state(getRecordForDate(selectedDate));
  let dailyScore = $derived(calculateDailyScore(record));
  let weekData = $state(getWeekData(selectedDate));
  let streak = $state(getCurrentStreak());
  
  $effect(() => {
    record = getRecordForDate(selectedDate);
  });

  function toggle(path) {
    const keys = path.split('.');
    if (keys.length === 1) {
      record[keys[0]] = !record[keys[0]];
    } else if (keys.length === 2) {
      record[keys[0]][keys[1]] = !record[keys[0]][keys[1]];
    }
    record = updateRecord(selectedDate, record);
    weekData = getWeekData(selectedDate);
    streak = getCurrentStreak();
  }
  
  function previousDay() {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    selectedDate = date.toISOString().split('T')[0];
    record = getRecordForDate(selectedDate);
    weekData = getWeekData(selectedDate);
  }
  
  function nextDay() {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    selectedDate = date.toISOString().split('T')[0];
    record = getRecordForDate(selectedDate);
    weekData = getWeekData(selectedDate);
  }
  
  function goToToday() {
    selectedDate = getTodayString();
    record = getRecordForDate(selectedDate);
    weekData = getWeekData(selectedDate);
  }
</script>

<div class="bg-white rounded-lg shadow">
  <!-- Header -->
  <div class="p-6 border-b border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-900">🧠 Brain Health</h2>
        {#if streak > 0}
          <div class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
            🔥 {streak} day streak
          </div>
        {/if}
      </div>
      
      <div class="flex gap-2">
        <button
          on:click={goToToday}
          class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Today
        </button>
        <button
          on:click={previousDay}
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ←
        </button>
        <button
          on:click={nextDay}
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          →
        </button>
      </div>
    </div>
    
    <!-- Date and Score -->
    <div class="flex items-center justify-between">
      <div class="text-gray-600">
        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        {#if isToday(selectedDate)}
          <span class="text-blue-600 ml-2">• Today</span>
        {/if}
      </div>
      <div class="text-2xl font-bold" class:text-green-600={dailyScore >= 80} class:text-yellow-600={dailyScore >= 50 && dailyScore < 80} class:text-gray-400={dailyScore < 50}>
        {dailyScore}%
      </div>
    </div>
  </div>
  
  <!-- Content -->
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <!-- Sleep -->
      <div class="p-4 border-2 rounded-lg" class:border-purple-500={record.sleep} class:bg-purple-50={record.sleep} class:border-gray-200={!record.sleep}>
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">😴</span>
            <div>
              <div class="font-semibold text-gray-900">Sleep</div>
              <div class="text-xs text-gray-500">7-8 hours quality sleep</div>
            </div>
          </div>
          <div class="text-xl">{record.sleep ? '✓' : '○'}</div>
        </div>
        <button
          on:click={() => toggle('sleep')}
          class="w-full py-2 rounded transition-colors"
          class:bg-purple-500={record.sleep}
          class:text-white={record.sleep}
          class:bg-gray-100={!record.sleep}
          class:text-gray-700={!record.sleep}
          class:hover:bg-purple-600={record.sleep}
          class:hover:bg-gray-200={!record.sleep}
        >
          {record.sleep ? 'Done ✓' : 'Mark as done'}
        </button>
      </div>
      
      <!-- Exercise -->
      <div class="p-4 border-2 rounded-lg" class:border-blue-500={record.exercise} class:bg-blue-50={record.exercise} class:border-gray-200={!record.exercise}>
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏃</span>
            <div>
              <div class="font-semibold text-gray-900">Exercise</div>
              <div class="text-xs text-gray-500">30min brisk walk</div>
            </div>
          </div>
          <div class="text-xl">{record.exercise ? '✓' : '○'}</div>
        </div>
        <button
          on:click={() => toggle('exercise')}
          class="w-full py-2 rounded transition-colors"
          class:bg-blue-500={record.exercise}
          class:text-white={record.exercise}
          class:bg-gray-100={!record.exercise}
          class:text-gray-700={!record.exercise}
          class:hover:bg-blue-600={record.exercise}
          class:hover:bg-gray-200={!record.exercise}
        >
          {record.exercise ? 'Done ✓' : 'Mark as done'}
        </button>
      </div>
      
      <!-- Diet -->
      <div class="p-4 border-2 rounded-lg" class:border-green-500={Object.values(record.diet).filter(Boolean).length >= 4} class:bg-green-50={Object.values(record.diet).filter(Boolean).length >= 4} class:border-gray-200={Object.values(record.diet).filter(Boolean).length < 4}>
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🥗</span>
            <div>
              <div class="font-semibold text-gray-900">Mediterranean Diet</div>
              <div class="text-xs text-gray-500">{Object.values(record.diet).filter(Boolean).length}/6 foods</div>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={record.diet.fruits} on:change={() => toggle('diet.fruits')} class="w-4 h-4 rounded border-gray-300 text-green-600" />
            <span class="text-sm">🍎 Fruits</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={record.diet.fish} on:change={() => toggle('diet.fish')} class="w-4 h-4 rounded border-gray-300 text-green-600" />
            <span class="text-sm">🐟 Fatty fish</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={record.diet.nuts} on:change={() => toggle('diet.nuts')} class="w-4 h-4 rounded border-gray-300 text-green-600" />
            <span class="text-sm">🥜 Nuts</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={record.diet.beans} on:change={() => toggle('diet.beans')} class="w-4 h-4 rounded border-gray-300 text-green-600" />
            <span class="text-sm">🫘 Beans</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={record.diet.greens} on:change={() => toggle('diet.greens')} class="w-4 h-4 rounded border-gray-300 text-green-600" />
            <span class="text-sm">🥬 Leafy greens</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={record.diet.oliveOil} on:change={() => toggle('diet.oliveOil')} class="w-4 h-4 rounded border-gray-300 text-green-600" />
            <span class="text-sm">🫒 Olive oil</span>
          </label>
        </div>
      </div>
      
      <!-- Stress Management -->
      <div class="p-4 border-2 rounded-lg" class:border-yellow-500={Object.values(record.stressManagement).filter(Boolean).length >= 1} class:bg-yellow-50={Object.values(record.stressManagement).filter(Boolean).length >= 1} class:border-gray-200={Object.values(record.stressManagement).filter(Boolean).length < 1}>
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🧘</span>
            <div>
              <div class="font-semibold text-gray-900">Stress Management</div>
              <div class="text-xs text-gray-500">{Object.values(record.stressManagement).filter(Boolean).length}/3 activities</div>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={record.stressManagement.yoga} on:change={() => toggle('stressManagement.yoga')} class="w-4 h-4 rounded border-gray-300 text-yellow-600" />
            <span class="text-sm">🧘 Yoga/stretching</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={record.stressManagement.mindfulness} on:change={() => toggle('stressManagement.mindfulness')} class="w-4 h-4 rounded border-gray-300 text-yellow-600" />
            <span class="text-sm">🧠 Mindfulness</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={record.stressManagement.socialTime} on:change={() => toggle('stressManagement.socialTime')} class="w-4 h-4 rounded border-gray-300 text-yellow-600" />
            <span class="text-sm">👥 Social time</span>
          </label>
        </div>
      </div>
      
      <!-- Learning -->
      <div class="p-4 border-2 rounded-lg md:col-span-2" class:border-pink-500={record.learning} class:bg-pink-50={record.learning} class:border-gray-200={!record.learning}>
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📚</span>
            <div>
              <div class="font-semibold text-gray-900">Learn Something New</div>
              <div class="text-xs text-gray-500">Build cognitive reserve & new neural pathways</div>
            </div>
          </div>
          <div class="text-xl">{record.learning ? '✓' : '○'}</div>
        </div>
        <button
          on:click={() => toggle('learning')}
          class="w-full py-2 rounded transition-colors"
          class:bg-pink-500={record.learning}
          class:text-white={record.learning}
          class:bg-gray-100={!record.learning}
          class:text-gray-700={!record.learning}
          class:hover:bg-pink-600={record.learning}
          class:hover:bg-gray-200={!record.learning}
        >
          {record.learning ? 'Done ✓' : 'Mark as done'}
        </button>
      </div>
    </div>
    
    <!-- Week Heatmap -->
    <div class="border-t pt-6">
      <h3 class="font-semibold text-gray-900 mb-3">Last 7 Days</h3>
      <div class="grid grid-cols-7 gap-2">
        {#each weekData as day}
          <div class="text-center">
            <div class="text-xs text-gray-500 mb-1">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div 
              class="h-16 rounded flex items-center justify-center font-semibold"
              class:bg-green-500={day.score >= 80}
              class:text-white={day.score >= 80}
              class:bg-yellow-300={day.score >= 50 && day.score < 80}
              class:text-gray-900={day.score >= 50 && day.score < 80}
              class:bg-gray-200={day.score < 50}
              class:text-gray-500={day.score < 50}
            >
              {day.score}%
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
