<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || $t('common.user')"
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

    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 px-1 md:px-0">
      <div class="animate-slide-up space-y-1">
        <div class="flex items-center gap-3 mb-1">
          <div class="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Sparkles :size="16" stroke-width="2.5" />
          </div>
          <p class="text-[9px] font-black uppercase tracking-[0.3em] text-primary-500/80">{{ todayDate }}</p>
        </div>
        <h2 class="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">
           {{ $t('welcome.greeting', { name: authStore.user?.user_metadata?.full_name?.split(' ')[0] || $t('common.user') }) }}
        </h2>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md">{{ $t('dashboard.destiny_ready') }}</p>
      </div>
      
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        <div class="relative flex-1 sm:flex-none">
          <select 
            v-model="selectedRange" 
            class="w-full sm:w-48 appearance-none bg-white dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-primary-500/10 outline-none shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <option value="7d">{{ $t('dashboard.range_7d') }}</option>
            <option value="30d">{{ $t('dashboard.range_30d') }}</option>
            <option value="year">{{ $t('dashboard.range_year') }}</option>
            <option value="custom">{{ $t('dashboard.range_custom') || 'Custom Range' }}</option>
          </select>
          <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown :size="14" stroke-width="3" />
          </div>
        </div>

        <div v-if="selectedRange === 'custom'" class="flex items-center gap-2 animate-fade-in bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
          <input 
            type="date" 
            v-model="customStartDate"
            class="bg-transparent border-none rounded-xl px-2 py-1 text-[10px] font-black uppercase outline-none"
          />
          <span class="text-slate-300 text-[10px] font-black italic">TO</span>
          <input 
            type="date" 
            v-model="customEndDate"
            class="bg-transparent border-none rounded-xl px-2 py-1 text-[10px] font-black uppercase outline-none"
          />
        </div>
        
        <AppButton 
          variant="primary" 
          size="lg" 
          class="!rounded-2xl !py-4 !px-8 shadow-2xl shadow-primary-500/40 hover:scale-105 transition-all" 
          @click="showAddModal = true"
        >
          <template #prefix><Plus :size="20" stroke-width="3" /></template>
          <span class="font-black uppercase tracking-widest text-xs">{{ $t('actions.transaction') }}</span>
        </AppButton>
      </div>
    </div>

    <!-- Tab Switching: Modern Pill Style -->
    <div class="inline-flex p-1.5 bg-slate-100 dark:bg-gray-900 rounded-[2rem] mb-8 overflow-x-auto scrollbar-hide max-w-full">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-2.5 px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-500 relative whitespace-nowrap"
        :class="activeTab === tab.id 
          ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-xl shadow-slate-200/50 dark:shadow-none scale-[1.02]' 
          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
      >
        <component :is="tab.icon" :size="14" stroke-width="2.5" />
        {{ $t(tab.key) }}
      </button>
    </div>

    <!-- VIEW: OVERVIEW -->
    <div v-if="activeTab === 'overview'" class="space-y-8 animate-slide-up">
      <SummaryCards 
        :total-balance="totalBalance" 
        :total-income="totalIncome" 
        :total-expense="totalExpense"
        :transactions="transactionStore.analyticsTransactions"
        @add-transaction="showAddModal = true"
      />
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch items-start">
        <!-- Big Analysis: Cash Flow -->
        <div class="lg:col-span-8 space-y-6">
          <AppCard class="overflow-hidden border-none shadow-2xl shadow-slate-200/50">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ $t('analytics.cash_flow') }}</h4>
                <div class="flex gap-2">
                  <span class="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg">
                    <ArrowUpRight :size="10" /> {{ $t('dashboard.income') }}
                  </span>
                  <span class="flex items-center gap-1.5 text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-lg">
                    <ArrowDownLeft :size="10" /> {{ $t('dashboard.expense') }}
                  </span>
                </div>
              </div>
            </template>
            <CashFlowChart :transactions="filteredTransactions" :is-dark-mode="isDark" />
          </AppCard>

          <!-- Secondary Insights Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppCard class="group !rounded-3xl border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
              <template #header>
                <div class="flex items-center justify-between w-full">
                  <h4 class="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">{{ $t('dashboard.spending_allocation') }}</h4>
                  <div class="p-1.5 bg-slate-50 dark:bg-gray-800 rounded-lg">
                    <PieChart :size="14" class="text-primary-500" />
                  </div>
                </div>
              </template>
              <div class="py-2">
                <CategoryDonutChart 
                  :transactions="filteredTransactions" 
                  type="EXPENSE" 
                  :title="$t('categories.form_category')"
                  :is-dark-mode="isDark" 
                />
              </div>
            </AppCard>

            <AppCard class="!rounded-3xl border-none shadow-2xl shadow-slate-200/50">
              <template #header>
                <div class="flex items-center justify-between w-full">
                  <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ $t('budgets.health') }}</h4>
                  <AppButton variant="ghost" size="sm" class="!h-8 !px-3 !rounded-lg !text-[9px] font-black uppercase tracking-widest bg-slate-50 dark:bg-gray-800" @click="router.push('/budget')">
                    {{ $t('dashboard.view_all') }}
                  </AppButton>
                </div>
              </template>
              <div class="py-2">
                <BudgetProgressWidget :limit="3" />
              </div>
            </AppCard>
          </div>
        </div>

        <div class="lg:col-span-4 h-full">
          <SidebarInsights :health-score="healthScore" />
        </div>
      </div>

      <!-- Bottom: Recent Activity & Calendar -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Recent Transactions -->
        <div class="lg:col-span-4 space-y-4">
          <div class="flex items-center justify-between px-2">
            <h3 class="text-base font-black dark:text-white">{{ $t('dashboard.recent_activity') }}</h3>
            <AppButton variant="ghost" size="sm" class="!text-[10px]" @click="router.push('/transaction')">{{ $t('dashboard.view_all') }}</AppButton>
          </div>
          <AppCard class="!p-0 overflow-hidden divide-y divide-slate-100 dark:divide-gray-800/50 !rounded-3xl shadow-xl shadow-slate-200/50">
            <template v-if="isLoading">
              <div v-for="i in 5" :key="i" class="p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <AppSkeleton variant="circle" width="32px" height="32px" />
                  <div class="space-y-1">
                    <AppSkeleton width="100px" height="12px" />
                    <AppSkeleton width="50px" height="8px" />
                  </div>
                </div>
                <AppSkeleton width="60px" height="14px" />
              </div>
            </template>
            <template v-else>
              <div v-for="tx in recentTransactions" :key="tx.id" 
                   class="p-4 hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-all flex items-center justify-between group cursor-pointer border-b border-slate-50 last:border-0 dark:border-gray-800/30"
                   @click="openEdit(tx)"
              >
                <div class="flex items-center gap-3">
                  <div :class="[
                         tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                         tx.type === 'TRANSFER' ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                         'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300'
                       ]" 
                       class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                    <ArrowUpRight v-if="tx.type === 'INCOME'" :size="18" stroke-width="3" />
                    <ArrowLeftRight v-else-if="tx.type === 'TRANSFER'" :size="18" stroke-width="3" />
                    <ArrowDownLeft v-else :size="18" stroke-width="3" />
                  </div>
                  <div>
                    <p class="text-[12px] font-black text-slate-900 dark:text-white line-clamp-1 mb-0.5 tracking-tight group-hover:text-primary-600 transition-colors">{{ tx.description }}</p>
                    <div class="flex items-center gap-2">
                       <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ formatShort(tx.created_at) }}</p>
                       <span class="w-1 h-1 rounded-full bg-slate-200 dark:bg-gray-700"></span>
                       <p class="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{{ tx.category_name || 'Uncategorized' }}</p>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p :class="tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'" class="text-[14px] font-black tabular-nums tracking-tighter">
                    {{ tx.type === 'INCOME' ? '+' : '-' }}{{ formatRaw(tx.amount) }}
                  </p>
                </div>
              </div>
              <div v-if="recentTransactions.length === 0" class="p-8 text-center text-slate-400 font-medium text-xs italic">{{ $t('dashboard.empty_activity') }}</div>
            </template>
          </AppCard>

          <!-- QUICK ACTIONS -->
          <div class="grid grid-cols-1 gap-3">
            <button 
              @click="router.push('/transfer')"
              class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5 transition-all group"
            >
              <div class="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                <ArrowLeftRight :size="16" />
              </div>
              <span class="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{{ $t('actions.transfer') }}</span>
            </button>
          </div>
        </div>

        <!-- Calendar Component -->
        <div class="lg:col-span-8 space-y-4">
           <div class="flex items-center justify-between px-2">
            <h3 class="text-base font-black dark:text-white">{{ $t('dashboard.calendar') }}</h3>
            <div class="flex items-center gap-2">
              <AppButton variant="secondary" size="sm" icon-only class="!w-8 !h-8" @click="prevMonth"><ChevronLeft :size="14" /></AppButton>
              <span class="text-[10px] font-bold uppercase tracking-widest min-w-[80px] text-center">{{ getMonthName(currentMonth) }} {{ currentMonth.getFullYear() }}</span>
              <AppButton variant="secondary" size="sm" icon-only class="!w-8 !h-8" @click="nextMonth"><ChevronRight :size="14" /></AppButton>
            </div>
          </div>
          <AppCard class="!p-0 !rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
            <div class="grid grid-cols-7 border-b border-slate-100 dark:border-gray-800/50 bg-slate-50/50 dark:bg-gray-900/50">
              <div v-for="day in ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']" :key="day" class="p-2 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">
                {{ $t('common.days.' + day) }}
              </div>
            </div>
            <div class="grid grid-cols-7">
              <div v-for="(d, i) in calendarDays" :key="i" @click="openDetails(d.date)"
                  class="h-16 sm:h-20 p-2 border-r border-b border-slate-100 dark:border-gray-800/50 relative transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800/20 last:border-r-0"
                  :class="[!d.current ? 'bg-slate-50/20 dark:bg-gray-900/10 opacity-30' : '']">
                <span class="text-[9px] font-bold inline-flex items-center justify-center" 
                      :class="[
                        d.current ? (isToday(d.date) ? 'bg-primary-600 text-white w-5 h-5 rounded-full' : 'text-slate-900 dark:text-white') : 'text-slate-300'
                      ]">
                  {{ d.day }}
                </span>
                <div v-if="dailySummaries[getDateKey(d.date)]" class="mt-1 space-y-0.5">
                  <div v-if="dailySummaries[getDateKey(d.date)].income > 0" class="h-0.5 lg:h-3 w-full bg-emerald-500/10 rounded-full flex items-center px-1">
                     <div class="w-0.5 h-0.5 rounded-full bg-emerald-500 lg:mr-1"></div>
                     <span class="text-[7px] font-black text-emerald-600 hidden lg:block uppercase tracking-tighter">+{{ (dailySummaries[getDateKey(d.date)].income/1000).toFixed(0) }}k</span>
                  </div>
                  <div v-if="dailySummaries[getDateKey(d.date)].expense > 0" class="h-0.5 lg:h-3 w-full bg-rose-500/10 rounded-full flex items-center px-1">
                     <div class="w-0.5 h-0.5 rounded-full bg-rose-500 lg:mr-1"></div>
                     <span class="text-[7px] font-black text-rose-600 hidden lg:block uppercase tracking-tighter">-{{ (dailySummaries[getDateKey(d.date)].expense/1000).toFixed(0) }}k</span>
                  </div>
                  <div v-if="dailySummaries[getDateKey(d.date)].transfer > 0" class="h-0.5 lg:h-3 w-full bg-blue-500/10 rounded-full flex items-center px-1">
                     <div class="w-0.5 h-0.5 rounded-full bg-blue-500 lg:mr-1"></div>
                     <span class="text-[7px] font-black text-blue-600 hidden lg:block uppercase tracking-tighter">{{ (dailySummaries[getDateKey(d.date)].transfer/1000).toFixed(0) }}k</span>
                  </div>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- Empty Grid Removed -->

      
    </div>

    <!-- VIEW: ANALYTICS -->
    <div v-if="activeTab === 'analytics'" class="space-y-6 animate-slide-up">
       <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <AppCard class="lg:col-span-8 !rounded-3xl shadow-xl shadow-slate-200/50">
            <template #header><h4 class="font-black text-[10px] uppercase tracking-widest text-slate-400">{{ $t('analytics.cash_flow') }}</h4></template>
            <div class="h-[350px]">
              <CashFlowChart :transactions="filteredTransactions" :is-dark-mode="isDark" />
            </div>
          </AppCard>
          <AppCard class="lg:col-span-4 !rounded-3xl shadow-xl shadow-slate-200/50">
            <template #header><h4 class="font-black text-[10px] uppercase tracking-widest text-slate-400">{{ $t('analytics.top_spending') }}</h4></template>
            <TopSpendingList :transactions="filteredTransactions" />
          </AppCard>
       </div>
       <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AppCard class="!rounded-3xl shadow-xl shadow-slate-200/50">
            <template #header><h4 class="font-black text-[10px] uppercase tracking-widest text-slate-400">{{ $t('analytics.category_distribution') }} ({{ $t('dashboard.expense') }})</h4></template>
            <CategoryDonutChart :transactions="filteredTransactions" type="EXPENSE" :is-dark-mode="isDark" />
          </AppCard>
          <AppCard class="!rounded-3xl shadow-xl shadow-slate-200/50">
            <template #header><h4 class="font-black text-[10px] uppercase tracking-widest text-slate-400">{{ $t('analytics.category_distribution') }} ({{ $t('dashboard.income') }})</h4></template>
            <CategoryDonutChart :transactions="filteredTransactions" type="INCOME" :is-dark-mode="isDark" />
          </AppCard>
          <AppCard class="!rounded-3xl shadow-xl shadow-slate-200/50">
            <template #header><h4 class="font-black text-[10px] uppercase tracking-widest text-slate-400">{{ $t('analytics.spending_trend') }}</h4></template>
            <DailySpendingChart :transactions="filteredTransactions" :is-dark-mode="isDark" />
          </AppCard>
       </div>
    </div>

    <!-- VIEW: HEALTH -->
    <div v-if="activeTab === 'health'" class="space-y-6 animate-slide-up pb-10">
       
       <!-- Row 1: High-Level Performance Metrics -->
       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppCard class="border-none shadow-xl shadow-slate-200/50 !rounded-3xl">
            <HealthScoreCard :transactions="filteredTransactions" />
          </AppCard>
          <AppCard class="border-none shadow-xl shadow-slate-200/50 !rounded-3xl">
            <SavingsRateCard :transactions="filteredTransactions" />
          </AppCard>
       </div>

        <!-- Row 2: Foundation & Actionable Insights -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Left: Your Financial Position (The Ladder) -->
          <div class="lg:col-span-4 space-y-4">
              <div class="flex items-center gap-3 px-2">
                <div class="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm">
                  <Crown :size="14" stroke-width="3" />
                </div>
                <h4 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">{{ $t('ladder.title') }}</h4>
              </div>
              <FinancialLadder />
          </div>

          <!-- Right: Safety Net & Growth Trends -->
          <div class="lg:col-span-8 space-y-6">
              
              <!-- Primary Protection: Emergency Fund -->
              <div class="space-y-3">
                <div class="flex items-center gap-3 px-2">
                  <div class="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-600 shadow-sm">
                    <HeartPulse :size="14" stroke-width="3" />
                  </div>
                  <h4 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">{{ $t('health.emergency_fund') }}</h4>
                </div>
                <AppCard class="border-none shadow-xl shadow-slate-200/50 !rounded-3xl">
                    <EmergencyFundCard :transactions="filteredTransactions" />
                </AppCard>
              </div>

              <!-- Growth & Budget Analysis -->
              <div class="grid grid-cols-1 gap-6">
                <!-- Net Worth Trend -->
                <AppCard class="border-none shadow-xl shadow-slate-200/50 !rounded-3xl">
                  <NetWorthChart :total-balance="totalBalance" :is-dark-mode="isDark" />
                </AppCard>
                
                <!-- Budget Actual comparison -->
                <AppCard class="border-none shadow-xl shadow-slate-200/50 !rounded-3xl">
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

    <TransferFormModal
      :is-open="showTransferModal"
      :initial-data="editingTransfer"
      @close="closeTransferModal"
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
import { ref, computed, onMounted, watch } from 'vue'
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
  ChevronDown,
  Scan,
  Sparkles,
  Crown,
  Info,
  TrendingUp,
  BarChart3
} from 'lucide-vue-next'

