<template>
  <div class="premium-card p-6 h-full flex flex-col justify-between group overflow-hidden relative">
    <div class="relative z-10">
      <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">{{ $t('health.safety_net') }}</h3>
      <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('health.emergency_fund') }}</p>
    </div>
    
    <div class="mt-6 relative z-10">
       <div class="flex items-end space-x-2 mb-1">
         <p class="text-3xl font-black text-emerald-500 tracking-tighter">Rp {{ formatNumber(currentFund) }}</p>
       </div>
        <div class="flex justify-between text-[10px] font-bold text-slate-400 mb-3 mt-4">
          <span>{{ isNaN(percentage) ? 0 : percentage }}% {{ $t('health.tercapai') }}</span>
          <span>Target: Rp {{ formatNumber(targetFund) }}</span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-gray-800 h-4 rounded-full overflow-hidden border border-slate-200 dark:border-gray-700">
           <div class="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                :style="{ width: `${isNaN(percentage) ? 0 : percentage}%` }"></div>
        </div>
    </div>
    
    <!-- Background element -->
    <div class="absolute -right-6 -top-6 w-24 h-24 opacity-10 dark:opacity-5 text-emerald-500 group-hover:scale-110 transition-transform duration-700">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEmergencyFund } from '../../composables/useEmergencyFund'

const props = defineProps({
  transactions: {
    type: Array, // Kept for compatibility but calculation uses engine
    required: true,
    default: () => []
  }
})

const { targetAmount, currentBalance, progressPercentage } = useEmergencyFund()

const targetFund = computed(() => targetAmount.value)
const currentFund = computed(() => currentBalance.value)
const percentage = computed(() => Math.round(progressPercentage.value))

const formatNumber = (num) => {
  return Number(num).toLocaleString('id-ID')
}
</script>
