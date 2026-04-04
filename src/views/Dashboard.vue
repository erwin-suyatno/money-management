<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-10 lg:p-16 pb-32">
    <!-- Header Section -->
    <div class="mb-14 flex flex-col md:flex-row md:items-end justify-between space-y-8 md:space-y-0">
      <div>
        <h1 class="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Dashboard</h1>
        <p class="mt-3 text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">Your financial story, beautifully told.</p>
      </div>
      <div class="relative group">
        <select v-model="selectedRange" class="w-full md:w-56 appearance-none bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5 shadow-sm hover:shadow-md transition-all cursor-pointer focus:ring-4 focus:ring-indigo-500/10 active:scale-95">
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>

    <!-- Summary Section -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
      <!-- Main Glass Card -->
      <div class="lg:col-span-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-1000"></div>
        <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
        
        <div class="relative z-10 flex flex-col h-full justify-between">
          <div>
            <h3 class="text-indigo-100/80 font-black text-[10px] uppercase tracking-[0.3em] mb-6">Total Working Balance</h3>
            <div class="flex items-baseline space-x-2">
               <span class="text-2xl font-medium text-indigo-100/60">Rp</span>
               <p class="text-5xl sm:text-6xl font-black tracking-tighter tabular-nums drop-shadow-sm">{{ totalBalance.toLocaleString('id-ID') }}</p>
            </div>
          </div>
          
          <div class="mt-12 flex items-center space-x-4">
             <div :class="netFlow >= 0 ? 'bg-white/20' : 'bg-rose-500/30'" class="px-5 py-2.5 rounded-2xl backdrop-blur-md flex items-center space-x-2 border border-white/10">
                <div :class="netFlow >= 0 ? 'bg-emerald-400' : 'bg-rose-400'" class="w-2 h-2 rounded-full animate-pulse"></div>
                <span class="text-xs font-black uppercase tracking-widest">
                   {{ netFlow >= 0 ? '+' : '' }}{{ ((netFlow/Math.max(totalIncome, 1))*100).toFixed(1) }}% Flow
                </span>
             </div>
             <p class="text-xs font-bold text-indigo-100/60 tracking-tight">Relative to incoming funds</p>
          </div>
        </div>
      </div>

      <!-- Side Stats -->
      <div class="lg:col-span-4 grid grid-cols-1 gap-8">
        <!-- Income Card -->
        <div class="premium-card p-8 flex flex-col justify-between group hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
          <div class="flex items-center justify-between mb-2">
            <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
            </div>
            <span class="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest">Growing</span>
          </div>
          <div>
            <h3 class="text-slate-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Income</h3>
            <p class="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">Rp {{ totalIncome.toLocaleString('id-ID') }}</p>
          </div>
        </div>

        <!-- Expense Card -->
        <div class="premium-card p-8 flex flex-col justify-between group hover:border-rose-200 dark:hover:border-rose-900 transition-colors">
          <div class="flex items-center justify-between mb-2">
            <div class="w-12 h-12 bg-rose-50 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
            </div>
            <span class="text-[10px] font-black text-rose-600/50 uppercase tracking-widest">Controlled</span>
          </div>
          <div>
            <h3 class="text-slate-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Expense</h3>
            <p class="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">Rp {{ totalExpense.toLocaleString('id-ID') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chart Section -->
    <div class="premium-card p-12 mb-16 overflow-hidden relative border-t-8 border-indigo-600">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-12 space-y-4 sm:space-y-0 px-2">
        <div>
          <h3 class="text-2xl font-black dark:text-white tracking-tight">Cashflow Analytics</h3>
          <p class="text-sm font-medium text-slate-400 mt-1">Daily trend of movements</p>
        </div>
        <div class="flex space-x-6">
           <div class="flex items-center space-x-2.5">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
              <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Income</span>
           </div>
           <div class="flex items-center space-x-2.5">
              <div class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20"></div>
              <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Expense</span>
           </div>
        </div>
      </div>
      
      <div v-if="transactionStore.loading" class="h-96 flex items-center justify-center">
         <div class="w-14 h-14 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
      <div v-else class="h-96 w-full -mx-4">
        <VueApexCharts type="area" height="100%" width="100%" :options="chartOptions" :series="chartSeries" />
      </div>
    </div>

    <!-- Activity & Calendar Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- Recent Transactions -->
      <div class="lg:col-span-4 flex flex-col space-y-8">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-2xl font-black dark:text-white tracking-tight">Recent Activity</h3>
          <router-link to="/transaction" class="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors">View All</router-link>
        </div>
        
        <div class="premium-card !p-0 overflow-hidden divide-y divide-slate-50 dark:divide-gray-800/50">
          <div v-for="tx in recentTransactions" :key="tx.id" class="p-8 hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-all group">
             <div class="flex items-center justify-between">
                <div class="flex items-center space-x-5">
                   <div :class="tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30'" 
                        class="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                      <svg v-if="tx.type === 'INCOME'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
                      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
                   </div>
                   <div>
                      <p class="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{{ tx.description }}</p>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {{ new Date(tx.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) }}
                      </p>
                   </div>
                </div>
                <p :class="tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'" class="text-lg font-black tracking-tighter">
                   {{ tx.type === 'INCOME' ? '+' : '-' }}{{ Number(tx.amount).toLocaleString('id-ID') }}
                </p>
             </div>
          </div>
          <div v-if="recentTransactions.length === 0" class="p-16 text-center">
             <p class="text-slate-400 font-bold">No recent movements</p>
          </div>
        </div>
      </div>

      <!-- Financial Calendar -->
      <div class="lg:col-span-8 flex flex-col space-y-8">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-2xl font-black dark:text-white tracking-tight">Financial Calendar</h3>
          <div class="flex items-center space-x-4 bg-slate-100 dark:bg-gray-800 p-1.5 rounded-2xl">
            <button @click="prevMonth" class="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg></button>
            <span class="text-[10px] font-black uppercase tracking-widest px-4 min-w-[120px] text-center">{{ currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}</span>
            <button @click="nextMonth" class="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg></button>
          </div>
        </div>

        <div class="premium-card !p-0 overflow-hidden">
          <div class="grid grid-cols-7 border-b border-slate-50 dark:border-gray-800/50">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" 
                 class="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
              {{ day }}
            </div>
          </div>
          <div class="grid grid-cols-7">
            <div v-for="(d, i) in calendarDays" :key="i" 
                 @click="openDetails(d.date)"
                 class="h-32 sm:h-40 p-4 border-r border-b border-slate-50 dark:border-gray-800/50 relative group transition-all cursor-pointer hover:bg-slate-50/50 dark:hover:bg-gray-800/20"
                 :class="[!d.current ? 'bg-slate-50/30 dark:bg-gray-900/10' : 'bg-white dark:bg-transparent']">
              <span :class="[d.current ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-gray-700']" class="text-xs font-black">{{ d.day }}</span>
              
              <div v-if="dailySummaries[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`]" class="mt-4 space-y-2">
                 <div v-if="dailySummaries[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`].income > 0" class="flex flex-col">
                    <span class="text-[9px] font-black text-emerald-500 uppercase tracking-tighter tabular-nums">+{{ (dailySummaries[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`].income / 1000).toFixed(0) }}k</span>
                    <div class="w-full h-1 bg-emerald-500/20 rounded-full mt-0.5 overflow-hidden"><div class="h-full bg-emerald-500" style="width: 100%"></div></div>
                 </div>
                 <div v-if="dailySummaries[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`].expense > 0" class="flex flex-col">
                    <span class="text-[9px] font-black text-rose-500 uppercase tracking-tighter tabular-nums">-{{ (dailySummaries[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`].expense / 1000).toFixed(0) }}k</span>
                    <div class="w-full h-1 bg-rose-500/20 rounded-full mt-0.5 overflow-hidden"><div class="h-full bg-rose-500" style="width: 100%"></div></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Reusable Modals -->
    <CalendarDayModal 
      :is-open="showDetailModal" 
      :date="selectedDate" 
      :transactions="selectedDateTransactions" 
      @close="showDetailModal = false"
      @quick-add="openQuickAdd"
      @edit="openEdit"
    />

    <TransactionFormModal 
      :is-open="showAddModal" 
      :date="selectedDate" 
      :initial-data="editingTx"
      @close="closeAddModal"
      @success="handleTxSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '../stores/useWalletStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import VueApexCharts from "vue3-apexcharts"
import CalendarDayModal from '../components/CalendarDayModal.vue'
import TransactionFormModal from '../components/TransactionFormModal.vue'

const walletStore = useWalletStore()
const transactionStore = useTransactionStore()

const selectedRange = ref('30d')
const now = new Date()
const currentMonth = ref(new Date(now.getFullYear(), now.getMonth(), 1))

onMounted(async () => {
  await walletStore.fetchWallets()
  await transactionStore.fetchTransactions()
})

const totalBalance = computed(() => {
  return walletStore.wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0)
})

// Calendar Logic
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  const startOffset = firstDay.getDay()
  
  // Padding for previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, current: false, date: new Date(year, month - 1, prevMonthLastDay - i) })
  }
  
  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ day: i, current: true, date: new Date(year, month, i) })
  }
  
  // Padding for next month
  const totalCells = 42
  const endOffset = totalCells - days.length
  for (let i = 1; i <= endOffset; i++) {
    days.push({ day: i, current: false, date: new Date(year, month + 1, i) })
  }
  
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

const prevMonth = () => { 
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d
}
const nextMonth = () => { 
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d
}

// Modal Logic
const showDetailModal = ref(false)
const showAddModal = ref(false)
const selectedDate = ref(null)
const editingTx = ref(null)

const selectedDateTransactions = computed(() => {
  if (!selectedDate.value) return []
  const d = selectedDate.value
  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  return transactionStore.transactions.filter(tx => {
    const txDate = new Date(tx.created_at)
    return `${txDate.getFullYear()}-${txDate.getMonth()}-${txDate.getDate()}` === key
  })
})

const openDetails = (date) => {
  selectedDate.value = date
  showDetailModal.value = true
}

const openQuickAdd = (date) => {
  selectedDate.value = date
  showDetailModal.value = false
  setTimeout(() => {
    showAddModal.value = true
  }, 100)
}

const openEdit = (tx) => {
  editingTx.value = tx
  selectedDate.value = new Date(tx.created_at)
  showDetailModal.value = false
  setTimeout(() => {
    showAddModal.value = true
  }, 100)
}

const closeAddModal = () => {
  showAddModal.value = false
  editingTx.value = null
}

const handleTxSuccess = async () => {
  await transactionStore.fetchTransactions()
  await walletStore.fetchWallets()
}

// Recent Activity
const recentTransactions = computed(() => {
  return [...transactionStore.transactions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6)
})

const filteredTransactions = computed(() => {
// ...
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

const chartData = computed(() => {
  const groups = {}
  const labels = []
  const today = new Date(now)
  
  if (selectedRange.value === '7d' || selectedRange.value === '30d') {
    const days = selectedRange.value === '7d' ? 7 : 30
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      labels.push(key)
      groups[key] = { income: 0, expense: 0 }
    }
  } else if (selectedRange.value === 'year') {
    for (let i = 0; i < 12; i++) {
        const d = new Date(today.getFullYear(), i, 1)
        const key = d.toLocaleDateString('en-US', { month: 'short' })
        labels.push(key)
        groups[key] = { income: 0, expense: 0 }
    }
  } else {
    filteredTransactions.value.forEach(tx => {
       const d = new Date(tx.created_at)
       const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
       if(!groups[key]) groups[key] = { income:0, expense:0, raw: d.getTime() }
    })
    const sortedKeys = Object.keys(groups).sort((a,b) => groups[a].raw - groups[b].raw)
    labels.push(...sortedKeys)
  }

  filteredTransactions.value.forEach(tx => {
    const d = new Date(tx.created_at)
    let key = ''
    if (selectedRange.value === '7d' || selectedRange.value === '30d') {
      key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    } else if (selectedRange.value === 'year') {
      key = d.toLocaleDateString('en-US', { month: 'short' })
    } else {
      key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }
    
    if (groups[key]) {
      if (tx.type === 'INCOME') groups[key].income += Number(tx.amount)
      if (tx.type === 'EXPENSE') groups[key].expense += Number(tx.amount)
    }
  })

  return { labels, incomeSeries: labels.map(l => groups[l].income), expenseSeries: labels.map(l => groups[l].expense) }
})

const chartSeries = computed(() => [
  { name: 'Income', data: chartData.value.incomeSeries },
  { name: 'Expense', data: chartData.value.expenseSeries }
])

const chartOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit', zoom: { enabled: false }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  colors: ['#10B981', '#EF4444'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.0, stops: [0, 90, 100] } },
  xaxis: {
    categories: chartData.value.labels,
    labels: { style: { colors: '#9CA3AF', fontWeight: 600, fontSize: '11px' }, hideOverlappingLabels: true, rotate: -45 },
    tooltip: { enabled: false }, axisBorder: { show: false }, axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: { colors: '#9CA3AF', fontWeight: 600, fontSize: '10px' },
      formatter: (v) => v >= 1000000 ? (v/1000000).toFixed(1) + 'M' : v >= 1000 ? (v/1000).toFixed(0) + 'K' : v
    }
  },
  grid: { borderColor: '#f3f4f6', strokeDashArray: 4, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
  legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 12 }, fontWeight: 600 },
  tooltip: { theme: 'light', y: { formatter: (val) => 'Rp ' + val.toLocaleString('id-ID') } }
}))
</script>
