<template>
  <div :class="[compact ? 'flex flex-col justify-between h-full py-1' : 'space-y-4']" class="relative">
    <!-- Background Connector Line (Dynamic) -->
    <div 
      v-if="compact"
      class="absolute left-[26px] top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-gray-800 -z-0"
    ></div>

    <div 
      v-for="level in levels" 
      :key="level.id"
      class="relative group"
      :class="{ 'flex-1 flex flex-col justify-center': compact }"
    >
      <!-- Connector Line (Non-compact only) -->
      <div 
        v-if="!compact && level.id !== 5"
        class="absolute left-6 top-12 w-0.5 h-16 bg-slate-100 dark:bg-gray-800"
        :class="{ 'bg-primary-500': level.isCompleted && levels[level.id].isCompleted }"
      ></div>

      <AppCard 
        class="relative z-10 transition-all duration-500 hover:translate-x-1"
        :class="[
          compact ? '!p-2.5 rounded-2xl' : '!p-5',
          level.isCompleted 
            ? 'border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-500/5' 
            : isActive(level.id) 
              ? 'border-primary-500/30 ring-1 ring-primary-500/20' 
              : 'opacity-60 bg-slate-50/50 dark:bg-gray-900/50'
        ]"
      >
        <div class="flex items-center" :class="compact ? 'gap-3' : 'gap-5'">
          <!-- Icon/Number Circle -->
          <div 
            class="rounded-xl flex items-center justify-center transition-all duration-500"
            :class="[
              compact ? 'w-8 h-8 rounded-lg' : 'w-12 h-12 rounded-2xl',
              level.isCompleted 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : isActive(level.id)
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 animate-pulse'
                  : 'bg-slate-200 dark:bg-gray-800 text-slate-400'
            ]"
          >
            <Check v-if="level.isCompleted" :size="compact ? 16 : 24" stroke-width="3" />
            <Lock v-else-if="!isActive(level.id) && level.id > currentLevel + 1" :size="compact ? 14 : 20" />
            <span v-else :class="compact ? 'text-sm' : 'text-xl'" class="font-black italic">{{ level.id }}</span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between" :class="{ 'mb-1': !compact }">
               <h4 
                class="font-black uppercase tracking-tight truncate"
                :class="[
                  compact ? 'text-[10px]' : 'text-sm',
                  level.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                ]"
               >
                 {{ level.name }}
               </h4>
               <span 
                v-if="level.isCompleted && !compact"
                class="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full"
               >
                 {{ $t('ladder.achieved') }}
               </span>
            </div>
             <p 
               class="text-slate-500 dark:text-gray-400 font-medium leading-relaxed"
               :class="compact ? 'text-[8px] line-clamp-1 mt-0.5' : 'text-xs mt-1'"
             >
               {{ level.description }}
             </p>
             
             <!-- Requirement -->
             <div class="flex items-center gap-1.5" :class="compact ? 'mt-1' : 'mt-3'">
                <div class="rounded-full" :class="[compact ? 'w-1 h-1' : 'w-1.5 h-1.5', level.isCompleted ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-gray-700']"></div>
                <span 
                  class="font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider"
                  :class="compact ? 'text-[7px]' : 'text-[10px]'"
                >
                  {{ $t('ladder.requirement') }}: {{ level.requirement }}
                </span>
             </div>
          </div>

          <!-- Arrow indicator for Active -->
          <ChevronRight 
            v-if="isActive(level.id)"
            class="text-primary-500 animate-bounce-x"
            :size="compact ? 16 : 20"
          />
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { Check, Lock, ChevronRight } from 'lucide-vue-next'
import { useFinancialHealth } from '../../composables/useFinancialHealth'
import AppCard from '../ui/AppCard.vue'

defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

const { levels, currentLevel } = useFinancialHealth()

const isActive = (id) => {
  if (id === 1) return !levels.value[0].isCompleted
  return levels.value[id-2].isCompleted && !levels.value[id-1].isCompleted
}
</script>

<style scoped>
@keyframes bounce-x {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}
.animate-bounce-x {
  animation: bounce-x 1s infinite;
}
</style>
