<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    :page-title="$t('dashboard.title')"
    @logout="handleLogout"
  >
    <!-- Onboarding Modal -->
    <OnboardingModal :is-open="showOnboarding" @success="showOnboarding = false" />

    <!-- Top Section Alerts -->
    <div class="space-y-4 mb-4">
       <DebtAlertBanner />
       <InvestmentGuardAlert />
    </div>

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
      <div>
        <h2 class="text-3xl font-black tracking-tighter text-slate-900 dark:text-white italic">
           {{ $t('welcome.greeting', { name: authStore.user?.user_metadata?.full_name?.split(' ')[0] || 'User' }) }}
        </h2>
        <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{{ todayDate }}</p>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <select 
          v-model="selectedRange" 
          class="flex-1 md:w-48 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-800 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="7d">{{ $t('dashboard.range_7d') }}</option>
          <option value="30d">{{ $t('dashboard.range_30d') }}</option>
          <option value="year">{{ $t('dashboard.range_year') }}</option>
        </select>
        
        <AppButton variant="primary" size="md" class="!rounded-2xl shadow-xl shadow-primary-500/20" @click="showAddModal = true">
          <template #prefix><Plus :size="18" /></template>
          {{ $t('actions.transaction') }}
        </AppButton>
      </div>
    </div>

    <!-- Tab Switching -->
    <div class="flex border-b border-slate-100 dark:border-gray-800 mb-10 overflow-x-auto scrollbar-hide">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap"
        :class="activeTab === tab.id ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'"
      >
        <div class="flex items-center gap-3">
          <component :is="tab.icon" :size="16" />
          {{ $t(tab.key) }}
        </div>
        <div 
          v-if="activeTab === tab.id" 
          class="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full scale-x-75"
        ></div>
      </button>
    </div>

    <!-- VIEW: OVERVIEW -->
    <div v-if="activeTab === 'overview'" class="space-y-12 animate-slide-up">
      <!-- FIRST HIGHLIGHT: Summary Cards -->
      <SummaryCards 
        :total-balance="totalBalance" 
        :total-income="totalIncome" 
        :total-expense="totalExpense"
        :transactions="transactionStore.transactions"
      />

      <!-- MAIN GRID: Cash Flow vs Financial Ladder -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Main Column (Left/Center) -->
        <div class="lg:col-span-8 space-y-10">
           <!-- Big Analysis: Cash Flow -->
           <AppCard class="overflow-hidden border-none shadow-2xl shadow-slate-200/50">
             <template #header>
               <div class="flex items-center justify-between w-full">
                 <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ $t('analytics.cash_flow') }}</h4>
                 <div class="flex gap-2">
                    <span class="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                      <ArrowUpRight :size="12" /> {{ $t('dashboard.income') }}
                    </span>
                    <span class="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg">
                      <ArrowDownLeft :size="12" /> {{ $t('dashboard.expense') }}
                    </span>
                 </div>
               </div>
             </template>
             <CashFlowChart :transactions="filteredTransactions" :is-dark-mode="isDark" />
           </AppCard>
           
           <!-- Secondary Insights Row -->
           <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AppCard class="group">
                <template #header>
                   <div class="flex items-center justify-between w-full">
                      <h4 class="font-black text-[10px] uppercase tracking-widest text-slate-400">{{ $t('dashboard.spending_allocation') }}</h4>
                      <PieChart :size="14" class="text-slate-300" />
                   </div>
                </template>
                <CategoryDonutChart 
                   :transactions="filteredTransactions" 
                   type="EXPENSE" 
                   :title="$t('categories.form_category')"
                   :is-dark-mode="isDark" 
                />
              </AppCard>

              <AppCard>
                <template #header>
                  <div class="flex items-center justify-between w-full">
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ $t('budgets.health') }}</h4>
                    <AppButton variant="ghost" size="sm" class="!h-6 !text-[9px]" @click="router.push('/budget')">{{ $t('dashboard.view_all') }}</AppButton>
                  </div>
                </template>
                <BudgetProgressWidget :limit="3" />
              </AppCard>
           </div>
        </div>

        <div class="lg:col-span-4">
           <SidebarInsights :health-score="healthScore" class="sticky top-24" />
        </div>
      </div>

      <!-- Bottom: Recent Activity & Calendar -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Recent Transactions -->
        <div class="lg:col-span-4 space-y-4">
          <div class="flex items-center justify-between px-2">
            <h3 class="text-lg font-black dark:text-white">{{ $t('dashboard.recent_activity') }}</h3>
            <AppButton variant="ghost" size="sm" @click="router.push('/transaction')">{{ $t('dashboard.view_all') }}</AppButton>
          </div>
          <AppCard class="!p-0 overflow-hidden divide-y divide-slate-100 dark:divide-gray-800/50">
            <template v-if="isLoading">
              <div v-for="i in 5" :key="i" class="p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <AppSkeleton variant="circle" width="40px" height="40px" />
                  <div class="space-y-2">
                    <AppSkeleton width="120px" height="14px" />
                    <AppSkeleton width="60px" height="10px" />
                  </div>
                </div>
                <AppSkeleton width="80px" height="18px" />
              </div>
            </template>
            <template v-else>
              <div v-for="tx in recentTransactions" :key="tx.id" class="p-4 hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-all flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <div :class="tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/10'" 
                      class="w-10 h-10 rounded-xl flex items-center justify-center">
                    <ArrowUpRight :size="18" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{{ tx.description }}</p>
                    <p class="text-[10px] font-medium text-slate-400">{{ formatShort(tx.created_at) }}</p>
                  </div>
                </div>
                <p :class="tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'" class="text-sm font-black tabular-nums">
                  {{ tx.type === 'INCOME' ? '+' : '-' }}{{ formatRaw(tx.amount) }}
                </p>
              </div>
              <div v-if="recentTransactions.length === 0" class="p-12 text-center text-slate-400 font-medium italic">{{ $t('dashboard.empty_activity') }}</div>
            </template>
          </AppCard>
        </div>

        <!-- Calendar Component -->
        <div class="lg:col-span-8 space-y-4">
           <div class="flex items-center justify-between px-2">
            <h3 class="text-lg font-black dark:text-white">{{ $t('dashboard.calendar') }}</h3>
            <div class="flex items-center gap-2">
              <AppButton variant="secondary" size="sm" icon-only @click="prevMonth"><ChevronLeft :size="16" /></AppButton>
              <span class="text-xs font-bold uppercase tracking-widest min-w-[100px] text-center">{{ getMonthName(currentMonth) }} {{ currentMonth.getFullYear() }}</span>
              <AppButton variant="secondary" size="sm" icon-only @click="nextMonth"><ChevronRight :size="16" /></AppButton>
            </div>
          </div>
          <AppCard class="!p-0">
            <div class="grid grid-cols-7 border-b border-slate-100 dark:border-gray-800/50">
              <div v-for="day in ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']" :key="day" class="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                {{ $t('common.days.' + day) }}
              </div>
            </div>
            <div class="grid grid-cols-7">
              <div v-for="(d, i) in calendarDays" :key="i" @click="openDetails(d.date)"
                  class="h-20 sm:h-24 p-2 border-r border-b border-slate-100 dark:border-gray-800/50 relative transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800/20"
                  :class="[!d.current ? 'bg-slate-50/50 dark:bg-gray-900/20 opacity-40' : '']">
                <span class="text-[10px] font-bold inline-flex items-center justify-center" 
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
      </div>
    </div>

    <!-- VIEW: ANALYTICS -->
    <div v-if="activeTab === 'analytics'" class="space-y-8 animate-slide-up">
       <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <AppCard class="lg:col-span-8">
            <template #header><h4 class="font-black text-xs uppercase tracking-widest">{{ $t('analytics.cash_flow') }}</h4></template>
            <CashFlowChart :transactions="filteredTransactions" :is-dark-mode="isDark" />
          </AppCard>
          <AppCard class="lg:col-span-4">
            <template #header><h4 class="font-black text-xs uppercase tracking-widest">{{ $t('analytics.top_spending') }}</h4></template>
            <TopSpendingList :transactions="filteredTransactions" />
          </AppCard>
       </div>
       <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <AppCard>
            <template #header><h4 class="font-black text-xs uppercase tracking-widest">{{ $t('analytics.category_distribution') }} ({{ $t('dashboard.expense') }})</h4></template>
            <CategoryDonutChart :transactions="filteredTransactions" type="EXPENSE" :is-dark-mode="isDark" />
          </AppCard>
          <AppCard>
            <template #header><h4 class="font-black text-xs uppercase tracking-widest">{{ $t('analytics.category_distribution') }} ({{ $t('dashboard.income') }})</h4></template>
            <CategoryDonutChart :transactions="filteredTransactions" type="INCOME" :is-dark-mode="isDark" />
          </AppCard>
          <AppCard>
            <template #header><h4 class="font-black text-xs uppercase tracking-widest">{{ $t('analytics.spending_trend') }}</h4></template>
            <DailySpendingChart :transactions="filteredTransactions" :is-dark-mode="isDark" />
          </AppCard>
       </div>
    </div>

    <!-- VIEW: HEALTH -->
    <div v-if="activeTab === 'health'" class="space-y-10 animate-slide-up pb-10">
       <!-- Top Highlight: Health Metrics -->
       <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SavingsRateCard :transactions="filteredTransactions" />
          <HealthScoreCard :transactions="filteredTransactions" />
       </div>

       <!-- Main Health Content -->
       <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <!-- Left: The Foundation (Planning) -->
          <div class="lg:col-span-5 space-y-6">
             <div class="flex items-center gap-3 px-2">
                <div class="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Crown :size="18" />
                </div>
                <h4 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{{ $t('ladder.title') }}</h4>
             </div>
             <FinancialLadder />
          </div>

          <!-- Right: Action & Projection -->
          <div class="lg:col-span-7 space-y-10">
             <!-- Emergency Fund Focus -->
             <div class="space-y-6">
                <div class="flex items-center gap-3 px-2">
                   <div class="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-600">
                     <HeartPulse :size="18" />
                   </div>
                   <h4 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{{ $t('health.emergency_fund') }}</h4>
                </div>
                <EmergencyFundCard :transactions="filteredTransactions" />
             </div>

             <!-- Projections Grid -->
             <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <AppCard class="border-none shadow-xl shadow-slate-200/50">
                  <template #header>
                    <div class="flex items-center justify-between w-full">
                      <h4 class="font-black text-[10px] uppercase tracking-widest text-slate-400">{{ $t('health.net_worth') }}</h4>
                      <BarChart3 :size="14" class="text-slate-300" />
                    </div>
                  </template>
                  <NetWorthChart :total-balance="totalBalance" :is-dark-mode="isDark" />
                </AppCard>

                <AppCard class="border-none shadow-xl shadow-slate-200/50">
                  <template #header>
                    <div class="flex items-center justify-between w-full">
                      <h4 class="font-black text-[10px] uppercase tracking-widest text-slate-400">{{ $t('health.budget_actual') }}</h4>
                      <Sparkles :size="14" class="text-slate-300" />
                    </div>
                  </template>
                  <BudgetActualChart :transactions="filteredTransactions" :is-dark-mode="isDark" />
                </AppCard>
             </div>
          </div>
       </div>
    </div>

    <!-- MODALS -->
    <TransactionFormModal 
      :is-open="showAddModal"
      :date="selectedDate"
      embedded 
      :initial-data="editingTx"
      @close="closeAddModal" 
      @success="handleTxSuccess" 
    />

    <CalendarDayModal 
      :is-open="showDetailModal" 
      :date="selectedDate" 
      :transactions="selectedDateTransactions" 
      @close="showDetailModal = false" 
      @quick-add="handleQuickAddFromCalendar"
      @edit="openEdit" 
      @success="handleTxSuccess"  
    />
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Plus, 
  LayoutDashboard, 
  PieChart, 
  HeartPulse, 
  ArrowUpCircle, 
  ArrowDownCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Scan,
  Sparkles,
  Crown,
  Info,
  BarChart3
} from 'lucide-vue-next'

