<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    :page-title="'Manajemen Anggaran'"
    @logout="handleLogout"
  >
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10 px-1 md:px-0">
      <div class="animate-slide-up">
        <h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
          {{ $t('budgets.title') }}
        </h2>
        <p class="text-xs md:text-sm text-slate-500 font-medium">{{ $t('budgets.subtitle') }}</p>
      </div>

      <AppButton 
        variant="primary" 
        size="md" 
        @click="openAddModal" 
        class="animate-slide-up shadow-xl shadow-primary-500/20 w-full md:w-auto"
      >
        <template #prefix><Plus :size="18" /></template>
        <span>{{ $t('budgets.set_budget') }}</span>
      </AppButton>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 md:mb-12 animate-slide-up" style="animation-delay: 100ms">
       <div class="bg-indigo-600 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
          <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100/60 mb-2 relative z-10">{{ $t('budgets.monthly_total') }}</p>
          <h3 class="text-3xl md:text-4xl font-black tabular-nums relative z-10 italic tracking-tighter">{{ formatIDR(totalMonthlyBudget) }}</h3>
          <div class="mt-4 flex items-center gap-2 relative z-10">
             <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
             <span class="text-[10px] font-black uppercase tracking-widest text-indigo-100/80">{{ $t('budgets.active_now') }}</span>
          </div>
       </div>

       <AppCard class="flex flex-col justify-center border-slate-100 dark:border-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-none !p-6 md:!p-8">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{{ $t('budgets.current_usage') }}</p>
          <div class="flex items-baseline gap-2">
             <h3 class="text-2xl md:text-3xl font-black dark:text-white tabular-nums tracking-tighter">{{ formatIDR(totalSpent) }}</h3>
             <span class="text-[10px] md:text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg">{{ totalPercentage.toFixed(1) }}%</span>
          </div>
       </AppCard>

        <AppCard class="flex flex-col justify-center border-slate-100 dark:border-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-none !p-6 md:!p-8">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{{ $t('budgets.health') }}</p>
          <div class="flex items-center gap-4">
             <div :class="totalPercentage > 90 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'" 
                  class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner">
                <HeartPulse :size="20" class="md:hidden" />
                <HeartPulse :size="24" class="hidden md:block" />
             </div>
             <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{{ $t('common.status') }}</p>
                <p class="text-xs md:text-sm font-black uppercase tracking-tight" :class="totalPercentage > 90 ? 'text-rose-600' : 'text-emerald-600'">
                   {{ totalPercentage > 90 ? $t('budgets.status_critical') : (totalPercentage > 70 ? $t('budgets.status_warning') : $t('budgets.status_good')) }}
                </p>
             </div>
          </div>
       </AppCard>
    </div>

    <div class="space-y-8 md:space-y-12 animate-slide-up" style="animation-delay: 200ms">
       <!-- Active Budgets Grid -->
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div v-for="b in budgetStore.budgetsWithStats" :key="b.id" class="group">
             <AppCard class="relative overflow-hidden group-hover:shadow-2xl transition-all duration-500 border-slate-100 dark:border-gray-800 !p-6 md:!p-8 group-hover:border-primary-500/30">
                <div class="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                   <div class="flex items-center gap-4 md:gap-5">
                      <div :style="{ backgroundColor: b.categories?.color + '15', color: b.categories?.color }" 
                           class="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                         <component :is="categoryStore.resolveIcon(b.categories?.icon)" :size="20" class="md:hidden" />
                         <component :is="categoryStore.resolveIcon(b.categories?.icon)" :size="32" class="hidden md:block" />
                      </div>
                      <div>
                         <h4 class="text-lg md:text-xl font-black dark:text-white tracking-tight">{{ b.categories?.name }}</h4>
                         <div class="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5">
                            <span class="px-2 py-0.5 bg-slate-100 dark:bg-gray-800 rounded-lg text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{{ b.period_type }}</span>
                            <span class="text-[10px] md:text-xs font-black text-slate-400 tabular-nums">{{ $t('budgets.limit') }}: Rp {{ formatRaw(b.amount) }}</span>
                         </div>
                      </div>
                   </div>
                   <div class="flex gap-2 w-full sm:w-auto justify-end opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all transform lg:translate-x-4 lg:group-hover:translate-x-0">
                      <button @click="openEdit(b)" class="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl md:rounded-2xl transition-all border border-slate-100 dark:border-gray-800 hover:border-primary-100 active:scale-90 shadow-sm bg-white dark:bg-gray-800"><Pencil :size="16" /></button>
                      <button @click="confirmDelete(b)" class="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl md:rounded-2xl transition-all border border-slate-100 dark:border-gray-800 hover:border-rose-100 active:scale-90 shadow-sm bg-white dark:bg-gray-800"><Trash2 :size="16" /></button>
                   </div>
                </div>

                <!-- Metrics Grid -->
                <div class="grid grid-cols-2 gap-4 md:gap-6 mb-8">
                   <div class="p-4 md:p-5 bg-slate-50 dark:bg-gray-900/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-gray-800 group-hover:border-primary-100/30 transition-colors">
                      <p class="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{{ $t('budgets.spent') }}</p>
                      <p class="text-base md:text-lg font-black dark:text-white tabular-nums tracking-tighter">{{ formatIDR(b.spent) }}</p>
                   </div>
                   <div class="p-4 md:p-5 bg-slate-50 dark:bg-gray-900/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-gray-800 group-hover:border-primary-100/30 transition-colors">
                      <p class="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{{ $t('budgets.remaining') }}</p>
                      <p :class="b.isOver ? 'text-rose-500' : 'text-emerald-500'" class="text-base md:text-lg font-black tabular-nums tracking-tighter">{{ formatIDR(b.remaining) }}</p>
                   </div>
                </div>

                <!-- Progress Section -->
                <div class="space-y-4">
                   <div class="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                      <span class="text-slate-400">{{ $t('budgets.usage_quota') }}</span>
                      <span :class="b.percentage > 100 ? 'text-rose-500' : 'text-slate-900 dark:text-white'">{{ b.percentage.toFixed(1) }}%</span>
                   </div>
                   <div class="relative w-full h-3 md:h-4 bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-slate-200 dark:ring-gray-800">
                      <div 
                        class="absolute left-1 top-1 bottom-1 transition-all duration-1000 ease-out rounded-full shadow-lg"
                        :class="getProgressColor(b.percentage)"
                        :style="{ width: `calc(${Math.min(b.percentage, 100)}% - 8px)` }"
                      ></div>
                   </div>
                   <div class="flex items-center gap-2">
                      <Info v-if="b.isOver" :size="12" class="text-rose-500" />
                      <p v-if="b.isOver" class="text-[8px] md:text-[10px] font-black text-rose-500 uppercase tracking-tight italic">{{ $t('budgets.exceeded_msg', { amount: formatRaw(b.spent - b.amount) }) }}</p>
                      <p v-else class="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Periode: {{ formatDate(b.periodRange.start) }} – {{ formatDate(b.periodRange.end) }}</p>
                   </div>
                </div>
             </AppCard>
          </div>

          <!-- Empty State -->
          <div v-if="budgetStore.budgets.length === 0" class="lg:col-span-2 py-20 md:py-32 text-center bg-slate-50 dark:bg-gray-900/30 rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-gray-800">
             <div class="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-gray-800 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-xl">
                <PieChart :size="32" class="md:hidden" stroke-width="1" />
                <PieChart :size="40" class="hidden md:block" stroke-width="1" />
             </div>
             <h3 class="text-xl md:text-2xl font-black dark:text-white opacity-40 uppercase tracking-[0.2em]">{{ $t('budgets.empty') }}</h3>
             <p class="text-xs md:text-sm font-medium text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed px-6 italic">
               {{ $t('budgets.empty_subtitle') }}
             </p>
             <AppButton variant="primary" size="lg" @click="openAddModal" class="mt-10 px-8 md:px-10">{{ $t('budgets.empty_btn') }}</AppButton>
          </div>
       </div>
    </div>

    <!-- Modals -->
    <BudgetFormModal 
      :is-open="showModal"
      :initial-data="editingBudget"
      @close="closeModal"
      @success="handleSuccess"
    />
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, PieChart, Pencil, Trash2, HeartPulse, Info } from 'lucide-vue-next'
import { useAuthStore } from '../stores/useAuthStore'
import { useBudgetStore } from '../stores/useBudgetStore'
import { useCategoryStore } from '../stores/useCategoryStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useCurrency } from '../composables/useCurrency'
import { useFormatDate } from '../composables/useFormatDate'

