<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 pb-32">
    <div class="mb-10">
      <h2 class="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">Activity</h2>
      <p class="mt-2 text-gray-500 dark:text-gray-400 font-medium tracking-tight">Track every penny in and out of your accounts.</p>
    </div>

    <!-- Error message -->
    <div v-if="transactionStore.error" class="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-3xl p-4 flex items-center text-red-700 dark:text-red-400">
      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <p class="text-sm font-bold">{{ transactionStore.error }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <!-- Left Column: Summary & List -->
      <div class="lg:col-span-12 xl:col-span-12">
        <!-- Record Transaction Card (Moved to a side or top) -->
        <div class="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 mb-12 border border-gray-100 dark:border-gray-750 shadow-sm">
           <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
             <h3 class="text-xl font-black dark:text-white">Quick Entry</h3>
             
             <!-- Type Toggle -->
             <div class="inline-flex p-1 bg-gray-50 dark:bg-gray-900 rounded-2xl w-full md:w-64">
               <button @click="txType = 'EXPENSE'" :class="txType === 'EXPENSE' ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm' : 'text-gray-400'" class="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Expense</button>
               <button @click="txType = 'INCOME'" :class="txType === 'INCOME' ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm' : 'text-gray-400'" class="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Income</button>
             </div>
           </div>

           <form @submit.prevent="submitTransaction" class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="md:col-span-1">
                 <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Category</label>
                 <select v-model="selectedCategory" required class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-bold transition-all appearance-none">
                    <option v-for="cat in filteredQuickCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                 </select>
              </div>
              <div class="md:col-span-1">
                 <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Source Wallet</label>
                 <select v-model="selectedWallet" required class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-bold transition-all">
                    <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
                 </select>
              </div>
              <div class="md:col-span-1">
                 <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Amount</label>
                 <div class="relative">
                    <span class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                    <input v-model.number="amount" type="number" required min="1" placeholder="0" class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-bold transition-all tabular-nums">
                 </div>
              </div>
              <div class="md:col-span-1">
                 <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Note</label>
                 <input v-model="description" type="text" placeholder="What's this for?" class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-bold transition-all">
              </div>
              <div class="md:col-span-4">
                 <button type="submit" :disabled="transactionStore.loading || walletStore.wallets.length === 0" class="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50">
                    {{ transactionStore.loading ? 'Saving Entry...' : 'Post Transaction' }}
                 </button>
              </div>
           </form>
        </div>

        <!-- View Toggle & Controls -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-8">
      <div class="inline-flex p-1.5 bg-slate-100 dark:bg-gray-900 rounded-2xl w-full lg:w-auto self-start shadow-inner">
        <button @click="viewMode = 'list'" :class="viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-md scale-[1.02]' : 'text-slate-400'" 
                class="flex-1 lg:px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 6h16M4 12h16M4 18h16"/></svg>
          List View
        </button>
        <button @click="viewMode = 'calendar'" :class="viewMode === 'calendar' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-md scale-[1.02]' : 'text-slate-400'" 
                class="flex-1 lg:px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Calendar
        </button>
      </div>

      <!-- Filters & Month Nav -->
      <div class="flex flex-wrap items-center gap-4">
        <div v-if="viewMode === 'list'" class="flex items-center space-x-3 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
           <div class="flex items-center px-3 space-x-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</span>
              <input type="date" v-model="startDate" class="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black uppercase dark:text-white cursor-pointer">
           </div>
           <div class="w-[1px] h-4 bg-slate-100 dark:bg-gray-800"></div>
           <div class="flex items-center px-3 space-x-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</span>
              <input type="date" v-model="endDate" class="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black uppercase dark:text-white cursor-pointer">
           </div>
           <button v-if="startDate || endDate" @click="resetFilters" class="p-2 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl text-indigo-500 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
           </button>
        </div>

        <div v-if="viewMode === 'calendar'" class="flex items-center space-x-4 bg-slate-100 dark:bg-gray-900 p-1.5 rounded-2xl">
          <button @click="prevMonth" class="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg></button>
          <span class="text-[10px] font-black uppercase tracking-widest px-4 min-w-[140px] text-center dark:text-white">{{ currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}</span>
          <button @click="nextMonth" class="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg></button>
        </div>
      </div>
    </div>

    <!-- Transactions View Container -->
    <div class="space-y-12">
      <div v-if="transactionStore.loading && transactionStore.transactions.length === 0" class="flex justify-center py-24">
         <div class="w-14 h-14 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="filteredTransactions.length === 0" class="py-24 text-center premium-card !rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-gray-800">
         <p class="text-slate-400 font-black uppercase tracking-widest">No activity matches your filter.</p>
         <button v-if="startDate || endDate" @click="resetFilters" class="mt-6 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Clear all filters</button>
      </div>

      <!-- List Mode (Table) -->
      <div v-else-if="viewMode === 'list'" class="premium-card !p-0 overflow-hidden shadow-2xl border-t-8 border-indigo-600">
         <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
            <table class="w-full text-left border-collapse">
               <thead class="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-20 border-b border-slate-100 dark:border-gray-800">
                  <tr>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Wallet</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-slate-50 dark:divide-gray-800/50">
                  <tr v-for="tx in paginatedTransactions" :key="tx.id" class="group hover:bg-slate-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                     <td class="p-6 py-5">
                        <span class="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{{ new Date(tx.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: '2-digit'}) }}</span>
                     </td>
                     <td class="p-6 py-5">
                        <div class="flex items-center space-x-3">
                           <div v-if="tx.categories" :style="{ backgroundColor: tx.categories.color + '20', color: tx.categories.color }" 
                                class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
                              <component :is="tx.categories.icon || 'tag'" class="w-5 h-5" />
                           </div>
                           <div v-else class="w-10 h-10 bg-slate-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-slate-400">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                           </div>
                           <div>
                              <p class="text-sm font-bold text-slate-600 dark:text-gray-300 truncate max-w-xs">{{ tx.description || tx.categories?.name || 'General' }}</p>
                              <p v-if="tx.categories" class="text-[9px] font-black uppercase tracking-widest opacity-50">{{ tx.categories.name }}</p>
                           </div>
                        </div>
                     </td>
                     <td class="p-6 py-5">
                        <span class="px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">{{ tx.wallets?.name }}</span>
                     </td>
                     <td class="p-6 py-5">
                        <span :class="tx.categories?.category_types?.code === 'INCOME' || tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'" class="text-[9px] font-black uppercase tracking-widest">
                           {{ tx.categories?.category_types?.name || tx.type }}
                        </span>
                     </td>
                     <td class="p-6 py-5 text-right font-black tabular-nums tracking-tighter" :class="tx.categories?.category_types?.code === 'INCOME' || tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'">
                        {{ (tx.categories?.category_types?.code === 'INCOME' || tx.type === 'INCOME') ? '+' : '-' }}{{ tx.amount.toLocaleString('id-ID') }}
                     </td>
                     <td class="p-6 py-5 text-right flex items-center justify-end space-x-2">
                        <button @click="openEdit(tx)" class="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-all" title="Edit">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button @click="confirmDelete(tx)" class="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-slate-400 hover:text-rose-600 transition-all" title="Delete">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
         
         <!-- Pagination Footer -->
         <div class="p-6 border-t border-slate-50 dark:border-gray-800 bg-slate-50/30 dark:bg-gray-900/30 flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
               Showing {{ (currentPage-1)*itemsPerPage + 1 }}-{{ Math.min(currentPage*itemsPerPage, filteredTransactions.length) }} of {{ filteredTransactions.length }}
            </p>
            <div class="flex items-center space-x-2">
               <button @click="prevPage" :disabled="currentPage === 1" class="p-2 px-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 disabled:opacity-30 transition-all shadow-sm">Prev</button>
               <span class="text-[10px] font-black text-slate-900 dark:text-white px-4">Page {{ currentPage }} of {{ totalPages }}</span>
               <button @click="nextPage" :disabled="currentPage === totalPages" class="p-2 px-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 disabled:opacity-30 transition-all shadow-sm">Next</button>
            </div>
         </div>
      </div>

          <!-- Calendar Mode -->
          <div v-else-if="viewMode === 'calendar'" class="premium-card !p-0 overflow-hidden shadow-2xl border-t-8 border-indigo-600">
             <div class="grid grid-cols-7 border-b border-slate-50 dark:border-gray-800/50">
               <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" 
                    class="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                 {{ day }}
               </div>
             </div>
             <div class="grid grid-cols-7">
               <div v-for="(d, i) in calendarDays" :key="i" 
                    @click="openDetails(d.date)"
                    class="min-h-[140px] sm:min-h-[180px] p-3 border-r border-b border-slate-50 dark:border-gray-800/50 relative transition-all cursor-pointer hover:bg-slate-50/50 dark:hover:bg-gray-800/20"
                    :class="[!d.current ? 'bg-slate-50/30 dark:bg-gray-900/10' : 'bg-white dark:bg-transparent']">
                 <span :class="[d.current ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-gray-700']" class="text-xs font-black">{{ d.day }}</span>
                 
                 <div v-if="transactionsByDate[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`]" class="mt-4 space-y-1.5 overflow-y-auto max-h-[120px] pr-1 custom-scrollbar">
                    <div v-for="tx in transactionsByDate[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`]" :key="tx.id" 
                         :class="tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'"
                         class="p-2 rounded-lg flex flex-col space-y-0.5">
                       <span class="text-[8px] font-black truncate leading-tight tracking-tight capitalize">{{ tx.description || 'Trans' }}</span>
                       <span class="text-[8px] font-black tabular-nums tracking-tighter">{{ (tx.amount / 1000).toFixed(0) }}k</span>
                    </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useWalletStore } from '../stores/useWalletStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useCategoryStore } from '../stores/useCategoryStore'
import CalendarDayModal from '../components/CalendarDayModal.vue'
import TransactionFormModal from '../components/TransactionFormModal.vue'

const walletStore = useWalletStore()
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()

const txType = ref('EXPENSE')
const selectedWallet = ref('')
const selectedCategory = ref(null)
const amount = ref(null)
const description = ref('')

// Pagination & Filtering
const viewMode = ref('list') // 'list' or 'calendar'
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const currentMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

onMounted(async () => {
  await Promise.all([
    walletStore.fetchWallets(),
    transactionStore.fetchTransactions(),
    categoryStore.fetchInitialData()
  ])
  
  if (walletStore.wallets.length > 0 && !selectedWallet.value) {
    selectedWallet.value = walletStore.wallets[0].id
  }

  // Set default category for Quick Entry
  if (!selectedCategory.value) {
    const defaultCat = categoryStore.expenseCategories[0]
    if (defaultCat) selectedCategory.value = defaultCat.id
  }
})

const filteredQuickCategories = computed(() => {
  return categoryStore.categories.filter(c => c.category_types?.code === txType.value)
})

watch(txType, (newType) => {
  const cats = categoryStore.categories.filter(c => c.category_types?.code === newType)
  if (cats.length > 0) {
    selectedCategory.value = cats[0].id
  }
})

const filteredTransactions = computed(() => {
  let list = [...transactionStore.transactions]
  if (startDate.value) {
    const start = new Date(startDate.value + 'T00:00:00')
    list = list.filter(tx => new Date(tx.created_at) >= start)
  }
  if (endDate.value) {
    const end = new Date(endDate.value + 'T23:59:59')
    list = list.filter(tx => new Date(tx.created_at) <= end)
  }
  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage.value))

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTransactions.value.slice(start, end)
})

