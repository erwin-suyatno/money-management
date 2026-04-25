<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    :page-title="$t('transactions.title')"
    @logout="handleLogout"
  >
    <!-- Header Actions -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10 px-1 md:px-0">
      <div class="animate-slide-up">
        <h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
          {{ $t('transactions.title') }}
        </h2>
        <p class="text-xs md:text-sm text-slate-500 font-medium">{{ $t('transactions.subtitle') }}</p>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <div class="flex bg-slate-100 dark:bg-gray-800 p-1.5 rounded-2xl shadow-inner w-full sm:w-auto">
          <button 
            @click="viewMode = 'list'"
            class="flex-1 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            :class="viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-md' : 'text-slate-400'"
          >
            {{ $t('transactions.list_view') }}
          </button>
          <button 
            @click="viewMode = 'calendar'"
            class="flex-1 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            :class="viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-md' : 'text-slate-400'"
          >
            {{ $t('transactions.calendar_view') }}
          </button>
        </div>
        
        <AppButton 
          variant="primary" 
          size="md" 
          class="w-full sm:w-auto !rounded-2xl shadow-xl shadow-primary-500/20" 
          @click="openAddModal"
        >
          <template #prefix><Plus :size="18" /></template>
          <span>{{ $t('common.add') }}</span>
        </AppButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Mobile Filter Toggle -->
      <div class="lg:hidden w-full mb-2">
        <AppButton 
          variant="secondary" 
          size="md" 
          class="w-full !rounded-2xl border-slate-200 dark:border-gray-800" 
          @click="showMobileFilters = !showMobileFilters"
        >
          <template #prefix><Search :size="18" /></template>
          <span>{{ showMobileFilters ? $t('common.cancel') : $t('transactions.filter') }}</span>
        </AppButton>
      </div>

      <!-- Left Column: Filters & Quick Summary -->
      <aside :class="showMobileFilters ? 'block' : 'hidden lg:block'" class="lg:col-span-4 space-y-6">
        <AppCard>
          <template #header>
            <div class="flex items-center justify-between w-full">
              <h4 class="text-xs font-black uppercase tracking-widest">{{ $t('transactions.filter') }}</h4>
              <button v-if="showMobileFilters" @click="showMobileFilters = false" class="lg:hidden text-slate-400"><X :size="16" /></button>
            </div>
          </template>
          <div class="space-y-4">
            <AppInput 
              id="search" 
              v-model="searchQuery" 
              :placeholder="$t('transactions.search')" 
              clearable
            >
              <template #prefix><Search :size="16" /></template>
            </AppInput>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[9px] font-black text-slate-400 uppercase ml-1">{{ $t('transactions.from') }}</label>
                <input type="date" v-model="startDate" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div class="space-y-1">
                <label class="text-[9px] font-black text-slate-400 uppercase ml-1">{{ $t('transactions.to') }}</label>
                <input type="date" v-model="endDate" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <div class="flex gap-2">
              <AppButton 
                variant="secondary" 
                size="sm" 
                class="flex-1"
                :class="{ '!bg-primary-600 !text-white': typeFilter === 'ALL' }"
                @click="typeFilter = 'ALL'"
              >{{ $t('transactions.type_all') }}</AppButton>
              <AppButton 
                variant="secondary" 
                size="sm" 
                class="flex-1"
                :class="{ '!bg-primary-600 !text-white': typeFilter === 'EXPENSE' }"
                @click="typeFilter = 'EXPENSE'"
              >{{ $t('transactions.type_expense') }}</AppButton>
              <AppButton 
                variant="secondary" 
                size="sm" 
                class="flex-1"
                :class="{ '!bg-primary-600 !text-white': typeFilter === 'INCOME' }"
                @click="typeFilter = 'INCOME'"
              >{{ $t('transactions.type_income') }}</AppButton>
            </div>
          </div>
        </AppCard>

        <AppCard class="bg-indigo-600 border-none text-white relative overflow-hidden">
          <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <p class="text-[10px] font-black uppercase tracking-widest text-indigo-100/60 mb-1">{{ $t('transactions.period_total') }}</p>
            <div class="flex items-baseline gap-1">
               <span class="text-xs font-bold text-indigo-100/40">Rp</span>
               <h3 class="text-3xl font-black tabular-nums">{{ formatRaw(totalSelectedAmount) }}</h3>
            </div>
            <div class="mt-4 flex gap-4 text-[10px] font-black uppercase">
               <span class="text-emerald-300">+ {{ formatRaw(periodIncome) }}</span>
               <span class="text-rose-300">- {{ formatRaw(periodExpense) }}</span>
            </div>
          </div>
        </AppCard>
      </aside>

      <!-- Right Column: Content -->
      <main class="lg:col-span-8">
        <!-- List View -->
        <div v-if="viewMode === 'list'" class="space-y-6 animate-slide-up">
          <div v-if="Object.keys(groupedTransactions).length === 0" class="py-24 text-center">
            <div class="w-20 h-20 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <History :size="32" class="text-slate-300" />
            </div>
            <h3 class="text-lg font-black dark:text-white opacity-50 uppercase tracking-widest">{{ $t('transactions.empty') }}</h3>
            <p class="text-xs font-bold text-slate-400 mt-2 italic">{{ $t('transactions.empty_subtitle') }}</p>
          </div>

          <div v-for="(txs, dateKey) in groupedTransactions" :key="dateKey" class="space-y-3">
            <div class="flex items-center justify-between px-2">
              <h4 class="text-xs font-black uppercase tracking-widest text-slate-400">
                {{ formatGroupDate(dateKey) }}
              </h4>
              <span class="text-[10px] font-bold text-slate-500 italic">
                {{ $t('transactions.items_count', { count: txs.length }) }}
              </span>
            </div>
            
            <AppCard class="!p-0 overflow-hidden divide-y divide-slate-100 dark:divide-gray-800/50">
                <template v-if="isLoading">
                  <div v-for="i in 5" :key="i" class="p-4 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <AppSkeleton variant="circle" width="40px" height="40px" />
                      <div class="space-y-2">
                        <AppSkeleton width="140px" height="14px" />
                        <AppSkeleton width="100px" height="10px" />
                      </div>
                    </div>
                    <AppSkeleton width="100px" height="18px" />
                  </div>
                </template>
                <div 
                  v-else
                  v-for="tx in txs" 
                  :key="tx.id" 
                  class="p-4 hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-all flex items-center justify-between group cursor-pointer"
                  @click="openDetails(tx)"
                >
                <div class="flex items-center gap-4">
                  <div 
                    v-if="tx.categories" 
                    :style="{ backgroundColor: tx.categories.color + '15', color: tx.categories.color }" 
                    class="w-10 h-10 rounded-xl flex items-center justify-center"
                  >
                    <component :is="categoryStore.resolveIcon(tx.categories?.icon)" :size="20" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{{ tx.description || tx.categories?.name }}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">{{ tx.wallets?.name }}</span>
                      <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">{{ tx.categories?.name }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="text-right">
                  <p :class="tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'" class="text-sm font-black tabular-nums">
                    {{ tx.type === 'INCOME' ? '+' : '-' }}{{ formatRaw(tx.amount) }}
                  </p>
                  <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <button @click.stop="openEdit(tx)" class="text-slate-400 hover:text-primary-600 p-1"><Pencil :size="12" /></button>
                    <button @click.stop="confirmDelete(tx)" class="text-slate-400 hover:text-rose-600 p-1"><Trash2 :size="12" /></button>
                  </div>
                </div>
              </div>
            </AppCard>
          </div>
        </div>

        <!-- Calendar View -->
        <div v-else class="animate-slide-up">
           <div class="flex items-center justify-between mb-4 px-2">
            <h3 class="text-lg font-black dark:text-white">{{ $t('transactions.calendar_header') }}</h3>
            <div class="flex items-center gap-2">
              <AppButton variant="secondary" size="sm" icon-only @click="prevMonth"><ChevronLeft :size="16" /></AppButton>
              <span class="text-xs font-bold uppercase tracking-widest min-w-[120px] text-center">{{ getMonthName(currentMonth) }} {{ currentMonth.getFullYear() }}</span>
              <AppButton variant="secondary" size="sm" icon-only @click="nextMonth"><ChevronRight :size="16" /></AppButton>
            </div>
          </div>
          <AppCard class="!p-0">
            <div class="grid grid-cols-7 border-b border-slate-100 dark:border-gray-800/50">
              <div v-for="day in [$t('transactions.days_min'), $t('transactions.days_sen'), $t('transactions.days_sel'), $t('transactions.days_rab'), $t('transactions.days_kam'), $t('transactions.days_jum'), $t('transactions.days_sab')]" :key="day" class="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                {{ day }}
              </div>
            </div>
            <div class="grid grid-cols-7">
              <template v-if="isLoading">
                <div v-for="i in 35" :key="i" class="h-24 sm:h-32 p-3 border-r border-b border-slate-100 dark:border-gray-800/50">
                  <AppSkeleton width="20px" height="10px" />
                </div>
              </template>
              <div v-else v-for="(d, i) in calendarDays" :key="i" @click="openDaySummary(d.date)"
                  class="h-24 sm:h-32 p-3 border-r border-b border-slate-100 dark:border-gray-800/50 relative transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800/20"
                  :class="[!d.current ? 'bg-slate-50/50 dark:bg-gray-900/10 opacity-40' : '']">
                <span class="text-[10px] font-black inline-flex items-center justify-center" 
                      :class="[
                        d.current ? (isToday(d.date) ? 'bg-primary-600 text-white w-6 h-6 rounded-full' : 'text-slate-900 dark:text-white') : 'text-slate-300'
                      ]">
                  {{ d.day }}
                </span>
                <div v-if="dailySummaries[getDateKey(d.date)]" class="mt-2 space-y-1">
                  <div v-if="dailySummaries[getDateKey(d.date)].income > 0" class="h-1 lg:h-4 w-full bg-emerald-500/10 rounded-full flex items-center px-1">
                     <div class="w-1 h-1 rounded-full bg-emerald-500 lg:mr-1.5"></div>
                     <span class="text-[8px] font-black text-emerald-600 hidden lg:block uppercase tracking-tighter">+{{ (dailySummaries[getDateKey(d.date)].income/1000).toFixed(0) }}k</span>
                  </div>
                  <div v-if="dailySummaries[getDateKey(d.date)].expense > 0" class="h-1 lg:h-4 w-full bg-rose-500/10 rounded-full flex items-center px-1">
                     <div class="w-1 h-1 rounded-full bg-rose-500 lg:mr-1.5"></div>
                     <span class="text-[8px] font-black text-rose-600 hidden lg:block uppercase tracking-tighter">-{{ (dailySummaries[getDateKey(d.date)].expense/1000).toFixed(0) }}k</span>
                  </div>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </main>
    </div>

    <!-- Modals -->
    <TransactionFormModal 
      :is-open="showAddModal"
      :date="selectedDate"
      embedded 
      :initial-data="editingTx"
      @close="closeAddModal" 
      @success="handleTxSuccess" 
    />

    <CalendarDayModal 
      :is-open="showDayModal" 
      :date="selectedDate" 
      :transactions="selectedDateTransactions" 
      @close="showDayModal = false" 
      @quick-add="handleQuickAddFromCalendar"
      @edit="openEdit" 
    />
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Plus, 
  Search, 
  History, 
  ChevronLeft, 
  ChevronRight,
  Pencil,
  Trash2,
  Tag,
  X
} from 'lucide-vue-next'

