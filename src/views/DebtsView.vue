<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    :page-title="$t('nav.debt')"
    @logout="handleLogout"
  >
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div class="animate-slide-up">
        <h2 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{{ $t('debts.full_title') }}</h2>
        <p class="text-sm text-slate-500 font-medium">{{ $t('debts.full_subtitle') }}</p>
      </div>

      <AppButton variant="primary" size="md" @click="openAddModal" class="animate-slide-up">
        <template #prefix><Plus :size="18" /></template>
        <span>{{ $t('debts.add') }}</span>
      </AppButton>
    </div>

    <!-- DTI Overview -->
    <div class="mb-12 animate-slide-up" style="animation-delay: 100ms">
       <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
          <div class="absolute -right-16 -top-16 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
             <div>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{{ $t('debts.monthly_obligation') }}</p>
                <h3 class="text-3xl font-black tabular-nums italic tracking-tighter">{{ formatIDR(debtStore.monthlyDebtObligation) }}</h3>
                <p class="text-[10px] font-bold text-slate-500 mt-1 uppercase">{{ $t('debts.contract_active') }}</p>
             </div>
             
             <div>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{{ $t('debts.dti_ratio') }}</p>
                <div class="flex items-center gap-3">
                   <h3 class="text-3xl font-black tabular-nums tracking-tighter">{{ debtStore.dtiRatio.toFixed(1) }}%</h3>
                   <span :class="getDtiBadgeClass(debtStore.dtiStatus)" class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {{ $t(`debts.dti_status_${debtStore.dtiStatus}`) }}
                   </span>
                </div>
                <p class="text-[10px] font-bold text-slate-500 mt-1 uppercase">{{ $t('debts.financial_health') }}</p>
             </div>

             <div class="flex items-center gap-4">
                <div class="flex-1">
                   <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">{{ $t('debts.financial_advice') }}</p>
                   <p class="text-xs font-medium text-slate-300 leading-relaxed">
                      {{ getDtiAdvice(debtStore.dtiStatus) }}
                   </p>
                </div>
             </div>
          </div>
       </div>
    </div>

    <!-- Debt List -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style="animation-delay: 200ms">
       <div v-for="debt in debtStore.debtsWithStats" :key="debt.id" class="group">
          <AppCard class="relative overflow-hidden group-hover:shadow-2xl transition-all duration-500 border-slate-100 dark:border-gray-800 !p-8">
             <div class="flex justify-between items-start mb-8">
                <div class="flex items-center gap-5">
                   <div class="w-16 h-16 rounded-[1.5rem] bg-slate-50 dark:bg-gray-900 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 text-slate-400 group-hover:text-primary-600">
                      <CreditCard :size="32" />
                   </div>
                   <div>
                      <h4 class="text-xl font-black dark:text-white tracking-tight">{{ debt.name }}</h4>
                      <div class="flex items-center gap-3 mt-1.5">
                         <span class="px-2.5 py-1 bg-slate-100 dark:bg-gray-800 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{{ $t('debts.tenure') }} {{ debt.tenure_months }} Bln</span>
                         <span class="text-xs font-black text-slate-400 tabular-nums">{{ $t('debts.start_date') }}: {{ formatDate(debt.start_date) }}</span>
                      </div>
                   </div>
                </div>
                <div class="flex gap-2">
                   <button @click="openEdit(debt)" class="p-2.5 text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-2xl transition-all border border-transparent hover:border-primary-100 active:scale-90"><Pencil :size="18" /></button>
                   <button @click="confirmDelete(debt)" class="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all border border-transparent hover:border-rose-100 active:scale-90"><Trash2 :size="18" /></button>
                </div>
             </div>

             <!-- Metrics Grid -->
             <div class="grid grid-cols-2 gap-6 mb-8">
                <div class="p-5 bg-slate-50 dark:bg-gray-900/50 rounded-3xl border border-slate-100 dark:border-gray-800 group-hover:border-primary-100/30 transition-colors">
                   <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{{ $t('debts.principal') }}</p>
                   <p class="text-lg font-black dark:text-white tabular-nums">{{ formatIDR(debt.total_principal) }}</p>
                </div>
                <div class="p-5 bg-slate-50 dark:bg-gray-900/50 rounded-3xl border border-slate-100 dark:border-gray-800 group-hover:border-primary-100/30 transition-colors">
                   <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{{ $t('debts.remaining') }}</p>
                   <p class="text-lg font-black text-rose-500 tabular-nums">{{ formatIDR(debt.remainingBalance) }}</p>
                </div>
             </div>

             <!-- Progress Section -->
             <div class="space-y-4">
                <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span class="text-slate-400">{{ $t('debts.tenure_progress', { current: debt.currentTenure, total: debt.tenure_months }) }}</span>
                   <span class="text-slate-900 dark:text-white">{{ $t('debts.paid_percentage', { percentage: debt.percentagePaid.toFixed(1) }) }}</span>
                </div>
                <div class="relative w-full h-4 bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden p-1 shadow-inner">
                   <div 
                     class="absolute left-1 top-1 bottom-1 transition-all duration-1000 ease-out rounded-full bg-gradient-to-r from-primary-500 to-indigo-500"
                     :style="{ width: `calc(${Math.min(debt.percentagePaid, 100)}% - 8px)` }"
                   ></div>
                </div>
                <div class="flex items-center justify-between">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-tight">{{ $t('debts.installment') }}: {{ formatIDR(debt.monthly_payment) }} / bln</p>
                   <p v-if="debt.remainingTenure > 0" class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ $t('debts.remaining_tenure', { months: debt.remainingTenure }) }}</p>
                   <p v-else class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{{ $t('debts.almost_paid') }}</p>
                </div>
             </div>
          </AppCard>
       </div>

       <!-- Empty State -->
       <div v-if="debtStore.debts.length === 0" class="lg:col-span-2 py-32 text-center bg-slate-50 dark:bg-gray-900/30 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-gray-800">
          <div class="w-24 h-24 bg-white dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-xl">
             <CreditCard :size="40" stroke-width="1" />
          </div>
          <h3 class="text-2xl font-black dark:text-white opacity-40 uppercase tracking-[0.2em]">{{ $t('debts.empty') }}</h3>
          <p class="text-sm font-medium text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed px-6">
            {{ $t('debts.empty_subtitle') }}
          </p>
          <AppButton variant="primary" size="lg" @click="openAddModal" class="mt-10 px-10">{{ $t('debts.empty_btn') }}</AppButton>
       </div>
    </div>

    <!-- Form Modal -->
    <DebtFormModal 
      :is-open="showModal"
      :initial-data="editingDebt"
      @close="closeModal"
      @success="debtStore.fetchDebts()"
    />
  </AppShell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, CreditCard, Pencil, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '../stores/useAuthStore'
import { useDebtStore } from '../stores/useDebtStore'
import { useCurrency } from '../composables/useCurrency'
import { useFormatDate } from '../composables/useFormatDate'

import AppShell from '../components/layout/AppShell.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'
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

const confirmDelete = async (debt) => {
  if (confirm(t('debts.delete_confirm', { name: debt.name }))) {
    await debtStore.deleteDebt(debt.id)
  }
}

const getDtiBadgeClass = (status) => {
  switch (status) {
    case 'safe': return 'bg-emerald-500 text-white'
    case 'healthy': return 'bg-emerald-100 text-emerald-700'
    case 'warning': return 'bg-amber-100 text-amber-700'
    case 'critical': return 'bg-rose-100 text-rose-700'
    default: return 'bg-slate-100'
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
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
