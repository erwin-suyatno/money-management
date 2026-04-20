<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-10 lg:p-16 pb-32">
    <!-- 1. Skeleton Loading State -->
    <div v-if="transactionStore.loading && recentTransactions.length === 0" class="animate-in fade-in duration-500">
      <div class="mb-14 space-y-4">
        <Skeleton width="300px" height="60px" />
        <Skeleton width="400px" height="24px" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div class="lg:col-span-8">
          <Skeleton height="320px" variant="pill" />
        </div>
        <div class="lg:col-span-4 space-y-8">
          <Skeleton height="150px" />
          <Skeleton height="150px" />
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
         <div class="lg:col-span-4 space-y-6">
            <Skeleton width="200px" height="30px" />
            <Skeleton height="100px" v-for="i in 3" :key="i" />
         </div>
         <div class="lg:col-span-8 space-y-6">
            <Skeleton width="200px" height="30px" />
            <Skeleton height="400px" />
         </div>
      </div>
    </div>

    <!-- 2. Actual Content -->
    <template v-else>
      <!-- Header Section -->
      <div class="mb-14 flex flex-col md:flex-row md:items-end justify-between space-y-8 md:space-y-0">
        <div>
          <h1 class="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{{ $t('dashboard.title') }}</h1>
          <p class="mt-3 text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{{ $t('dashboard.subtitle') }}</p>
        </div>
        <div class="relative group">
          <select v-model="selectedRange" class="w-full md:w-56 appearance-none bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5 shadow-sm hover:shadow-md transition-all cursor-pointer focus:ring-4 focus:ring-indigo-500/10 active:scale-95">
            <option value="7d">{{ $t('dashboard.range_7d') }}</option>
            <option value="30d">{{ $t('dashboard.range_30d') }}</option>
            <option value="year">{{ $t('dashboard.range_year') }}</option>
            <option value="all">{{ $t('dashboard.range_all') }}</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-10 flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                :class="activeTab === tab.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-gray-800 dark:text-slate-400 dark:hover:bg-gray-700'"
                class="px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center space-x-3 shadow-sm">
           <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="tab.icon"/></svg>
           <span>{{ tab.name }}</span>
        </button>
      </div>

      <!-- Tab Content: Overview -->
      <div v-show="activeTab === 'overview'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
        <!-- Summary Cards Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Main Total Balance Card -->
          <div class="lg:col-span-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
            <div class="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-1000"></div>
            <div class="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 class="text-indigo-100/80 font-black text-[10px] uppercase tracking-[0.3em] mb-6">{{ $t('dashboard.working_balance') }}</h3>
                <div class="flex items-baseline space-x-2">
                   <span class="text-2xl font-medium text-indigo-100/60">Rp</span>
                   <p class="text-5xl sm:text-6xl font-black tracking-tighter tabular-nums">{{ totalBalance.toLocaleString($i18n.locale === 'id' ? 'id-ID' : 'en-US') }}</p>
                </div>
              </div>
              <div class="mt-12 flex items-center space-x-4">
                 <div :class="netFlow >= 0 ? 'bg-white/20' : 'bg-rose-500/30'" class="px-5 py-2.5 rounded-2xl backdrop-blur-md flex items-center space-x-2 border border-white/10 font-black text-[10px] uppercase tracking-widest">
                    {{ netFlow >= 0 ? '+' : '' }}{{ ((netFlow/Math.max(totalIncome, 1))*100).toFixed(1) }}% Flow
                 </div>
                 <p class="text-xs font-bold text-indigo-100/60 transition-all italic">{{ $t('dashboard.relative_info') }}</p>
              </div>
            </div>
          </div>

          <!-- Income/Expense Side Stats -->
          <div class="lg:col-span-4 grid grid-cols-1 gap-8">
            <div class="premium-card p-8 flex flex-col justify-between group hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
              <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
              </div>
              <div>
                <h3 class="text-slate-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{{ $t('dashboard.income') }}</h3>
                <p class="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">Rp {{ totalIncome.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US') }}</p>
              </div>
            </div>
            <div class="premium-card p-8 flex flex-col justify-between group hover:border-rose-200 dark:hover:border-rose-900 transition-colors">
              <div class="w-12 h-12 bg-rose-50 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
              </div>
              <div>
                <h3 class="text-slate-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{{ $t('dashboard.expense') }}</h3>
                <p class="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">Rp {{ totalExpense.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US') }}</p>
              </div>
            </div>
          </div>
        </div>

      <!-- Activity & Calendar Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Recent Activity List -->
        <div class="lg:col-span-4 flex flex-col space-y-8">
          <div class="flex items-center justify-between px-2 text-2xl font-black dark:text-white tracking-tight">
             <h3>{{ $t('dashboard.recent_activity') }}</h3>
             <router-link to="/transaction" class="text-[10px] font-black uppercase tracking-widest text-indigo-500">{{ $t('dashboard.view_all') }}</router-link>
          </div>
          <div class="premium-card !p-0 overflow-hidden divide-y divide-slate-50 dark:divide-gray-800/50">
             <div v-for="tx in recentTransactions" :key="tx.id" class="p-8 hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-all flex items-center justify-between group">
                <div class="flex items-center space-x-5">
                   <div :class="tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/10'" 
                        class="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="tx.type === 'INCOME' ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'"/></svg>
                   </div>
                   <div>
                      <p class="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{{ tx.description }}</p>
                      <p class="text-[10px] font-bold text-slate-400 italic">{{ new Date(tx.created_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' }) }}</p>
                   </div>
                </div>
                <p :class="tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'" class="text-lg font-black tracking-tighter">
                   {{ tx.type === 'INCOME' ? '+' : '-' }}{{ Number(tx.amount).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US') }}
                </p>
             </div>
             <div v-if="recentTransactions.length === 0" class="p-16 text-center text-slate-400 font-bold italic">{{ $t('dashboard.empty_activity') }}</div>
          </div>
        </div>

        <!-- Financial Calendar -->
        <div class="lg:col-span-8 flex flex-col space-y-8">
           <div class="flex items-center justify-between px-2 text-2xl font-black dark:text-white tracking-tight">
              <h3>{{ $t('dashboard.calendar') }}</h3>
              <div class="flex items-center space-x-4 bg-slate-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                 <button @click="prevMonth" class="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg></button>
                 <span class="text-[10px] font-black uppercase tracking-widest px-4 min-w-[120px] text-center">{{ currentMonth.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' }) }}</span>
                 <button @click="nextMonth" class="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg></button>
              </div>
           </div>
           <div class="premium-card !p-0 overflow-hidden">
              <div class="grid grid-cols-7 border-b border-slate-50 dark:border-gray-800/50">
                 <div v-for="day in ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']" :key="day" class="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                    {{ $t(`common.days.${day}`) }}
                 </div>
              </div>
              <div class="grid grid-cols-7">
                 <div v-for="(d, i) in calendarDays" :key="i" @click="openDetails(d.date)"
                      class="h-32 sm:h-40 p-4 border-r border-b border-slate-50 dark:border-gray-800/50 relative group transition-all cursor-pointer hover:bg-slate-50/50 dark:hover:bg-gray-800/20"
                      :class="[!d.current ? 'bg-slate-50/30 dark:bg-gray-900/10' : 'bg-white dark:bg-transparent']">
                    <span :class="[d.current ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-gray-700']" class="text-xs font-black">{{ d.day }}</span>
                    <div v-if="dailySummaries[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`]" class="mt-4 space-y-2">
                       <div v-if="dailySummaries[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`].income > 0" class="flex flex-col">
                          <span class="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">+{{ (dailySummaries[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`].income / 1000).toFixed(0) }}k</span>
                       </div>
                       <div v-if="dailySummaries[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`].expense > 0" class="flex flex-col">
                          <span class="text-[9px] font-black text-rose-500 uppercase tracking-tighter">-{{ (dailySummaries[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`].expense / 1000).toFixed(0) }}k</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      </div>

      <!-- Tab Content: Analytics -->
      <div v-if="activeTab === 'analytics'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
         <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-8">
              <CashFlowChart :transactions="filteredTransactions" :is-dark-mode="isDarkMode" />
            </div>
            <div class="lg:col-span-4">
              <TopSpendingList :transactions="filteredTransactions" />
            </div>
         </div>
         <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-4">
              <CategoryDonutChart :transactions="filteredTransactions" type="EXPENSE" :title="$t('dashboard.expense') || 'Expense'" :subtitle="$t('analytics.breakdown') || 'Breakdown'" :is-dark-mode="isDarkMode" />
            </div>
            <div class="lg:col-span-4">
              <CategoryDonutChart :transactions="filteredTransactions" type="INCOME" :title="$t('dashboard.income') || 'Income'" :subtitle="$t('analytics.breakdown') || 'Breakdown'" :is-dark-mode="isDarkMode" />
            </div>
            <div class="lg:col-span-4">
              <DailySpendingChart :transactions="filteredTransactions" :is-dark-mode="isDarkMode" />
            </div>
         </div>
      </div>

      <!-- Tab Content: Health & Planning -->
      <div v-if="activeTab === 'health'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
         <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SavingsRateCard :transactions="filteredTransactions" />
            <HealthScoreCard :transactions="filteredTransactions" />
            <EmergencyFundCard :transactions="filteredTransactions" />
         </div>
         <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <NetWorthChart :total-balance="totalBalance" :is-dark-mode="isDarkMode" />
            <BudgetActualChart :transactions="filteredTransactions" :is-dark-mode="isDarkMode" />
         </div>
      </div>
    </template>

    <!-- Modals -->
    <CalendarDayModal :is-open="showDetailModal" :date="selectedDate" :transactions="selectedDateTransactions" @close="showDetailModal = false" @quick-add="openQuickAdd" @edit="openEdit" />
    <TransactionFormModal :is-open="showAddModal" :date="selectedDate" :initial-data="editingTx" @close="closeAddModal" @success="handleTxSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '../stores/useWalletStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useI18n } from 'vue-i18n'
import CalendarDayModal from '../components/CalendarDayModal.vue'
import TransactionFormModal from '../components/TransactionFormModal.vue'
import Skeleton from '../components/Skeleton.vue'
import CashFlowChart from '../components/analytics/CashFlowChart.vue'
import CategoryDonutChart from '../components/analytics/CategoryDonutChart.vue'
import TopSpendingList from '../components/analytics/TopSpendingList.vue'
import DailySpendingChart from '../components/analytics/DailySpendingChart.vue'
import SavingsRateCard from '../components/analytics/SavingsRateCard.vue'
import HealthScoreCard from '../components/analytics/HealthScoreCard.vue'
import NetWorthChart from '../components/analytics/NetWorthChart.vue'
import BudgetActualChart from '../components/analytics/BudgetActualChart.vue'
import EmergencyFundCard from '../components/analytics/EmergencyFundCard.vue'

const { locale } = useI18n()
const walletStore = useWalletStore()
const transactionStore = useTransactionStore()
const router = useRouter()

const isDarkMode = computed(() => document.documentElement.classList.contains('dark'))
const selectedRange = ref('30d')
const now = new Date()
const currentMonth = ref(new Date(now.getFullYear(), now.getMonth(), 1))

const activeTab = ref('overview')
const tabs = [
  { id: 'overview', name: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'analytics', name: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'health', name: 'Health & Planning', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
]

onMounted(async () => {
  await walletStore.fetchWallets()
  await transactionStore.fetchTransactions()
})

const totalBalance = computed(() => walletStore.wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0))

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

const prevMonth = () => { currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1) }
const nextMonth = () => { currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1) }

// Modal Logic
const showDetailModal = ref(false)
const showAddModal = ref(false)
const selectedDate = ref(null)
const editingTx = ref(null)

const selectedDateTransactions = computed(() => {
  if (!selectedDate.value) return []
  const key = `${selectedDate.value.getFullYear()}-${selectedDate.value.getMonth()}-${selectedDate.value.getDate()}`
  return transactionStore.transactions.filter(tx => {
    const txDate = new Date(tx.created_at)
    return `${txDate.getFullYear()}-${txDate.getMonth()}-${txDate.getDate()}` === key
  })
})

const openDetails = (date) => { selectedDate.value = date; showDetailModal.value = true }
const openQuickAdd = (date) => { selectedDate.value = date; showDetailModal.value = false; setTimeout(() => showAddModal.value = true, 100) }
const openEdit = (tx) => { editingTx.value = tx; selectedDate.value = new Date(tx.created_at); showDetailModal.value = false; setTimeout(() => showAddModal.value = true, 100) }
const closeAddModal = () => { showAddModal.value = false; editingTx.value = null }
const handleTxSuccess = () => transactionStore.fetchTransactions()

const recentTransactions = computed(() => [...transactionStore.transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6))

const filteredTransactions = computed(() => {
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
const netFlow = computed(() => totalIncome.value - totalExpense.value)
</script>
