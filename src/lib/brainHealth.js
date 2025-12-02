const BRAIN_STORAGE_KEY = 'forge_brain_health';

export function createDayRecord(date) {
  return {
    date,
    sleep: false,              // 7-8 hours quality sleep
    diet: {
      fruits: false,
      fish: false,             // Fatty fish (salmon, sardines)
      nuts: false,
      beans: false,
      greens: false,           // Leafy vegetables
      oliveOil: false
    },
    exercise: false,           // 30min brisk walk
    stressManagement: {
      yoga: false,
      mindfulness: false,
      socialTime: false        // Time with people
    },
    learning: false            // Learned something new today
  };
}

export function loadBrainHealth() {
  try {
    const data = localStorage.getItem(BRAIN_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading brain health:', error);
    return {};
  }
}

export function saveBrainHealth(records) {
  try {
    localStorage.setItem(BRAIN_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving brain health:', error);
  }
}

export function getRecordForDate(date) {
  const records = loadBrainHealth();
  return records[date] || createDayRecord(date);
}

export function updateRecord(date, updates) {
  const records = loadBrainHealth();
  records[date] = { ...getRecordForDate(date), ...updates };
  saveBrainHealth(records);
  return records[date];
}

export function calculateDailyScore(record) {
  let score = 0;
  let total = 0;
  
  // Sleep (1 point)
  total += 1;
  if (record.sleep) score += 1;
  
  // Diet (6 points - all items)
  total += 6;
  if (record.diet.fruits) score += 1;
  if (record.diet.fish) score += 1;
  if (record.diet.nuts) score += 1;
  if (record.diet.beans) score += 1;
  if (record.diet.greens) score += 1;
  if (record.diet.oliveOil) score += 1;
  
  // Exercise (1 point)
  total += 1;
  if (record.exercise) score += 1;
  
  // Stress management (3 points)
  total += 3;
  if (record.stressManagement.yoga) score += 1;
  if (record.stressManagement.mindfulness) score += 1;
  if (record.stressManagement.socialTime) score += 1;
  
  // Learning (1 point)
  total += 1;
  if (record.learning) score += 1;
  
  return Math.round((score / total) * 100);
}

export function getWeekData(endDate) {
  const records = loadBrainHealth();
  const weekData = [];
  const end = new Date(endDate);
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(end);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const record = records[dateStr] || createDayRecord(dateStr);
    weekData.push({
      date: dateStr,
      score: calculateDailyScore(record)
    });
  }
  
  return weekData;
}

export function getCurrentStreak() {
  const records = loadBrainHealth();
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const record = records[dateStr];
    
    if (!record) break;
    
    const score = calculateDailyScore(record);
    if (score >= 50) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