import { useAuthStore } from '../stores/useAuthStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useWalletStore } from '../stores/useWalletStore'
import { useCategoryStore } from '../stores/useCategoryStore'
import { useCurrency } from '../composables/useCurrency'
import { useFormatDate } from '../composables/useFormatDate'

import AppShell from '../components/layout/AppShell.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppModal from '../components/ui/AppModal.vue'
import AppSkeleton from '../components/ui/AppSkeleton.vue'

const isLoading = computed(() => transactionStore.loading)

// Logic components (existing)
import TransactionFormModal from '../components/TransactionFormModal.vue'
import CalendarDayModal from '../components/CalendarDayModal.vue'

const authStore = useAuthStore()
const transactionStore = useTransactionStore()
const walletStore = useWalletStore()
const categoryStore = useCategoryStore()
const router = useRouter()
const { formatRaw } = useCurrency()
const { formatDate, getMonthName } = useFormatDate()

const viewMode = ref('list')
const searchQuery = ref('')
const typeFilter = ref('ALL')
const startDate = ref('')
const endDate = ref('')
const showAddModal = ref(false)
const showDayModal = ref(false)
const showMobileFilters = ref(false)
const editingTx = ref(null)
const selectedDate = ref(null)
const currentMonth = ref(new Date())

onMounted(async () => {
  await Promise.all([
    transactionStore.fetchTransactions(),
    walletStore.fetchWallets()
  ])
})

