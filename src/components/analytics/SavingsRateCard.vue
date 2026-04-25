<template>
  <div class="premium-card p-6 h-full flex flex-col justify-between group overflow-hidden relative">
    <div class="relative z-10">
      <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">Savings Rate</h3>
      <div class="flex items-end space-x-2">
        <p class="text-4xl font-black text-indigo-500 tracking-tighter">{{ rate.toFixed(1) }}%</p>
      </div>
    </div>
    
    <div class="mt-4 relative z-10">
       <div class="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
         <span>{{ statusText }}</span>
         <span>Target: 20%</span>
       </div>
       <div class="w-full bg-slate-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
          <div :class="progressBarColor" class="h-full rounded-full transition-all duration-1000 ease-out" 
               :style="{ width: `${Math.min(100, Math.max(0, rate))}%` }"></div>
       </div>
    </div>
    
    <!-- Background element -->
    <div class="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 dark:opacity-5 text-indigo-500 rotate-12 group-hover:scale-110 transition-transform duration-700">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
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

const rate = computed(() => {
  let income = 0
  let expense = 0
  props.transactions.forEach(tx => {
    if (tx.type === 'INCOME') income += Number(tx.amount)
    if (tx.type === 'EXPENSE') expense += Number(tx.amount)
  })
  
  if (income === 0) return 0
  // Savings rate = (income - expense) / income
  const r = ((income - expense) / income) * 100
  return r < 0 ? 0 : r
})

const statusText = computed(() => {
  if (rate.value < 10) return 'Danger'
  if (rate.value <= 20) return 'Good'
  return 'Excellent'
})

const progressBarColor = computed(() => {
  if (rate.value < 10) return 'bg-rose-500'
  if (rate.value <= 20) return 'bg-amber-500'
  return 'bg-emerald-500'
})
</script>
