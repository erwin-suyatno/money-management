<script setup>
import { Crown, Info, ArrowLeftRight, Scan, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import FinancialLadder from '../analytics/FinancialLadder.vue'
import AppCard from '../ui/AppCard.vue'

defineProps({
  healthScore: {
    type: Number,
    required: true
  }
})

const router = useRouter()
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    <!-- Main Insights Card -->
    <div class="flex-1 bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 p-5 rounded-3xl shadow-sm flex flex-col">
      <div class="flex items-center justify-between mb-4 px-1 shrink-0">
        <h4 class="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <Crown :size="12" class="text-amber-500" />
          {{ $t('ladder.title') }}
        </h4>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
            {{ healthScore }}%
          </span>
        </div>
      </div>

      <!-- Compact Financial Ladder -->
      <div class="px-1 flex-1 flex flex-col">
        <FinancialLadder compact class="flex-1" />
      </div>
      
      <!-- Progress Mini -->
      <!-- <div class="mt-4 pt-4 border-t border-slate-50 dark:border-gray-800/50">
        <div 
          class="flex items-center justify-between group cursor-pointer"
          @click="router.push('/emergency-fund')"
        >
          <div class="flex-1">
            <div class="h-1.5 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
               <div 
                 class="h-full bg-primary-500 transition-all duration-1000"
                 :style="{ width: `${healthScore}%` }"
               ></div>
            </div>
          </div>
          <ChevronRight :size="14" class="text-slate-300 ml-3 group-hover:text-primary-500 transition-colors" />
        </div>
      </div> -->
    </div>

    <!-- Quick Actions Compact -->
    <!-- <div class="grid grid-cols-2 gap-3">
      <button 
        @click="router.push('/transfer')"
        class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5 transition-all group"
      >
        <div class="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
          <ArrowLeftRight :size="16" />
        </div>
        <span class="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{{ $t('actions.transfer') }}</span>
      </button>

      <button 
        @click="router.push('/import')"
        class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5 transition-all group"
      >
        <div class="w-8 h-8 rounded-xl bg-accent-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
          <Scan :size="16" />
        </div>
        <span class="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{{ $t('actions.scan') }}</span>
      </button>
    </div> -->
  </div>
</template>

<style scoped>
/* Any specific component styles */
</style>
