<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || $t('common.user')"
    :user-email="authStore.user?.email"
    :page-title="$t('nav.debt')"
    @logout="handleLogout"
  >
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10 px-1 md:px-0">
      <div class="animate-slide-up">
        <h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
          {{ $t('debts.full_title') }}
        </h2>
        <p class="text-xs md:text-sm text-slate-500 font-medium">{{ $t('debts.full_subtitle') }}</p>
      </div>

      <AppButton 
        variant="primary" 
        size="md" 
        @click="openAddModal" 
        class="animate-slide-up shadow-xl shadow-primary-500/20 w-full md:w-auto"
      >
        <template #prefix><Plus :size="18" /></template>
        <span>{{ $t('debts.add') }}</span>
      </AppButton>
    </div>

    <!-- DTI Overview / Health Card -->
    <div class="mb-10 md:mb-12 animate-slide-up" style="animation-delay: 100ms">
       <div class="bg-white dark:bg-slate-950 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 text-slate-900 dark:text-white relative overflow-hidden group shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-transparent">
          <!-- Background Effects -->
          <div class="absolute -right-20 -top-20 w-64 md:w-80 h-64 md:h-80 bg-primary-600/10 dark:bg-primary-600/20 rounded-full blur-[80px] md:blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
          <div class="absolute -left-20 -bottom-20 w-48 md:w-60 h-48 md:h-60 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[60px] md:blur-[80px]"></div>
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 relative z-10">
             <!-- Primary Stat -->
             <div class="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-white/10 pb-8 lg:pb-0 lg:pr-10">
                <p class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400 mb-3">{{ $t('debts.monthly_obligation') }}</p>
                <h3 class="text-3xl md:text-5xl font-black tabular-nums italic tracking-tighter text-slate-900 dark:text-white mb-4">
                  {{ formatIDR(debtStore.monthlyDebtObligation) }}
                </h3>
                <div class="flex items-center gap-2">
                   <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                   <span class="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                     {{ debtStore.debts.length }} {{ $t('debts.contract_active') }}
                   </span>
                </div>
             </div>
             
             <!-- Health Indicator -->
             <div class="lg:col-span-4 flex flex-col justify-center">
                <p class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400 mb-4">{{ $t('debts.dti_ratio') }}</p>
                <div class="flex items-center gap-4 md:gap-5 mb-6">
                   <h3 class="text-3xl md:text-4xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white">{{ debtStore.dtiRatio.toFixed(1) }}%</h3>
                   <div :class="getDtiBadgeClass(debtStore.dtiStatus)" class="px-2.5 md:px-3 py-1 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {{ $t(`debts.dti_status_${debtStore.dtiStatus}`) }}
                   </div>
                </div>
                <!-- Mini Progress Bar -->
                <div class="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                   <div 
                     class="h-full transition-all duration-1000 ease-out"
                     :class="getDtiColor(debtStore.dtiStatus)"
                     :style="{ width: `${Math.min(debtStore.dtiRatio, 100)}%` }"
                   ></div>
                </div>
             </div>

             <!-- Advice Column -->
             <div class="lg:col-span-4 flex items-center">
                <div class="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-[2rem] p-5 md:p-6 border border-slate-100 dark:border-white/10 w-full">
                   <div class="flex items-center gap-3 mb-3">
                      <Zap :size="14" class="text-amber-400 fill-amber-400/20" />
                      <p class="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">{{ $t('debts.financial_advice') }}</p>
                   </div>
                   <p class="text-[11px] md:text-xs font-medium text-slate-600 dark:text-slate-200 leading-relaxed italic">
                      "{{ getDtiAdvice(debtStore.dtiStatus) }}"
                   </p>
                </div>
             </div>
          </div>
       </div>
    </div>

    <!-- Active Debt List -->
    <div class="space-y-8 animate-slide-up" style="animation-delay: 200ms">
       <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-4">
             <div class="w-10 h-10 bg-slate-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white shadow-inner">
                <History :size="20" />
             </div>
             <div>
                <h3 class="text-lg font-black dark:text-white tracking-tight">{{ $t('debts.contract_active') }}</h3>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ $t('debts.list_desc') }}</p>
             </div>
          </div>
       </div>

       <div v-if="debtStore.loading && debtStore.debts.length === 0" class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AppCard v-for="i in 2" :key="i" class="!p-10 space-y-8">
             <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                   <AppSkeleton variant="circle" width="60px" height="60px" />
                   <div class="space-y-2">
                      <AppSkeleton width="200px" height="24px" />
                      <AppSkeleton width="120px" height="12px" />
                   </div>
                </div>
             </div>
             <AppSkeleton height="14px" class="w-full rounded-full" />
             <div class="grid grid-cols-2 gap-4">
                <AppSkeleton height="40px" class="rounded-2xl" />
                <AppSkeleton height="40px" class="rounded-2xl" />
             </div>
          </AppCard>
       </div>

       <div v-else-if="debtStore.debts.length === 0" class="py-32 text-center bg-slate-50 dark:bg-gray-900/30 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-gray-800">
          <div class="w-24 h-24 bg-white dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-xl">
             <CreditCard :size="40" stroke-width="1" />
          </div>
          <h3 class="text-2xl font-black dark:text-white opacity-40 uppercase tracking-[0.2em]">{{ $t('debts.empty') }}</h3>
          <p class="text-sm font-medium text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed px-6 italic">
            {{ $t('debts.empty_subtitle') }}
          </p>
          <AppButton variant="primary" size="lg" @click="openAddModal" class="mt-10 px-10">{{ $t('debts.empty_btn') }}</AppButton>
       </div>

       <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div v-for="debt in debtStore.debtsWithStats" :key="debt.id" class="group">
             <AppCard 
               class="relative overflow-hidden group-hover:shadow-2xl transition-all duration-500 border-slate-100 dark:border-gray-800 !p-6 md:!p-8 group-hover:border-primary-500/30"
               @click="openEdit(debt)"
             >
                <div class="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 md:mb-10">
                   <div class="flex items-center gap-4 md:gap-6">
                      <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.75rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 ring-4 md:ring-8 ring-slate-100 dark:ring-gray-800/50">
                         <Banknote :size="20" class="md:hidden" />
                         <Banknote :size="28" class="hidden md:block" />
                      </div>
                      <div>
                         <h4 class="text-lg md:text-xl font-black dark:text-white tracking-tight mb-1">{{ debt.name }}</h4>
                         <div class="flex flex-wrap items-center gap-2 md:gap-3">
                            <span class="px-2 py-0.5 bg-slate-100 dark:bg-gray-800 rounded-lg text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                              {{ debt.tenure_months }} {{ $t('debts.months') }}
                            </span>
                            <span class="text-[9px] md:text-[10px] font-bold text-slate-400 tabular-nums">{{ formatDate(debt.start_date) }}</span>
                         </div>
                      </div>
                   </div>
                   <!-- Actions: Always visible on mobile, hover on desktop -->
                   <div class="flex gap-2 w-full sm:w-auto justify-end opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all transform lg:translate-x-4 lg:group-hover:translate-x-0">
                      <button @click.stop="openEdit(debt)" class="p-2.5 md:p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl md:rounded-2xl transition-all border border-slate-100 dark:border-gray-800 hover:border-primary-100 active:scale-90 shadow-sm bg-white dark:bg-gray-800"><Pencil :size="16" /></button>
                      <button @click.stop="confirmDelete(debt)" class="p-2.5 md:p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl md:rounded-2xl transition-all border border-slate-100 dark:border-gray-800 hover:border-rose-100 active:scale-90 shadow-sm bg-white dark:bg-gray-800"><Trash2 :size="16" /></button>
                   </div>
                </div>

                <!-- Main Metrics -->
                <div class="grid grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
                   <div class="p-4 md:p-6 bg-slate-50 dark:bg-gray-900/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-gray-800 group-hover:border-primary-100/50 transition-colors relative overflow-hidden">
                      <div class="absolute -right-4 -top-4 w-12 h-12 bg-primary-500/5 rounded-full blur-xl"></div>
                      <p class="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{{ $t('debts.principal') }}</p>
                      <p class="text-base md:text-xl font-black dark:text-white tabular-nums tracking-tighter italic">{{ formatIDR(debt.total_principal) }}</p>
                   </div>
                   <div class="p-4 md:p-6 bg-slate-50 dark:bg-gray-900/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-gray-800 group-hover:border-rose-100/50 transition-colors relative overflow-hidden">
                      <div class="absolute -right-4 -top-4 w-12 h-12 bg-rose-500/5 rounded-full blur-xl"></div>
                      <p class="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{{ $t('debts.remaining') }}</p>
                      <p class="text-base md:text-xl font-black text-rose-500 tabular-nums tracking-tighter italic">{{ formatIDR(debt.remainingBalance) }}</p>
                   </div>
                </div>

                <!-- Progress Section -->
                <div class="space-y-4 md:space-y-5">
                   <div class="flex justify-between items-end text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                      <div class="space-y-1">
                         <span class="text-slate-400 block">{{ $t('debts.tenure_progress', { current: debt.currentTenure, total: debt.tenure_months }) }}</span>
                         <span class="text-xs text-slate-900 dark:text-white tabular-nums">{{ debt.percentagePaid.toFixed(1) }}%</span>
                      </div>
                      <div class="text-right">
                         <span class="text-slate-400 block">{{ $t('debts.installment') }}</span>
                         <span class="text-xs md:text-sm font-black text-slate-900 dark:text-white tabular-nums">{{ formatIDR(debt.monthly_payment) }}</span>
                      </div>
                   </div>
                   
                   <div class="relative w-full h-4 md:h-5 bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-slate-200 dark:ring-gray-800">
                      <div 
                        class="absolute left-1 top-1 bottom-1 transition-all duration-1000 ease-out rounded-full bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 shadow-lg"
                        :style="{ width: `calc(${Math.min(debt.percentagePaid, 100)}% - 8px)` }"
                      >
                         <div class="w-full h-full bg-white/20 animate-pulse"></div>
                      </div>
                   </div>

                   <div class="flex items-center justify-between pt-1 md:pt-2">
                      <div class="flex items-center gap-2">
                         <div :class="debt.remainingTenure > 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'" 
                              class="px-2.5 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                            <Clock v-if="debt.remainingTenure > 0" :size="10" />
                            <Trophy v-else :size="10" />
                            {{ debt.remainingTenure > 0 ? $t('debts.remaining_tenure', { months: debt.remainingTenure }) : $t('debts.almost_paid') }}
                         </div>
                      </div>
                   </div>
                </div>
             </AppCard>
          </div>
       </div>

    </div>

    <!-- Form Modal -->
    <DebtFormModal 
      :is-open="showModal"
      :initial-data="editingDebt"
      @close="closeModal"
      @success="handleSuccess"
    />
  </AppShell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, CreditCard, Pencil, Trash2, Banknote, History, Zap, Clock, Trophy } from 'lucide-vue-next'
