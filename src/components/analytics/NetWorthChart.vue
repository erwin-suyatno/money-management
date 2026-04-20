<template>
  <div class="premium-card p-6 h-full flex flex-col group min-h-[350px]">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{{ $t('health.future_projection') }}</h3>
        <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('health.net_worth_trend') }}</p>
      </div>
    </div>
    
    <div class="flex-1 relative">
      <VueApexCharts type="area" height="100%" :options="chartOptions" :series="series" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useWalletStore } from '../../stores/useWalletStore'
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

// REAL DATA CALCULATION: Backtracking from current balance using transaction history
const chartData = computed(() => {
  const months = []
  const assets = []
  const debtsData = []
  const netWorth = []
  
  const now = new Date()
  const currentTotalAssets = props.totalBalance
  const currentTotalDebts = debtStore.debts.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
  
  // Starting point: current end of month
  let runningAssets = currentTotalAssets
  
  // We'll calculate for the last 6 months
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthLabel = d.toLocaleString('id-ID', { month: 'short' })
    months.unshift(monthLabel)
    
    // For historical trend, we assuming debt movement based on transaction context
    // or just use current if no historical snapshots available.
    const estimatedDebts = currentTotalDebts 
    
    assets.unshift(Math.max(runningAssets, 0))
    debtsData.unshift(estimatedDebts)
    netWorth.unshift(runningAssets - estimatedDebts)
    
    // Backtrack: find net flow for this specific month across ALL transactions
    const monthNetFlow = transactionStore.transactions.filter(tx => {
      const txDate = new Date(tx.created_at)
      return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear()
    }).reduce((sum, tx) => {
      return sum + (tx.type === 'INCOME' ? Number(tx.amount) : -Number(tx.amount))
    }, 0)
    
    runningAssets -= monthNetFlow
  }
  
  return { labels: months, assets, debts: debtsData, netWorth }
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
    animations: { enabled: true }
  },
  colors: ['#3b82f6', '#f43f5e', '#10b981'], // Blue, Rose, Emerald
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 90, 100] }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: [2, 2, 3] },
  xaxis: {
    categories: chartData.value.labels,
    labels: {
      style: { colors: props.isDarkMode ? '#94a3b8' : '#334155', fontWeight: 600, fontSize: '10px' }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (val) => {
        if (val === 0) return '0'
        return val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${(val/1000).toFixed(1)}k`
      },
      style: { colors: props.isDarkMode ? '#94a3b8' : '#334155', fontWeight: 600, fontSize: '10px' }
    }
  },
  grid: {
    borderColor: props.isDarkMode ? '#374151' : '#e2e8f0',
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    padding: { top: 0, right: 0, bottom: 0, left: 10 }
  },
  legend: { 
    show: true, 
    position: 'top', 
    horizontalAlign: 'right',
    labels: { colors: props.isDarkMode ? '#94a3b8' : '#334155' },
    markers: { radius: 12 }
  },
  theme: { mode: props.isDarkMode ? 'dark' : 'light' },
  tooltip: {
    theme: props.isDarkMode ? 'dark' : 'light',
    y: {
      formatter: (val) => `Rp ${val.toLocaleString()}`
    }
  }
}))
</script>
