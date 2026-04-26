<template>
  <div class="premium-card p-6 flex flex-col group min-h-[400px]">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{{ $t('health.net_worth') }}</h3>
        <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('health.net_worth_trend') }}</p>
      </div>
    </div>
    
    <div v-if="isEmpty" class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-gray-700">
      <p class="text-sm font-bold text-slate-500 dark:text-gray-400">{{$t('health.not_enough_data')}}.</p>
    </div>
    
    <div v-else class="flex-1 relative">
      <VueApexCharts type="area" height="100%" :options="chartOptions" :series="series" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useDebtStore } from '../../stores/useDebtStore'
import { useTransactionStore } from '../../stores/useTransactionStore'

const props = defineProps({
  totalBalance: {
    type: Number,
    required: true,
    default: 0
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const transactionStore = useTransactionStore()
const debtStore = useDebtStore()

const isEmpty = computed(() => !transactionStore.analyticsTransactions || transactionStore.analyticsTransactions.length === 0)

const chartData = computed(() => {
  if (isEmpty.value) return { labels: [], assets: [], debts: [], netWorth: [] }

  // 1. Identify Debt Categories
  const debtCategoryIds = new Set(debtStore.debts.map(d => d.category_id).filter(id => !!id))
  
  // 2. Determine Time Steps
  const txs = transactionStore.analyticsTransactions
  const dates = txs.map(tx => new Date(tx.created_at))
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date() // Current time is our anchor
  
  const diffDays = (maxDate - minDate) / (1000 * 60 * 60 * 24)
  const useMonthly = diffDays > 60 // More than 2 months -> show monthly snapshots
  
  const snapshots = []
  
  // Ground truth: CURRENT STATE
  let runningAssets = props.totalBalance
  let runningDebts = debtStore.debts.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
  
  // We'll iterate backwards from TODAY to minDate
  let currentPointer = new Date(maxDate)
  
  while (currentPointer >= minDate) {
    const label = useMonthly 
      ? currentPointer.toLocaleString('id-ID', { month: 'short', year: '2-digit' })
      : currentPointer.toLocaleString('id-ID', { month: 'short', day: 'numeric' })
    
    snapshots.unshift({
      label,
      date: new Date(currentPointer),
      assets: runningAssets,
      debts: runningDebts,
      netWorth: runningAssets - runningDebts
    })
    
    // Determine the next step backwards
    const prevPointer = new Date(currentPointer)
    if (useMonthly) {
      prevPointer.setMonth(prevPointer.getMonth() - 1)
      prevPointer.setDate(new Date(prevPointer.getFullYear(), prevPointer.getMonth() + 1, 0).getDate()) // Last day of prev month
    } else {
      prevPointer.setDate(prevPointer.getDate() - 1)
    }

    // Calculate Net Flow in the period [prevPointer, currentPointer]
    const periodTxs = txs.filter(tx => {
      const d = new Date(tx.created_at)
      return d > prevPointer && d <= currentPointer
    })
    
    const netFlow = periodTxs.reduce((sum, tx) => {
      const amount = Number(tx.amount) || 0
      return sum + (tx.type === 'INCOME' ? amount : -amount)
    }, 0)
    
    const debtPaid = periodTxs.reduce((sum, tx) => {
      if (debtCategoryIds.has(tx.category_id)) {
        return sum + (Number(tx.amount) || 0)
      }
      return sum
    }, 0)
    
    // Backtrack the running values
    runningAssets -= netFlow
    runningDebts += debtPaid // If we paid debt in the past, the past balance was higher
    
    currentPointer = prevPointer
    
    // Break if we have too many points (safety)
    if (snapshots.length > 50) break
  }
  
  return {
    labels: snapshots.map(s => s.label),
    assets: snapshots.map(s => s.assets),
    debts: snapshots.map(s => s.debts),
    netWorth: snapshots.map(s => s.netWorth)
  }
})

const series = computed(() => [
  { name: 'Assets', data: chartData.value.assets },
  { name: 'Debts', data: chartData.value.debts },
  { name: 'Net Worth', data: chartData.value.netWorth }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'inherit',
    background: 'transparent',
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
    zoom: { enabled: false },
    sparkline: { enabled: false }
  },
  colors: ['#1d4ed8', '#b91c1c', '#047857'], // Pure Blue, Pure Red, Pure Emerald
  fill: {
    type: 'solid',
    opacity: 0.2
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 4 },
  xaxis: {
    categories: chartData.value.labels,
    tooltip: { enabled: false },
    labels: {
      style: { colors: props.isDarkMode ? '#cbd5e1' : '#1e293b', fontWeight: 900, fontSize: '10px' }
    },
    axisBorder: { show: true, color: props.isDarkMode ? '#475569' : '#cbd5e1', strokeWidth: 2 },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (val) => {
        if (val === 0) return '0'
        return Math.abs(val) >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${(val/1000).toFixed(0)}k`
      },
      style: { colors: props.isDarkMode ? '#cbd5e1' : '#1e293b', fontWeight: 900, fontSize: '10px' }
    }
  },
  grid: {
    borderColor: props.isDarkMode ? '#334155' : '#e2e8f0',
    strokeDashArray: 0,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } },
    padding: { top: 0, right: 0, bottom: 0, left: 10 }
  },
  legend: { 
    show: true, 
    position: 'top', 
    horizontalAlign: 'right',
    offsetY: -20,
    labels: { colors: props.isDarkMode ? '#f1f5f9' : '#0f172a', fontWeight: 900 },
    markers: { radius: 2, width: 12, height: 12 }
  },
  theme: { mode: props.isDarkMode ? 'dark' : 'light' },
  tooltip: {
    enabled: true,
    theme: props.isDarkMode ? 'dark' : 'light',
    shared: true,
    intersect: false,
    y: {
      formatter: (val) => `Rp ${val.toLocaleString()}`
    }
  }
}))
</script>