const resetFilters = () => {
  startDate.value = ''
  endDate.value = ''
  currentPage.value = 1
}

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

// Calendar Logic
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  const startOffset = firstDay.getDay()
  
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, current: false, date: new Date(year, month - 1, prevMonthLastDay - i) })
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ day: i, current: true, date: new Date(year, month, i) })
  }
  
  const totalCells = 42
  const endOffset = totalCells - days.length
  for (let i = 1; i <= endOffset; i++) {
    days.push({ day: i, current: false, date: new Date(year, month + 1, i) })
  }
  return days
})

const transactionsByDate = computed(() => {
    const map = {}
    transactionStore.transactions.forEach(tx => {
        const d = new Date(tx.created_at)
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        if (!map[key]) map[key] = []
        map[key].push(tx)
    })
    return map
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
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  editingTx.value = null
}

const confirmDelete = async (tx) => {
  if (!confirm('Are you sure you want to delete this transaction? This will revert the balance update in your wallet.')) return
  const success = await transactionStore.deleteTransaction(tx.id)
  if (success) {
    handleTxSuccess()
  }
}

const handleTxSuccess = async () => {
  await transactionStore.fetchTransactions()
  await walletStore.fetchWallets()
}

const submitTransaction = async () => {
  if (!selectedWallet.value || amount.value <= 0) return
  const success = await transactionStore.addTransaction(
    selectedWallet.value,
    txType.value,
    amount.value,
    description.value,
    null,
    selectedCategory.value
  )
  if (success) {
    amount.value = null
    description.value = ''
  }
}
</script>

