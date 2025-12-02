const MONEY_STORAGE_KEY = 'forge_money_tracker';
const MONEY_SETTINGS_KEY = 'forge_money_settings';

export function createTransaction(data) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: data.date,
    type: data.type, // 'income' or 'expense'
    category: data.category,
    description: data.description || '',
    amount: parseFloat(data.amount) || 0,
    createdAt: new Date().toISOString()
  };
}

export function loadTransactions() {
  try {
    const data = localStorage.getItem(MONEY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
}

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(MONEY_STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
}

export function addTransaction(data) {
  const transactions = loadTransactions();
  const newTransaction = createTransaction(data);
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
}

export function deleteTransaction(id) {
  const transactions = loadTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveTransactions(filtered);
  return filtered;
}

export function updateTransaction(id, updates) {
  const transactions = loadTransactions();
  const updated = transactions.map(t => 
    t.id === id ? { ...t, ...updates } : t
  );
  saveTransactions(updated);
  return updated;
}

export function getTransactionsByDateRange(startDate, endDate) {
  const transactions = loadTransactions();
  return transactions.filter(t => 
    t.date >= startDate && t.date <= endDate
  ).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getTransactionsByDate(date) {
  const transactions = loadTransactions();
  return transactions.filter(t => t.date === date)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function calculateTotals(transactions) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return { income, expenses, balance: income - expenses };
}

export function getCategoryBreakdown(transactions) {
  const breakdown = {};
  
  transactions.forEach(t => {
    if (!breakdown[t.category]) {
      breakdown[t.category] = { income: 0, expense: 0, total: 0 };
    }
    
    if (t.type === 'income') {
      breakdown[t.category].income += t.amount;
      breakdown[t.category].total += t.amount;
    } else {
      breakdown[t.category].expense += t.amount;
      breakdown[t.category].total += t.amount;
    }
  });
  
  return breakdown;
}

// Settings management
export function loadSettings() {
  try {
    const data = localStorage.getItem(MONEY_SETTINGS_KEY);
    return data ? JSON.parse(data) : { currency: 'USD' };
  } catch (error) {
    console.error('Error loading settings:', error);
    return { currency: 'USD' };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(MONEY_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function getCurrencySymbol(currency) {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'INR': '₹',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'Fr',
    'CNY': '¥',
    'SEK': 'kr',
    'NZD': 'NZ$'
  };
  return symbols[currency] || currency;
}

export function formatAmount(amount, currency) {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
}

export function exportToJSON() {
  const transactions = loadTransactions();
  const settings = loadSettings();
  const data = {
    transactions,
    settings,
    exportedAt: new Date().toISOString(),
    version: '2.4'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `forge-money-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.transactions && Array.isArray(data.transactions)) {
          saveTransactions(data.transactions);
          if (data.settings) {
            saveSettings(data.settings);
          }
          resolve(data);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