const filteredTransactions = computed(() => {
  let list = [...transactionStore.transactions]
  
  // Search filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(tx => 
      tx.description?.toLowerCase().includes(q) || 
      tx.categories?.name?.toLowerCase().includes(q)
    )
  }

  // Type filter
  if (typeFilter.value !== 'ALL') {
    list = list.filter(tx => tx.type === typeFilter.value)
  }

  // Date filters
  if (startDate.value) {
    const start = new Date(startDate.value)
    list = list.filter(tx => new Date(tx.created_at) >= start)
  }
  if (endDate.value) {
    const end = new Date(endDate.value)
    end.setHours(23, 59, 59, 999)
    list = list.filter(tx => new Date(tx.created_at) <= end)
  }

  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const groupedTransactions = computed(() => {
  const groups = {}
  filteredTransactions.value.forEach(tx => {
    const date = new Date(tx.created_at)
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    if (!groups[key]) groups[key] = []
    groups[key].push(tx)
  })
  return groups
})

const totalSelectedAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, tx) => {
    const val = Number(tx.amount)
    return tx.type === 'INCOME' ? sum + val : sum - val
  }, 0)
})

const periodIncome = computed(() => filteredTransactions.value.filter(tx => tx.type === 'INCOME').reduce((s, tx) => s + Number(tx.amount), 0))
const periodExpense = computed(() => filteredTransactions.value.filter(tx => tx.type === 'EXPENSE').reduce((s, tx) => s + Number(tx.amount), 0))

