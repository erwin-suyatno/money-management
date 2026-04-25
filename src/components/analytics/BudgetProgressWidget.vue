<template>
  <div class="space-y-4">
    <div v-if="loading && budgets.length === 0" class="space-y-4">
      <div v-for="i in 3" :key="i" class="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-800">
        <div class="flex items-center gap-3 mb-3">
          <AppSkeleton variant="circle" width="32px" height="32px" />
          <AppSkeleton width="120px" height="14px" />
        </div>
        <AppSkeleton width="100%" height="8px" />
      </div>
    </div>

    <div v-else-if="budgets.length === 0" class="py-12 text-center bg-slate-50 dark:bg-gray-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-gray-800">
       <div class="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
          <PieChart :size="24" />
       </div>
       <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Belum ada anggaran</p>
       <AppButton variant="ghost" size="sm" class="mt-4" @click="router.push('/budgets')">Mulai Buat Anggaran</AppButton>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div v-for="b in limitedBudgets" :key="b.id" 
           class="p-5 bg-white dark:bg-gray-800 rounded-[1.5rem] border border-slate-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md group">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div :style="{ backgroundColor: b.categories?.color + '15', color: b.categories?.color }" 
                 class="w-10 h-10 rounded-xl flex items-center justify-center">
              <component :is="categoryStore.resolveIcon(b.categories?.icon)" :size="20" />
            </div>
            <div>
              <p class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ b.categories?.name }}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ b.period_type }} BUDGET</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sisa</p>
            <p :class="b.isOver ? 'text-rose-500' : 'text-slate-900 dark:text-white'" class="text-sm font-black tabular-nums">
               {{ formatIDR(b.remaining) }}
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="relative w-full h-2.5 bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden mb-2">
          <div 
            class="absolute left-0 top-0 h-full transition-all duration-1000 ease-out rounded-full"
            :class="getProgressColor(b.percentage)"
            :style="{ width: `${b.percentage}%` }"
          ></div>
        </div>

        <div class="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           <span>Terpakai {{ formatIDR(b.spent) }}</span>
           <span :class="b.percentage > 90 ? 'text-rose-500' : ''">{{ b.percentage.toFixed(0) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetStore } from '../../stores/useBudgetStore'
import { useCategoryStore } from '../../stores/useCategoryStore'
import { useCurrency } from '../../composables/useCurrency'
import { PieChart } from 'lucide-vue-next'
import AppSkeleton from '../ui/AppSkeleton.vue'
import AppButton from '../ui/AppButton.vue'

const props = defineProps({
  limit: {
    type: Number,
    default: 0
  }
})

const router = useRouter()
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const { formatIDR } = useCurrency()

const budgets = computed(() => budgetStore.budgetsWithStats)
const loading = computed(() => budgetStore.loading)

const limitedBudgets = computed(() => {
  if (props.limit > 0) return budgets.value.slice(0, props.limit)
  return budgets.value
})

const getProgressColor = (percent) => {
  if (percent >= 100) return 'bg-rose-500 shadow-lg shadow-rose-500/20'
  if (percent >= 85) return 'bg-orange-500 shadow-lg shadow-orange-500/20'
  if (percent >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}
</script>
