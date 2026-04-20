<template>
  <div class="premium-card p-6 h-full flex flex-col group min-h-[350px]">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{{ $t('analytics.top_spending') || 'Behavioral Sync' }}</h3>
        <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('analytics.spending_trend') || 'Daily Spending Trend' }}</p>
      </div>
    </div>
    
    <div v-if="isEmpty" class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-gray-700">
      <p class="text-sm font-bold text-slate-500 dark:text-gray-400">No expenses to track behaviors yet.</p>
    </div>
    
    <div v-else class="flex-1 relative">
      <VueApexCharts type="bar" height="100%" :options="chartOptions" :series="series" />
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

const expenses = computed(() => props.transactions.filter(tx => tx.type === 'EXPENSE'))
const isEmpty = computed(() => expenses.value.length === 0)

const chartData = computed(() => {
  if (isEmpty.value) return { labels: [], series: [] }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const amounts = [0, 0, 0, 0, 0, 0, 0]
  
  expenses.value.forEach(tx => {
    const d = new Date(tx.created_at)
    amounts[d.getDay()] += Number(tx.amount) || 0
  })

  return { labels: days, series: amounts }
})

const series = computed(() => [
  { name: 'Expenses', data: chartData.value.series }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'inherit',
    background: 'transparent',
    animations: { enabled: true }
  },
  colors: ['#f43f5e'], // Rose
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '50%',
      distributed: true
    }
  },
  dataLabels: { enabled: false },
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
        return val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${(val/1000).toFixed(0)}k`
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
  legend: { show: false },
  theme: { mode: props.isDarkMode ? 'dark' : 'light' },
  tooltip: {
    theme: props.isDarkMode ? 'dark' : 'light',
    y: {
      formatter: (val) => `Rp ${val.toLocaleString()}`
    }
  }
}))
</script>
