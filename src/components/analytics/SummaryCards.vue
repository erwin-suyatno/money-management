<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Total Balance -->
    <AppCard class="relative overflow-hidden group">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors"></div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400">
            <Wallet :size="20" />
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('dashboard.total_balance') }}</span>
        </div>
        <div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
            {{ formatIDR(totalBalance) }}
          </h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">{{ $t('dashboard.liquid_balance') }}</p>
        </div>
      </div>
    </AppCard>

    <!-- Monthly Income -->
    <AppCard class="relative overflow-hidden group">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight :size="20" />
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('dashboard.income_30d') }}</span>
        </div>
        <div class="flex items-end justify-between gap-4">
          <div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
              {{ formatIDR(totalIncome) }}
            </h3>
            <p class="text-[10px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1">
              <TrendingUp :size="10" /> {{ $t('dashboard.positive_trend') }}
            </p>
          </div>
          <!-- Sparkline Mini Chart -->
          <div class="w-16 h-8 mb-1">
            <svg class="w-full h-full" viewBox="0 0 100 40">
              <path 
                :d="incomeSparkline" 
                fill="none" 
                stroke="#10b981" 
                stroke-width="3" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </AppCard>

    <!-- Monthly Expense -->
    <AppCard class="relative overflow-hidden group">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-600 dark:text-rose-400">
            <ArrowDownRight :size="20" />
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('dashboard.expense_30d') }}</span>
        </div>
        <div class="flex items-end justify-between gap-4">
          <div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
              {{ formatIDR(totalExpense) }}
            </h3>
            <p class="text-[10px] font-bold text-rose-500 uppercase mt-1">
              {{ $t('dashboard.of_income', { percentage: totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(0) : 0 }) }}
            </p>
          </div>
          <!-- Sparkline Mini Chart -->
          <div class="w-16 h-8 mb-1">
            <svg class="w-full h-full" viewBox="0 0 100 40">
              <path 
                :d="expenseSparkline" 
                fill="none" 
                stroke="#f43f5e" 
                stroke-width="3" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </AppCard>

    <!-- Net Worth / Savings -->
    <AppCard class="relative overflow-hidden group">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
      <div class="space-y-4 relative z-10">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Activity :size="20" />
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('dashboard.net_flow') }}</span>
        </div>
        <div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
             {{ formatIDR(totalIncome - totalExpense) }}
          </h3>
          <p class="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase mt-1 italic">{{ $t('dashboard.monthly_surplus') }}</p>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, TrendingUp } from 'lucide-vue-next'
import { useCurrency } from '../../composables/useCurrency'
import AppCard from '../ui/AppCard.vue'

const props = defineProps({
  totalBalance: Number,
  totalIncome: Number,
  totalExpense: Number,
  transactions: {
    type: Array,
    default: () => []
  }
})

const { formatIDR } = useCurrency()

// Sparkline Generation Logic
const generateSparkline = (type) => {
  if (!props.transactions.length) return 'M 0 20 L 100 20'
  
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const dailyData = last7Days.map(date => {
    return props.transactions
      .filter(tx => tx.type === type && tx.created_at.startsWith(date))
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0)
  })

  const max = Math.max(...dailyData, 1)
  const min = Math.min(...dailyData)
  const range = max - min || 1

  return dailyData.map((val, i) => {
    const x = (i / 6) * 100
    const y = 40 - ((val - min) / range) * 30 - 5 // Leave some padding
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}

const incomeSparkline = computed(() => generateSparkline('INCOME'))
const expenseSparkline = computed(() => generateSparkline('EXPENSE'))
</script>
