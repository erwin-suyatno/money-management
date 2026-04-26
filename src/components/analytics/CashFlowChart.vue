<template>
  <div class="premium-card p-6 h-full flex flex-col group min-h-[350px]">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{{ $t('analytics.cash_flow') || 'Cash Flow' }}</h3>
        <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Income vs Expense</p>
      </div>
    </div>
    
    <div v-if="isEmpty" class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-gray-700">
      <div class="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      </div>
      <p class="text-sm font-bold text-slate-500 dark:text-gray-400">No chart data available for this range.</p>
    </div>
    
    <div v-else class="flex-1 relative">
      <VueApexCharts type="area" height="100%" :options="chartOptions" :series="series" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
    default: () => []
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const isEmpty = computed(() => !props.transactions || props.transactions.length === 0)

const chartData = computed(() => {
  if (isEmpty.value) return { dates: [], income: [], expense: [] }

  const grouped = {}
  
  // Calculate range to determine grouping
  const dates = props.transactions.map(tx => new Date(tx.created_at))
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))
  const diffDays = (maxDate - minDate) / (1000 * 60 * 60 * 24)
  
  const useMonthly = diffDays > 90

  props.transactions.forEach(tx => {
    const d = new Date(tx.created_at)
    let dateStr
    if (useMonthly) {
      // Group by month: YYYY-MM
      dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
    } else {
      // Group by date: YYYY-MM-DD
      dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    if (!grouped[dateStr]) {
      grouped[dateStr] = { income: 0, expense: 0 }
    }
    const val = Number(tx.amount) || 0
    if (tx.type === 'INCOME') {
      grouped[dateStr].income += val
    } else if (tx.type === 'EXPENSE') {
      grouped[dateStr].expense += val
    }
  })

  // Sort dates chronologically
  const sortedDates = Object.keys(grouped).sort()
  return {
    dates: sortedDates,
    income: sortedDates.map(d => grouped[d].income),
    expense: sortedDates.map(d => grouped[d].expense),
    isMonthly: useMonthly
  }
})

const series = computed(() => [
  { name: 'Income', data: chartData.value.income },
  { name: 'Expense', data: chartData.value.expense }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'inherit',
    background: 'transparent',
    zoom: { enabled: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  colors: ['#10b981', '#f43f5e'], // Emerald 500, Rose 500
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 100]
    }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3, lineCap: 'round' },
  xaxis: {
    categories: chartData.value.dates,
    labels: {
      formatter: (val) => {
        if (!val) return ''
        const date = new Date(val)
        if (chartData.value.isMonthly) {
          return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      },
      style: { colors: props.isDarkMode ? '#64748b' : '#94a3b8', fontWeight: 700, fontSize: '9px' }
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false }
  },
  yaxis: {
    labels: {
      formatter: (val) => {
        if (val === 0) return '0'
        return val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${(val/1000).toFixed(0)}k`
      },
      style: { colors: props.isDarkMode ? '#64748b' : '#94a3b8', fontWeight: 700, fontSize: '9px' }
    }
  },
  grid: {
    borderColor: props.isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.5)',
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
    padding: { top: 10, right: 10, bottom: 0, left: 10 }
  },
  legend: { 
    show: true, 
    position: 'top', 
    horizontalAlign: 'right',
    offsetY: -30,
    labels: { colors: props.isDarkMode ? '#f1f5f9' : '#0f172a', fontWeight: 800, fontSize: '10px' },
    markers: { radius: 12, width: 8, height: 8, offsetX: -4 }
  },
  theme: { mode: props.isDarkMode ? 'dark' : 'light' },
  tooltip: {
    enabled: true,
    theme: props.isDarkMode ? 'dark' : 'light',
    shared: true,
    intersect: false,
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
      const income = series[0][dataPointIndex];
      const expense = series[1][dataPointIndex];
      return `<div class="px-4 py-3 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border-none">
        <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">${w.globals.labels[dataPointIndex]}</div>
        <div class="flex items-center gap-6">
          <div>
            <p class="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Income</p>
            <p class="text-sm font-black text-slate-900 dark:text-white">Rp ${income.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Expense</p>
            <p class="text-sm font-black text-slate-900 dark:text-white">Rp ${expense.toLocaleString()}</p>
          </div>
        </div>
      </div>`;
    }
  }
}))
</script>