import { useAuthStore } from '../stores/useAuthStore'
import { useWalletStore } from '../stores/useWalletStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useBudgetStore } from '../stores/useBudgetStore'
import { useCategoryStore } from '../stores/useCategoryStore'
import { useDebtStore } from '../stores/useDebtStore'
import { useFinancialHealth } from '../composables/useFinancialHealth'
import { useTheme } from '../composables/useTheme'
import { useCurrency } from '../composables/useCurrency'
import { useFormatDate } from '../composables/useFormatDate'

import AppShell from '../components/layout/AppShell.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppSkeleton from '../components/ui/AppSkeleton.vue'
import BudgetProgressWidget from '../components/analytics/BudgetProgressWidget.vue'
import DebtAlertBanner from '../components/features/DebtAlertBanner.vue'
import OnboardingModal from '../components/features/OnboardingModal.vue'
import InvestmentGuardAlert from '../components/features/InvestmentGuardAlert.vue'
import SidebarInsights from '../components/features/SidebarInsights.vue'
import FinancialLadder from '../components/analytics/FinancialLadder.vue'
import SummaryCards from '../components/analytics/SummaryCards.vue'

// Logic components
import CashFlowChart from '../components/analytics/CashFlowChart.vue'
import CategoryDonutChart from '../components/analytics/CategoryDonutChart.vue'
import TopSpendingList from '../components/analytics/TopSpendingList.vue'
import DailySpendingChart from '../components/analytics/DailySpendingChart.vue'
import SavingsRateCard from '../components/analytics/SavingsRateCard.vue'
import HealthScoreCard from '../components/analytics/HealthScoreCard.vue'
import NetWorthChart from '../components/analytics/NetWorthChart.vue'
import BudgetActualChart from '../components/analytics/BudgetActualChart.vue'
import EmergencyFundCard from '../components/analytics/EmergencyFundCard.vue'
import TransactionFormModal from '../components/TransactionFormModal.vue'
import CalendarDayModal from '../components/CalendarDayModal.vue'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const debtStore = useDebtStore()
const router = useRouter()
const { isDark } = useTheme()
const { formatRaw } = useCurrency()
const { formatShort, getMonthName } = useFormatDate()
const { healthScore } = useFinancialHealth()