import { useAuthStore } from '../stores/useAuthStore'
import { useDebtStore } from '../stores/useDebtStore'
import { useCurrency } from '../composables/useCurrency'
import { useFormatDate } from '../composables/useFormatDate'

import AppShell from '../components/layout/AppShell.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppSkeleton from '../components/ui/AppSkeleton.vue'
import DebtFormModal from '../components/features/DebtFormModal.vue'

const authStore = useAuthStore()
const debtStore = useDebtStore()
const router = useRouter()
const { formatIDR } = useCurrency()
const { formatDate } = useFormatDate()

const showModal = ref(false)
const editingDebt = ref(null)

onMounted(async () => {
  await debtStore.fetchDebts()
})

const openAddModal = () => {
  editingDebt.value = null
  showModal.value = true
}

const openEdit = (debt) => {
  editingDebt.value = debt
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingDebt.value = null
}

const handleSuccess = () => {
  closeModal()
  debtStore.fetchDebts()
}

const confirmDelete = async (debt) => {
  if (confirm(t('debts.delete_confirm', { name: debt.name }))) {
    await debtStore.deleteDebt(debt.id)
    debtStore.fetchDebts()
  }
}

const getDtiBadgeClass = (status) => {
  switch (status) {
    case 'safe': return 'bg-emerald-500 text-white'
    case 'healthy': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'critical': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    default: return 'bg-slate-100 text-slate-600'
  }
}

const getDtiColor = (status) => {
  switch (status) {
    case 'safe':
    case 'healthy': return 'bg-emerald-500'
    case 'warning': return 'bg-amber-500'
    case 'critical': return 'bg-rose-500'
    default: return 'bg-slate-500'
  }
}

const getDtiAdvice = (status) => {
  switch (status) {
    case 'safe': return t('debts.advice_safe')
    case 'healthy': return t('debts.advice_healthy')
    case 'warning': return t('debts.advice_warning')
    case 'critical': return t('debts.advice_critical')
    default: return t('debts.advice_default')
  }
}

const handleLogout = async () => { await authStore.logout(); router.push('/login') }

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