import AppShell from '../components/layout/AppShell.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'
import BudgetFormModal from '../components/features/BudgetFormModal.vue'

const authStore = useAuthStore()
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const router = useRouter()
const { formatIDR, formatRaw } = useCurrency()
const { formatDate } = useFormatDate()

const showModal = ref(false)
const editingBudget = ref(null)

onMounted(async () => {
  await Promise.all([
    budgetStore.fetchBudgets(),
    categoryStore.fetchInitialData(),
    transactionStore.fetchTransactions()
  ])
})

const totalMonthlyBudget = computed(() => {
  return budgetStore.budgets
    .filter(b => b.period_type === 'MONTHLY')
    .reduce((sum, b) => sum + Number(b.amount), 0)
})

const totalSpent = computed(() => {
  return budgetStore.budgetsWithStats
    .filter(b => b.period_type === 'MONTHLY')
    .reduce((sum, b) => sum + b.spent, 0)
})

const totalPercentage = computed(() => {
  if (totalMonthlyBudget.value === 0) return 0
  return (totalSpent.value / totalMonthlyBudget.value) * 100
})

const openAddModal = () => {
  editingBudget.value = null
  showModal.value = true
}

const openEdit = (budget) => {
  editingBudget.value = budget
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingBudget.value = null
}

const handleSuccess = () => {
  closeModal()
  budgetStore.fetchBudgets()
}

const confirmDelete = async (budget) => {
  if (confirm(t('budgets.delete_confirm', { name: budget.categories?.name }))) {
    await budgetStore.deleteBudget(budget.id)
  }
}

const getProgressColor = (percent) => {
  if (percent >= 100) return 'bg-rose-500 shadow-lg shadow-rose-500/20'
  if (percent >= 85) return 'bg-orange-500 shadow-lg shadow-orange-500/20'
  if (percent >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

const handleLogout = async () => { await authStore.logout(); router.push('/login') }

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