import { supabase } from '../services/supabase'

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
import TransferFormModal from '../components/TransferFormModal.vue'
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
const showTransferModal = ref(false)
const showDetailModal = ref(false)
const editingTx = ref(null)
const editingTransfer = ref(null)
const selectedDate = ref(new Date())
const currentMonth = ref(new Date())

const customStartDate = ref(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])
const customEndDate = ref(new Date().toISOString().split('T')[0])
const monthTransfers = ref([])

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
    categoryStore.fetchInitialData(),
    budgetStore.fetchBudgets(),
    debtStore.fetchDebts(),
    refreshAnalytics()
  ])
})

// Fetch all transactions for the current month (Calendar focus)
const fetchCalendarData = async () => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  // Format dates manually to ensure they cover the full local day range
  const startDate = new Date(year, month, 1, 0, 0, 0, 0).toISOString()
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString()
  
  await Promise.all([
    transactionStore.fetchTransactions({
      startDate,
      endDate,
      limit: 1000
    }),
    fetchMonthTransfers(startDate, endDate)
  ])
}

const fetchMonthTransfers = async (start, end) => {
  if (!authStore.activeWorkspaceId) return

  try {
    const { data, error } = await supabase
      .from('transfers')
      .select(`
        id, 
        amount, 
        created_at, 
        description,
        from_wallet:from_wallet_id(name),
        to_wallet:to_wallet_id(name)
      `)
      .eq('workspace_id', authStore.activeWorkspaceId)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    monthTransfers.value = data || []
  } catch (err) {
    console.error('Error fetching transfers:', err)
    monthTransfers.value = []
  }
}

