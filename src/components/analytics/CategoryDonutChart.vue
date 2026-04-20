<template>
  <div class="premium-card p-6 h-full flex flex-col group min-h-[350px]">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{{ subtitle }}</h3>
        <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ title }}</p>
      </div>
      <div :class="type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'" class="w-10 h-10 rounded-2xl flex items-center justify-center">
        <svg v-if="type === 'INCOME'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
      </div>
    </div>
    
    <div v-if="isEmpty" class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-gray-700">
      <div class="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
      </div>
      <p class="text-sm font-bold text-slate-500 dark:text-gray-400">No {{ (type || 'data').toLowerCase() }} available.</p>
    </div>
    
    <div v-else class="flex-1 relative flex items-center justify-center">
      <VueApexCharts type="donut" width="100%" height="280" :options="chartOptions" :series="series" />
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
  type: {
    type: String,
    required: true, // 'INCOME' or 'EXPENSE'
  },
  title: {
    type: String,
    default: 'Category Breakdown'
  },
  subtitle: {
    type: String,
    default: 'Analytics'
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const filteredTxs = computed(() => props.transactions.filter(tx => tx.type === props.type))
const isEmpty = computed(() => !filteredTxs.value || filteredTxs.value.length === 0)

const chartData = computed(() => {
  if (isEmpty.value) return { labels: [], series: [], colors: [] }

  const grouped = {}
  
  filteredTxs.value.forEach(tx => {
    const catName = tx.categories?.name || 'Uncategorized'
    const catColor = tx.categories?.color || (props.type === 'INCOME' ? '#10b981' : '#f43f5e')
    
    if (!grouped[catName]) {
      grouped[catName] = { amount: 0, color: catColor }
    }
    grouped[catName].amount += Number(tx.amount) || 0
  })

  // Sort by amount descending
  const sortedCategories = Object.keys(grouped).sort((a, b) => grouped[b].amount - grouped[a].amount)
  
  return {
    labels: sortedCategories,
    series: sortedCategories.map(cat => grouped[cat].amount),
    colors: sortedCategories.map(cat => grouped[cat].color)
  }
})

const series = computed(() => chartData.value.series)

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'inherit',
    background: 'transparent',
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  labels: chartData.value.labels,
  colors: chartData.value.colors,
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: 800,
            color: props.isDarkMode ? '#94a3b8' : '#334155',
          },
          value: {
            show: true,
            fontSize: '16px',
            fontFamily: 'inherit',
            fontWeight: 900,
            color: props.isDarkMode ? '#f8fafc' : '#020617',
            formatter: (val) => {
              return `Rp ${Number(val).toLocaleString()}`
            }
          },
          total: {
            show: true,
            showAlways: false,
            label: 'Total',
            fontSize: '10px',
            fontWeight: 900,
            color: props.isDarkMode ? '#94a3b8' : '#334155',
            formatter: function (w) {
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              if (total >= 1000000) return `Rp ${(total/1000000).toFixed(1)}M`
              return `Rp ${(total/1000).toFixed(0)}k`
            }
          }
        }
      }
    }
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: props.isDarkMode ? ['#1e293b'] : ['#ffffff'] },
  legend: { 
    show: true, 
    position: 'bottom',
    horizontalAlign: 'center',
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
