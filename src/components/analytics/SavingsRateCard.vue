<template>
  <div class="relative overflow-hidden group">
    <div class="space-y-8 py-4">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">{{ $t('dashboard.monthly_savings') }}</h3>
          <p class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ rate.toFixed(1) }}%</p>
        </div>
        <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
          <TrendingUp :size="24" stroke-width="2.5" />
        </div>
      </div>
      
      <div class="space-y-3">
        <div class="flex justify-between items-end">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{{ $t('dashboard.savings_status') }}</p>
            <p class="text-xs font-black uppercase tracking-widest" :class="statusColor">{{ statusText }}</p>
          </div>
          <div class="text-right">
             <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5 italic">{{ $t('dashboard.savings_target', { target: '20.0' }) }}</p>
          </div>
        </div>
        
        <div class="relative h-4 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
           <!-- Dynamic Glow -->
           <div 
             class="absolute inset-0 opacity-20 blur-md transition-all duration-1000 ease-out rounded-full"
             :class="progressBarColor"
             :style="{ width: `${Math.min(100, Math.max(0, rate))}%` }"
           ></div>
           
           <div 
             class="relative h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.1)]" 
             :class="progressBarColor"
             :style="{ width: `${Math.min(100, Math.max(0, rate))}%` }"
           ></div>
        </div>
      </div>
      
      <p class="text-[10px] font-medium text-slate-500 dark:text-gray-400 leading-relaxed italic">
        "{{ coachMessage }}"
      </p>
    </div>
    
    <!-- Background element -->
    <div class="absolute -right-6 -top-6 w-32 h-32 opacity-5 dark:opacity-[0.02] text-indigo-500 rotate-12 group-hover:scale-110 transition-transform duration-700">
      <Coins :size="96" stroke-width="1" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TrendingUp, Coins } from 'lucide-vue-next'

const { t } = useI18n()

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
  if (rate.value < 10) return t('dashboard.savings_focus')
  if (rate.value < 20) return t('dashboard.savings_building')
  if (rate.value < 40) return t('dashboard.savings_growth')
  return t('dashboard.savings_mastery')
})

const statusColor = computed(() => {
  if (rate.value < 10) return 'text-rose-500'
  if (rate.value < 20) return 'text-amber-500'
  if (rate.value < 40) return 'text-emerald-500'
  return 'text-indigo-500'
})

const progressBarColor = computed(() => {
  if (rate.value < 10) return 'bg-rose-500'
  if (rate.value < 20) return 'bg-amber-500'
  if (rate.value < 40) return 'bg-emerald-500'
  return 'bg-indigo-500'
})

const coachMessage = computed(() => {
  const r = rate.value
  if (r < 10) return t('dashboard.coach_focus')
  if (r < 20) return t('dashboard.coach_building')
  if (r < 40) return t('dashboard.coach_growth')
  return t('dashboard.coach_master')
})
</script>