watch([currentMonth, () => authStore.activeWorkspaceId], () => {
  if (authStore.activeWorkspaceId) {
    fetchCalendarData()
  }
}, { immediate: true })

const refreshAnalytics = async () => {
  let start, end
  const now = new Date()
  
  if (selectedRange.value === '7d') {
    start = new Date(now)
    start.setDate(start.getDate() - 6)
    start.setHours(0,0,0,0)
    end = now
  } else if (selectedRange.value === '30d') {
    start = new Date(now)
    start.setDate(start.getDate() - 29)
    start.setHours(0,0,0,0)
    end = now
  } else if (selectedRange.value === 'year') {
    start = new Date(now.getFullYear(), 0, 1)
    start.setHours(0,0,0,0)
    end = now
  } else if (selectedRange.value === 'custom') {
    start = new Date(customStartDate.value)
    start.setHours(0,0,0,0)
    end = new Date(customEndDate.value)
    end.setHours(23, 59, 59, 999)
  } else {
    start = new Date(2000, 0, 1)
    end = now
  }

  await transactionStore.fetchAnalyticsData({
    startDate: start.toISOString(),
    endDate: end.toISOString()
  })
}

watch([selectedRange, customStartDate, customEndDate], () => {
  refreshAnalytics()
})

const totalBalance = computed(() => walletStore.wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0))