const formatGroupDate = (dateKey) => {
  const [y, m, d] = dateKey.split('-')
  const date = new Date(y, m - 1, d)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return t('transactions.today')
  
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return t('transactions.yesterday')
  
  return formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })
}

// Calendar Logic
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  const startOffset = firstDay.getDay()
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) days.push({ day: prevMonthLastDay - i, current: false, date: new Date(year, month - 1, prevMonthLastDay - i) })
  for (let i = 1; i <= lastDay.getDate(); i++) days.push({ day: i, current: true, date: new Date(year, month, i) })
  const endOffset = 42 - days.length
  for (let i = 1; i <= endOffset; i++) days.push({ day: i, current: false, date: new Date(year, month + 1, i) })
  return days
})

const dailySummaries = computed(() => {
  const summaries = {}
  transactionStore.transactions.forEach(tx => {
    const d = new Date(tx.created_at)
    const key = getDateKey(d)
    if (!summaries[key]) summaries[key] = { income: 0, expense: 0 }
    if (tx.type === 'INCOME') summaries[key].income += Number(tx.amount)
    if (tx.type === 'EXPENSE') summaries[key].expense += Number(tx.amount)
  })
  return summaries
})

const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}
const getDateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
const prevMonth = () => { currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1) }
const nextMonth = () => { currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1) }

// Actions
const openAddModal = (date = null) => { 
  selectedDate.value = date || new Date()
  editingTx.value = null
  showAddModal.value = true 
}
const handleQuickAddFromCalendar = (date) => {
  showDayModal.value = false
  openAddModal(date)
}
const openEdit = (tx) => { editingTx.value = tx; showAddModal.value = true }
const openDaySummary = (date) => { selectedDate.value = date; showDayModal.value = true }
const closeAddModal = () => { showAddModal.value = false; editingTx.value = null }
const handleTxSuccess = () => { transactionStore.fetchTransactions(); walletStore.fetchWallets(); closeAddModal() }
const confirmDelete = async (tx) => {
  if (confirm(t('transactions.delete_confirm'))) {
    await transactionStore.deleteTransaction(tx.id)
    transactionStore.fetchTransactions()
    walletStore.fetchWallets()
  }
}

const selectedDateTransactions = computed(() => {
  const val = selectedDate.value
  if (!val) return []
  const d = new Date(val)
  if (isNaN(d.getTime())) return []
  
  return transactionStore.transactions.filter(tx => {
    const txDate = new Date(tx.created_at)
    return txDate.getFullYear() === d.getFullYear() &&
           txDate.getMonth() === d.getMonth() &&
           txDate.getDate() === d.getDate()
  })
})

const handleLogout = async () => { await authStore.logout(); router.push('/login') }

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.animate-slide-up {
  animation: slide-up 0.4s ease-out forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