import { useI18n } from 'vue-i18n'
const i18n = useI18n()
const { t } = i18n

const selectedRange = ref('30d')
const activeTab = ref('overview')
const showAddModal = ref(false)
const showDetailModal = ref(false)
const editingTx = ref(null)
const selectedDate = ref(null)
const currentMonth = ref(new Date())

const showOnboarding = ref(!authStore.user?.user_metadata?.financial_profile)

const isLoading = computed(() => walletStore.loading || transactionStore.loading || budgetStore.loading)

const tabs = [
  { id: 'overview', key: 'nav.dashboard', icon: LayoutDashboard },
  { id: 'analytics', key: 'analytics.cash_flow', icon: PieChart },
  { id: 'health', key: 'health.title', icon: HeartPulse }
]

const todayDate = computed(() => {
  const localeMap = { 'id': 'id-ID', 'en': 'en-US' }
  const currentLocale = localeMap[i18n.locale.value] || 'id-ID'
  return new Intl.DateTimeFormat(currentLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
})

onMounted(async () => {
  await Promise.all([
    walletStore.fetchWallets(),
    transactionStore.fetchTransactions(),
    categoryStore.fetchInitialData(),
    budgetStore.fetchBudgets()
  ])
})

const totalBalance = computed(() => walletStore.wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0))

