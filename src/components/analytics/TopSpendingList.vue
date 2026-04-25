<template>
  <div class="premium-card p-6 h-full flex flex-col group">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Top Outflows</h3>
        <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Top Spending</p>
      </div>
      <div class="w-10 h-10 bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 rounded-2xl flex items-center justify-center">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
    </div>
    
    <div v-if="isEmpty" class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-gray-700">
      <p class="text-sm font-bold text-slate-500 dark:text-gray-400">No expenses recorded yet.</p>
    </div>
    
    <div v-else class="flex-1 flex flex-col justify-between space-y-4">
      <div v-for="(tx, index) in topTransactions" :key="index" class="relative">
        <div class="flex justify-between items-end mb-1 z-10 relative">
          <div class="flex items-center space-x-3">
             <span class="text-xs font-black text-slate-400">#{{ index + 1 }}</span>
             <span class="text-sm font-bold text-slate-700 dark:text-gray-300 truncate max-w-[150px]">{{ tx.description || (tx.categories && tx.categories.name) || 'Unknown' }}</span>
          </div>
          <span class="text-sm font-black text-slate-900 dark:text-white tabular-nums">-Rp {{ Number(tx.amount).toLocaleString() }}</span>
        </div>
        <!-- Progress bar visual -->
        <div class="w-full bg-slate-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div class="bg-rose-500 h-full rounded-full transition-all duration-1000 ease-out" 
               :style="{ width: `${Math.max(2, (Number(tx.amount) / maxAmount) * 100)}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
    default: () => []
  }
})

const expenses = computed(() => props.transactions.filter(tx => tx.type === 'EXPENSE'))
const isEmpty = computed(() => expenses.value.length === 0)

const topTransactions = computed(() => {
  return [...expenses.value]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)
})

const maxAmount = computed(() => {
  if (topTransactions.value.length === 0) return 1
  return Number(topTransactions.value[0].amount)
})
</script>