const filteredTransactions = computed(() => transactionStore.analyticsTransactions)

const totalIncome = computed(() => transactionStore.analyticsTransactions.filter(tx => tx.type === 'INCOME').reduce((s, tx) => s + Number(tx.amount), 0))
const totalExpense = computed(() => transactionStore.analyticsTransactions.filter(tx => tx.type === 'EXPENSE').reduce((s, tx) => s + Number(tx.amount), 0))

const recentTransactions = computed(() => {
  const txs = [...transactionStore.transactions]
  const tfrs = monthTransfers.value.map(t => ({
    ...t,
    type: 'TRANSFER',
    description: t.description || `Transfer: ${t.from_wallet?.name} → ${t.to_wallet?.name}`,
    category_name: 'Transfer'
  }))
  
  return [...txs, ...tfrs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
})

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
  
  // Transactions
  transactionStore.transactions.forEach(tx => {
    const d = new Date(tx.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!summaries[key]) summaries[key] = { income: 0, expense: 0, transfer: 0 }
    if (tx.type === 'INCOME') summaries[key].income += Number(tx.amount)
    if (tx.type === 'EXPENSE') summaries[key].expense += Number(tx.amount)
  })

  // Transfers
  monthTransfers.value.forEach(t => {
    const d = new Date(t.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!summaries[key]) summaries[key] = { income: 0, expense: 0, transfer: 0 }
    summaries[key].transfer += Number(t.amount)
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
  
  const txs = transactionStore.transactions.filter(tx => {
    const txDate = new Date(tx.created_at)
    return txDate.getFullYear() === selectedDate.value.getFullYear() &&
           txDate.getMonth() === selectedDate.value.getMonth() &&
           txDate.getDate() === selectedDate.value.getDate()
  })

  const tfrs = monthTransfers.value.filter(t => {
    const txDate = new Date(t.created_at)
    return txDate.getFullYear() === selectedDate.value.getFullYear() &&
           txDate.getMonth() === selectedDate.value.getMonth() &&
           txDate.getDate() === selectedDate.value.getDate()
  }).map(t => ({
    ...t,
    type: 'TRANSFER',
    description: t.description || `Transfer: ${t.from_wallet?.name} → ${t.to_wallet?.name}`,
    wallets: { name: `${t.from_wallet?.name} → ${t.to_wallet?.name}` }
  }))

  return [...txs, ...tfrs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const openEdit = (item) => {
  if (item.type === 'TRANSFER') {
    editingTransfer.value = item
    showTransferModal.value = true
  } else {
    editingTx.value = item
    showAddModal.value = true
  }
}

const closeTransferModal = () => {
  showTransferModal.value = false
  editingTransfer.value = null
}
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