const filteredTransactions = computed(() => {
  const now = new Date()
  const cutoff = new Date(now)
  if (selectedRange.value === '7d') cutoff.setDate(cutoff.getDate() - 6)
  else if (selectedRange.value === '30d') cutoff.setDate(cutoff.getDate() - 29)
  else if (selectedRange.value === 'year') { cutoff.setMonth(0, 1); cutoff.setHours(0,0,0,0) }
  else cutoff.setFullYear(2000) 
  
  return transactionStore.transactions.filter(tx => {
    const txDate = new Date(tx.created_at)
    return txDate >= cutoff && txDate <= now
  })
})

const totalIncome = computed(() => filteredTransactions.value.filter(tx => tx.type === 'INCOME').reduce((s, tx) => s + Number(tx.amount), 0))
const totalExpense = computed(() => filteredTransactions.value.filter(tx => tx.type === 'EXPENSE').reduce((s, tx) => s + Number(tx.amount), 0))
const recentTransactions = computed(() => [...transactionStore.transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5))

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
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
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

const openDetails = (date) => { selectedDate.value = date; showDetailModal.value = true }

const selectedDateTransactions = computed(() => {
  if (!selectedDate.value) return []
  return transactionStore.transactions.filter(tx => {
    const txDate = new Date(tx.created_at)
    return txDate.getFullYear() === selectedDate.value.getFullYear() &&
           txDate.getMonth() === selectedDate.value.getMonth() &&
           txDate.getDate() === selectedDate.value.getDate()
  })
})

const openEdit = (tx) => { /* Logic to open edit */ }
const openAddModal = (date = null) => { 
  selectedDate.value = date || new Date()
  showAddModal.value = true 
}
const handleQuickAddFromCalendar = (date) => {
  showDetailModal.value = false
  openAddModal(date)
}
const closeAddModal = () => { showAddModal.value = false; editingTx.value = null }
const handleTxSuccess = () => { transactionStore.fetchTransactions(); walletStore.fetchWallets(); closeAddModal() }
const handleLogout = async () => { await authStore.logout(); router.push('/login') }
</script>
