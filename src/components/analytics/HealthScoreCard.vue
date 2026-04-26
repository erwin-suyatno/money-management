<template>
  <div class="relative overflow-hidden group">
    <div class="flex flex-col md:flex-row items-center gap-8 py-4">
      <!-- Gauge-like Indicator -->
      <div class="relative w-32 h-32 flex items-center justify-center">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <!-- Background Track -->
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="8" 
            class="text-slate-100 dark:text-gray-800"
          />
          <!-- Progress Track -->
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="url(#healthGradient)" 
            stroke-width="8" 
            stroke-linecap="round"
            :stroke-dasharray="282.7"
            :stroke-dashoffset="282.7 - (282.7 * score / 100)"
            class="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" :stop-color="scoreColor.start" />
              <stop offset="100%" :stop-color="scoreColor.end" />
            </linearGradient>
          </defs>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-black tracking-tighter" :style="{ color: scoreColor.end }">{{ score }}</span>
          <span class="text-[8px] font-black uppercase tracking-widest text-slate-400">SCORE</span>
        </div>
      </div>

      <div class="flex-1 space-y-4 text-center md:text-left">
        <div>
          <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">Financial Health</h3>
          <p class="text-xl font-black text-slate-900 dark:text-white leading-tight">{{ statusLabel }}</p>
        </div>
        
        <p class="text-xs font-medium text-slate-500 dark:text-gray-400 italic leading-relaxed">
          "{{ insightText }}"
        </p>

        <div class="flex items-center justify-center md:justify-start gap-2">
          <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" 
                :style="{ backgroundColor: scoreColor.start + '20', color: scoreColor.end }">
            {{ statusTag }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Background element -->
    <div class="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 dark:opacity-[0.02] text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-700">
      <Activity :size="96" stroke-width="1" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Activity } from 'lucide-vue-next'

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Simple dummy health score logic based on transactions
const score = computed(() => {
  if (!props.transactions || props.transactions.length === 0) return 60
  
  let income = 0
  let expense = 0
  props.transactions.forEach(tx => {
    if (tx.type === 'INCOME') income += Number(tx.amount)
    if (tx.type === 'EXPENSE') expense += Number(tx.amount)
  })

  if (income === 0 && expense > 0) return 35
  if (income === 0 && expense === 0) return 60

  const rate = ((income - expense) / income) * 100
  let baseScore = 50
  
  if (rate > 35) baseScore += 45
  else if (rate > 20) baseScore += 30
  else if (rate > 10) baseScore += 15
  else if (rate > 0) baseScore += 5
  else if (rate > -20) baseScore -= 15
  else baseScore -= 30
  
  return Math.min(100, Math.max(0, baseScore))
})

const scoreColor = computed(() => {
  const s = score.value
  if (s >= 80) return { start: '#10b981', end: '#059669' } // Emerald
  if (s >= 60) return { start: '#3b82f6', end: '#2563eb' } // Blue
  if (s >= 40) return { start: '#f59e0b', end: '#d97706' } // Amber
  return { start: '#f43f5e', end: '#e11d48' } // Rose
})

const statusLabel = computed(() => {
  const s = score.value
  if (s >= 80) return "Excellent Condition"
  if (s >= 60) return "Good Stability"
  if (s >= 40) return "Needs Attention"
  return "Critical Balance"
})

const statusTag = computed(() => {
  const s = score.value
  if (s >= 80) return "PROSPEROUS"
  if (s >= 60) return "STABLE"
  if (s >= 40) return "CAUTION"
  return "WARNING"
})

const insightText = computed(() => {
  const s = score.value
  if (s >= 80) return "Your financial engine is running perfectly. You're building wealth efficiently!"
  if (s >= 60) return "Stable ground. You have room to optimize your investments for faster growth."
  if (s >= 40) return "Some leakages detected. Review your recurring expenses to regain control."
  return "High alert: Your expenses are outpacing your earnings. Urgent adjustment needed."
})
</script>
