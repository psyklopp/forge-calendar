<script>
  import { getTodayString } from '../lib/dateUtils.js';
  import { getWeekDates, formatWeekRange } from '../lib/weekUtils.js';
  import { 
    loadTransactions,
    addTransaction,
    deleteTransaction,
    getTransactionsByDate,
    getTransactionsByDateRange,
    calculateTotals,
    getCategoryBreakdown,
    loadSettings,
    saveSettings,
    getCurrencySymbol,
    formatAmount,
    exportToJSON,
    importFromJSON
  } from '../lib/moneyTracker.js';
  
  // State
  let viewMode = $state('day'); // day, week, month
  let selectedDate = $state(getTodayString());
  let transactions = $state(loadTransactions());
  let settings = $state(loadSettings());
  
  // Quick add form state
  let entryType = $state('expense');
  let entryCategory = $state('food');
  let entryDescription = $state('');
  let entryAmount = $state('');
  
  // Settings modal
  let showSettings = $state(false);
  
  const expenseCategories = ['housing', 'bills-utilities', 'food', 'savings', 'fun'];
  const incomeCategories = ['salary', 'freelance', 'investment', 'other'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  
  // Update category when type changes
  $effect(() => {
    if (entryType === 'income') {
      entryCategory = incomeCategories[0];
    } else {
      entryCategory = expenseCategories[0];
    }
  });
  
  // Computed - MUST depend on transactions state, not call functions that read localStorage
  let displayTransactions = $derived(() => {
    if (viewMode === 'day') {
      return transactions.filter(t => t.date === selectedDate)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (viewMode === 'week') {
      const weekDates = getWeekDates(new Date(selectedDate));
      const startDate = weekDates[0];
      const endDate = weekDates[6];
      return transactions.filter(t => t.date >= startDate && t.date <= endDate)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      // month
      const date = new Date(selectedDate);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      return transactions.filter(t => t.date >= startOfMonth && t.date <= endOfMonth)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  });
  
  let totals = $derived(calculateTotals(displayTransactions()));
  let categoryBreakdown = $derived(getCategoryBreakdown(displayTransactions()));
  
  function handleAddTransaction() {
    if (!entryAmount || parseFloat(entryAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const newTransaction = addTransaction({
      date: selectedDate,
      type: entryType,
      category: entryCategory,
      description: entryDescription,
      amount: entryAmount
    });
    
    // Reset form
    entryDescription = '';
    entryAmount = '';
    
    // Trigger reactivity by creating new array reference
    transactions = [...transactions, newTransaction];
  }
  
  function handleDelete(id) {
    if (confirm('Delete this transaction?')) {
      deleteTransaction(id);
      // Trigger reactivity by creating new array reference
      transactions = transactions.filter(t => t.id !== id);
    }
  }
  
  function previousPeriod() {
    const date = new Date(selectedDate);
    if (viewMode === 'day') {
      date.setDate(date.getDate() - 1);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() - 7);
    } else {
      date.setMonth(date.getMonth() - 1);
    }
    selectedDate = date.toISOString().split('T')[0];
  }
  
  function nextPeriod() {
    const date = new Date(selectedDate);
    if (viewMode === 'day') {
      date.setDate(date.getDate() + 1);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    selectedDate = date.toISOString().split('T')[0];
  }
  
  function goToToday() {
    selectedDate = getTodayString();
  }
  
  function saveCurrencySetting() {
    saveSettings(settings);
    showSettings = false;
  }
  
  function handleExport() {
    exportToJSON();
  }
  
  function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    importFromJSON(file)
      .then(() => {
        transactions = loadTransactions();
        settings = loadSettings();
        alert('Data imported successfully!');
      })
      .catch(error => {
        alert('Import failed: ' + error.message);
      });
    
    event.target.value = '';
  }
  
  function getDateRangeLabel() {
    const date = new Date(selectedDate);
    if (viewMode === 'day') {
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (viewMode === 'week') {
      return formatWeekRange(date);
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  }
  
  function getSankeyData() {
    const trans = displayTransactions();
    const breakdown = {};
    
    trans.forEach(t => {
      const key = `${t.type}-${t.category}`;
      if (!breakdown[key]) {
        breakdown[key] = 0;
      }
      breakdown[key] += t.amount;
    });
    
    return breakdown;
  }
</script>

<div class="bg-white rounded-lg shadow">
  <!-- Header -->
  <div class="p-6 border-b border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-900">💰 Money</h2>
        <button
          on:click={() => showSettings = true}
          class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          title="Settings"
        >
          ⚙️ {getCurrencySymbol(settings.currency)}
        </button>
      </div>
      
      <div class="flex gap-2">
        <button
          on:click={handleExport}
          class="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          title="Export data"
        >
          💾 Export
        </button>
        <label class="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 cursor-pointer">
          📥 Import
          <input
            type="file"
            accept=".json"
            on:change={handleImport}
            class="hidden"
          />
        </label>
      </div>
    </div>
    
    <!-- Quick Add Bar -->
    <div class="bg-gray-50 p-4 rounded-lg mb-4">
      <div class="flex gap-2 items-end flex-wrap">
        <!-- Type Toggle -->
        <div class="flex-shrink-0">
          <label class="block text-xs text-gray-600 mb-1">Type</label>
          <div class="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              class="px-4 py-2 text-sm transition-colors"
              class:bg-green-500={entryType === 'income'}
              class:text-white={entryType === 'income'}
              class:bg-white={entryType !== 'income'}
              class:text-gray-700={entryType !== 'income'}
              on:click={() => entryType = 'income'}
            >
              + Income
            </button>
            <button
              class="px-4 py-2 text-sm transition-colors"
              class:bg-red-500={entryType === 'expense'}
              class:text-white={entryType === 'expense'}
              class:bg-white={entryType !== 'expense'}
              class:text-gray-700={entryType !== 'expense'}
              on:click={() => entryType = 'expense'}
            >
              - Expense
            </button>
          </div>
        </div>
        
        <!-- Category -->
        <div class="flex-shrink-0">
          <label class="block text-xs text-gray-600 mb-1">Category</label>
          <select
            bind:value={entryCategory}
            class="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            {#if entryType === 'expense'}
              {#each expenseCategories as cat}
                <option value={cat}>{cat}</option>
              {/each}
            {:else}
              {#each incomeCategories as cat}
                <option value={cat}>{cat}</option>
              {/each}
            {/if}
          </select>
        </div>
        
        <!-- Description -->
        <div class="flex-grow min-w-[200px]">
          <label class="block text-xs text-gray-600 mb-1">Description</label>
          <input
            type="text"
            bind:value={entryDescription}
            placeholder="What's this for?"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            on:keydown={(e) => e.key === 'Enter' && handleAddTransaction()}
          />
        </div>
        
        <!-- Amount -->
        <div class="flex-shrink-0 w-32">
          <label class="block text-xs text-gray-600 mb-1">Amount</label>
          <input
            type="number"
            bind:value={entryAmount}
            placeholder="0.00"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            on:keydown={(e) => e.key === 'Enter' && handleAddTransaction()}
          />
        </div>
        
        <!-- Add Button -->
        <button
          on:click={handleAddTransaction}
          class="px-6 py-2 rounded-lg transition-colors font-medium text-white hover:opacity-90"
          class:bg-green-600={entryType === 'income'}
          class:bg-red-600={entryType === 'expense'}
        >
          Add
        </button>
      </div>
    </div>
    
    <!-- View Mode Tabs -->
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <button
          class="px-4 py-2 rounded-lg text-sm transition-colors"
          class:bg-blue-600={viewMode === 'day'}
          class:text-white={viewMode === 'day'}
          class:bg-gray-100={viewMode !== 'day'}
          class:text-gray-700={viewMode !== 'day'}
          on:click={() => viewMode = 'day'}
        >
          Day
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm transition-colors"
          class:bg-blue-600={viewMode === 'week'}
          class:text-white={viewMode === 'week'}
          class:bg-gray-100={viewMode !== 'week'}
          class:text-gray-700={viewMode !== 'week'}
          on:click={() => viewMode = 'week'}
        >
          Week
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm transition-colors"
          class:bg-blue-600={viewMode === 'month'}
          class:text-white={viewMode === 'month'}
          class:bg-gray-100={viewMode !== 'month'}
          class:text-gray-700={viewMode !== 'month'}
          on:click={() => viewMode = 'month'}
        >
          Month
        </button>
      </div>
      
      <div class="flex gap-2 items-center">
        <button
          on:click={goToToday}
          class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Today
        </button>
        <button
          on:click={previousPeriod}
          class="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          ←
        </button>
        <div class="text-sm font-medium text-gray-700 min-w-[200px] text-center">
          {getDateRangeLabel()}
        </div>
        <button
          on:click={nextPeriod}
          class="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          →
        </button>
      </div>
    </div>
  </div>
  
  <!-- Content -->
  <div class="p-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
        <div class="text-sm text-green-700 mb-1">Income</div>
        <div class="text-2xl font-bold text-green-700">
          {formatAmount(totals.income, settings.currency)}
        </div>
      </div>
      <div class="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
        <div class="text-sm text-red-700 mb-1">Expenses</div>
        <div class="text-2xl font-bold text-red-700">
          {formatAmount(totals.expenses, settings.currency)}
        </div>
      </div>
      <div class="p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
        <div class="text-sm text-blue-700 mb-1">Balance</div>
        <div class="text-2xl font-bold" class:text-blue-700={totals.balance >= 0} class:text-red-700={totals.balance < 0}>
          {formatAmount(totals.balance, settings.currency)}
        </div>
      </div>
    </div>
    
    <!-- Category Breakdown (Simple Bar Chart) -->
{#if Object.keys(categoryBreakdown).length > 0}
  <div class="mb-6">
    <h3 class="font-semibold text-gray-900 mb-3">Category Breakdown</h3>
    
    <!-- Income Categories -->
    {#if Object.entries(categoryBreakdown).some(([_, data]) => data.income > 0)}
      <div class="mb-4">
        <h4 class="text-sm font-medium text-green-700 mb-2">Income</h4>
        <div class="space-y-2">
          {#each Object.entries(categoryBreakdown).filter(([_, data]) => data.income > 0) as [category, data]}
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="capitalize">{category}</span>
                <span class="font-medium">{formatAmount(data.income, settings.currency)}</span>
              </div>
              <div class="h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-green-400 to-green-600"
                  style="width: {totals.income > 0 ? (data.income / totals.income * 100) : 0}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- Expense Categories -->
    {#if Object.entries(categoryBreakdown).some(([_, data]) => data.expense > 0)}
      <div>
        <h4 class="text-sm font-medium text-red-700 mb-2">Expenses</h4>
        <div class="space-y-2">
          {#each Object.entries(categoryBreakdown).filter(([_, data]) => data.expense > 0) as [category, data]}
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="capitalize">{category}</span>
                <span class="font-medium">{formatAmount(data.expense, settings.currency)}</span>
              </div>
              <div class="h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-red-400 to-red-600"
                  style="width: {totals.expenses > 0 ? (data.expense / totals.expenses * 100) : 0}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
    
    <!-- Transactions List -->
    <div class="border-t pt-6">
      <h3 class="font-semibold text-gray-900 mb-3">
        Transactions ({displayTransactions().length})
      </h3>
      
      {#if displayTransactions().length === 0}
        <div class="text-center py-12 text-gray-400">
          <div class="text-5xl mb-2">💰</div>
          <p>No transactions yet</p>
          <p class="text-sm">Add your first transaction above</p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each displayTransactions() as transaction}
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center gap-3 flex-1">
                <div class="text-2xl">
                  {#if transaction.type === 'income'}
                    <span class="text-green-600">+</span>
                  {:else}
                    <span class="text-red-600">-</span>
                  {/if}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900">{transaction.description || 'No description'}</span>
                    <span class="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded capitalize">
                      {transaction.category}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-semibold" class:text-green-600={transaction.type === 'income'} class:text-red-600={transaction.type === 'expense'}>
                    {formatAmount(transaction.amount, settings.currency)}
                  </div>
                </div>
                <button
                  on:click={() => handleDelete(transaction.id)}
                  class="text-gray-400 hover:text-red-600 ml-2"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Settings Modal -->
{#if showSettings}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Settings</h3>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
        <select
          bind:value={settings.currency}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
          {#each currencies as curr}
            <option value={curr}>{curr} ({getCurrencySymbol(curr)})</option>
          {/each}
        </select>
      </div>
      
      <div class="flex justify-end gap-2">
        <button
          on:click={() => showSettings = false}
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          on:click={saveCurrencySetting}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
{/if}
