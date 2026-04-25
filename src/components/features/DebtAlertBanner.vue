<template>
  <div v-if="shouldShow" class="mb-6 animate-slide-up">
    <div 
      :class="[
        'p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-500',
        config.bgClass,
        config.borderClass
      ]"
    >
      <div class="flex items-center gap-4">
        <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shadow-sm', config.iconBgClass, config.iconColorClass]">
          <component :is="config.icon" :size="24" />
        </div>
        <div>
          <h4 :class="['text-sm font-black uppercase tracking-tight', config.textColorClass]">
            {{ config.title }}
          </h4>
          <p :class="['text-[10px] font-bold uppercase tracking-widest opacity-80', config.textColorClass]">
            Rasio Hutang: {{ debtStore.dtiRatio.toFixed(1) }}% | Limit Sehat: 30%
          </p>
        </div>
      </div>
      <div class="hidden sm:block text-right">
        <p :class="['text-[10px] font-black uppercase tracking-widest opacity-60 mb-1', config.textColorClass]">Kewajiban Bulan Ini</p>
        <p :class="['text-sm font-black tabular-nums', config.textColorClass]">
          {{ formatIDR(debtStore.monthlyDebtObligation) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDebtStore } from '../../stores/useDebtStore'
import { useCurrency } from '../../composables/useCurrency'
import { AlertTriangle, AlertOctagon, Info } from 'lucide-vue-next'

const debtStore = useDebtStore()
const { formatIDR } = useCurrency()

const shouldShow = computed(() => {
  return debtStore.dtiStatus === 'warning' || debtStore.dtiStatus === 'critical'
})

const config = computed(() => {
  if (debtStore.dtiStatus === 'critical') {
    return {
      title: 'Peringatan: Hutang Kritis!',
      icon: AlertOctagon,
      bgClass: 'bg-rose-50 dark:bg-rose-900/10',
      borderClass: 'border-rose-100 dark:border-rose-800/50',
      iconBgClass: 'bg-rose-100 dark:bg-rose-900/40',
      iconColorClass: 'text-rose-600 dark:text-rose-400',
      textColorClass: 'text-rose-900 dark:text-rose-200'
    }
  }
  
  return {
    title: 'Waspada: Hutang Meningkat',
    icon: AlertTriangle,
    bgClass: 'bg-amber-50 dark:bg-amber-900/10',
    borderClass: 'border-amber-100 dark:border-amber-800/50',
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/40',
    iconColorClass: 'text-amber-600 dark:text-amber-400',
    textColorClass: 'text-amber-900 dark:text-amber-200'
  }
})
</script>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
