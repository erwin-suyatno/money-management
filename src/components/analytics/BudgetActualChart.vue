<template>
  <div class="premium-card p-6 h-full flex flex-col group min-h-[350px]">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{{ $t('ladder.status') }}</h3>
        <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('health.budget_actual') }}</p>
      </div>
    </div>
    
    <div v-if="isEmpty" class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-gray-700">
      <p class="text-sm font-bold text-slate-500 dark:text-gray-400">No expenses recorded for budgeting.</p>
    </div>
    
    <div v-else class="flex-1 relative">
      <VueApexCharts type="bar" height="100%" :options="chartOptions" :series="series" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

import { useBudgetStore } from '../../stores/useBudgetStore'

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

const budgetStore = useBudgetStore()
const expenses = computed(() => props.transactions.filter(tx => tx.type === 'EXPENSE'))
const isEmpty = computed(() => expenses.value.length === 0)

const chartData = computed(() => {
  if (isEmpty.value) return { labels: [], actual: [], budget: [] }

  const grouped = {}
  expenses.value.forEach(tx => {
    const catName = tx.categories?.name || 'Uncategorized'
    if (!grouped[catName]) {
      grouped[catName] = 0
    }
    grouped[catName] += Number(tx.amount) || 0
  })

  // Sort by actual descending and crop to top 5
  const sortedCategories = Object.keys(grouped).sort((a, b) => grouped[b] - grouped[a]).slice(0, 5)
  
  // REAL BUDGET DATA: Look up categories in budgetStore
  const actuals = sortedCategories.map(cat => grouped[cat])
  const budgets = sortedCategories.map(cat => {
    const budgetObj = budgetStore.budgets.find(b => b.categories?.name === cat)
    if (!budgetObj) return 0
    
    // Normalize budget to monthly (chart usually assumes monthly comparison)
    let amount = Number(budgetObj.amount)
    if (budgetObj.period_type === 'WEEKLY') amount *= 4.33
    else if (budgetObj.period_type === 'DAILY') amount *= 30
    else if (budgetObj.period_type === 'YEARLY') amount /= 12
    
    return amount
  })
  
  return { labels: sortedCategories, actual: actuals, budget: budgets }
})

const series = computed(() => [
  { name: 'Actual', data: chartData.value.actual },
  { name: 'Budget', data: chartData.value.budget }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'inherit',
    background: 'transparent',
    animations: { enabled: true }
  },
  colors: ['#f43f5e', '#e2e8f0'], // Actual vs Budget
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 4,
      dataLabels: { position: 'top' },
      barHeight: '70%'
    }
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 1, colors: ['#fff'] },
  xaxis: {
    categories: chartData.value.labels,
    labels: {
      formatter: (val) => {
        if (val === 0) return '0'
        return val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${(val/1000).toFixed(0)}k`
      },
      style: { colors: props.isDarkMode ? '#94a3b8' : '#334155', fontWeight: 600, fontSize: '10px' }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: { colors: props.isDarkMode ? '#94a3b8' : '#334155', fontWeight: 600, fontSize: '11px' }
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
    labels: { colors: props.isDarkMode ? '#94a3b8' : '#334155' }
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
