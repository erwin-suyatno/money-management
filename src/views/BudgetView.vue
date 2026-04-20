<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    :page-title="'Manajemen Anggaran'"
    @logout="handleLogout"
  >
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div class="animate-slide-up">
        <h2 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {{ $t('budgets.title') }}
        </h2>
        <p class="text-sm text-slate-500 font-medium">{{ $t('budgets.subtitle') }}</p>
      </div>

      <AppButton variant="primary" size="md" @click="openAddModal" class="animate-slide-up">
        <template #prefix><Plus :size="18" /></template>
        <span>{{ $t('budgets.set_budget') }}</span>
      </AppButton>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up" style="animation-delay: 100ms">
       <div class="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
          <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100/60 mb-2 relative z-10">{{ $t('budgets.monthly_total') }}</p>
          <h3 class="text-4xl font-black tabular-nums relative z-10 italic tracking-tighter">{{ formatIDR(totalMonthlyBudget) }}</h3>
          <div class="mt-4 flex items-center gap-2 relative z-10">
             <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
             <span class="text-[10px] font-black uppercase tracking-widest text-indigo-100/80">{{ $t('budgets.active_now') }}</span>
          </div>
       </div>

       <AppCard class="flex flex-col justify-center border-slate-100 dark:border-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{{ $t('budgets.current_usage') }}</p>
          <div class="flex items-baseline gap-2">
             <h3 class="text-3xl font-black dark:text-white tabular-nums tracking-tighter">{{ formatIDR(totalSpent) }}</h3>
             <span class="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg">{{ totalPercentage.toFixed(1) }}%</span>
          </div>
       </AppCard>

        <AppCard class="flex flex-col justify-center border-slate-100 dark:border-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{{ $t('budgets.health') }}</p>
          <div class="flex items-center gap-4">
             <div :class="totalPercentage > 90 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'" 
                  class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner">
                <HeartPulse :size="24" />
             </div>
             <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{{ $t('common.status') }}</p>
                <p class="text-sm font-black uppercase tracking-tight" :class="totalPercentage > 90 ? 'text-rose-600' : 'text-emerald-600'">
                   {{ totalPercentage > 90 ? $t('budgets.status_critical') : (totalPercentage > 70 ? $t('budgets.status_warning') : $t('budgets.status_good')) }}
                </p>
             </div>
          </div>
       </AppCard>
    </div>

    <div class="space-y-12 animate-slide-up" style="animation-delay: 200ms">
       <!-- Active Budgets Grid -->
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div v-for="b in budgetStore.budgetsWithStats" :key="b.id" class="group">
             <AppCard class="relative overflow-hidden group-hover:shadow-2xl transition-all duration-500 border-slate-100 dark:border-gray-800 !p-8">
                <div class="flex justify-between items-start mb-8">
                   <div class="flex items-center gap-5">
                      <div :style="{ backgroundColor: b.categories?.color + '15', color: b.categories?.color }" 
                           class="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                         <component :is="categoryStore.resolveIcon(b.categories?.icon)" :size="32" />
                      </div>
                      <div>
                         <h4 class="text-xl font-black dark:text-white tracking-tight">{{ b.categories?.name }}</h4>
                         <div class="flex items-center gap-3 mt-1.5">
                            <span class="px-2.5 py-1 bg-slate-100 dark:bg-gray-800 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{{ b.period_type }}</span>
                            <span class="text-xs font-black text-slate-400 tabular-nums">{{ $t('budgets.limit') }}: Rp {{ formatRaw(b.amount) }}</span>
                         </div>
                      </div>
                   </div>
                   <div class="flex gap-2">
                      <button @click="openEdit(b)" class="p-2.5 text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-2xl transition-all border border-transparent hover:border-primary-100 active:scale-90"><Pencil :size="18" /></button>
                      <button @click="confirmDelete(b)" class="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all border border-transparent hover:border-rose-100 active:scale-90"><Trash2 :size="18" /></button>
                   </div>
                </div>

                <!-- Metrics Grid -->
                <div class="grid grid-cols-2 gap-6 mb-8">
                   <div class="p-5 bg-slate-50 dark:bg-gray-900/50 rounded-3xl border border-slate-100 dark:border-gray-800 group-hover:border-primary-100/30 transition-colors">
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{{ $t('budgets.spent') }}</p>
                      <p class="text-lg font-black dark:text-white tabular-nums">{{ formatIDR(b.spent) }}</p>
                   </div>
                   <div class="p-5 bg-slate-50 dark:bg-gray-900/50 rounded-3xl border border-slate-100 dark:border-gray-800 group-hover:border-primary-100/30 transition-colors">
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{{ $t('budgets.remaining') }}</p>
                      <p :class="b.isOver ? 'text-rose-500' : 'text-emerald-500'" class="text-lg font-black tabular-nums">{{ formatIDR(b.remaining) }}</p>
                   </div>
                </div>

                <!-- Progress Section -->
                <div class="space-y-4">
                   <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span class="text-slate-400">{{ $t('budgets.usage_quota') }}</span>
                      <span :class="b.percentage > 100 ? 'text-rose-500' : 'text-slate-900 dark:text-white'">{{ b.percentage.toFixed(1) }}%</span>
                   </div>
                   <div class="relative w-full h-4 bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden p-1 shadow-inner">
                      <div 
                        class="absolute left-1 top-1 bottom-1 transition-all duration-1000 ease-out rounded-full"
                        :class="getProgressColor(b.percentage)"
                        :style="{ width: `calc(${Math.min(b.percentage, 100)}% - 8px)` }"
                      ></div>
                   </div>
                   <div class="flex items-center gap-2">
                      <Info v-if="b.isOver" :size="14" class="text-rose-500" />
                      <p v-if="b.isOver" class="text-[10px] font-black text-rose-500 uppercase tracking-tight italic">{{ $t('budgets.exceeded_msg', { amount: formatRaw(b.spent - b.amount) }) }}</p>
                      <p v-else class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Periode: {{ formatDate(b.periodRange.start) }} – {{ formatDate(b.periodRange.end) }}</p>
                   </div>
                </div>
             </AppCard>
          </div>

          <!-- Empty State -->
          <div v-if="budgetStore.budgets.length === 0" class="lg:col-span-2 py-32 text-center bg-slate-50 dark:bg-gray-900/30 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-gray-800">
             <div v-for="i in 1" :key="i" class="w-24 h-24 bg-white dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-xl">
                <PieChart :size="40" stroke-width="1" />
             </div>
             <h3 class="text-2xl font-black dark:text-white opacity-40 uppercase tracking-[0.2em]">{{ $t('budgets.empty') }}</h3>
             <p class="text-sm font-medium text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed px-6">
               {{ $t('budgets.empty_subtitle') }}
             </p>
             <AppButton variant="primary" size="lg" @click="openAddModal" class="mt-10 px-10">{{ $t('budgets.empty_btn') }}</AppButton>
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
  if (confirm(t('budgets.delete_confirm', { category: budget.categories?.name }))) {
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
