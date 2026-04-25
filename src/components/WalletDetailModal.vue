<template>
  <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-end justify-center overflow-hidden p-0 sm:items-center sm:p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="close"></div>
    
    <!-- Modal Content -->
    <div class="premium-card !p-0 relative z-10 flex h-auto max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2.5rem] border-t-8 border-indigo-600 shadow-2xl animate-slide-up sm:h-[85vh] sm:max-w-4xl sm:rounded-[2.5rem]">
      
      <!-- Sticky Header -->
      <div class="border-b border-slate-50 bg-white p-5 md:p-8 dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
               <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
            <div>
              <h3 class="text-xl md:text-2xl font-black dark:text-white tracking-tight">{{ wallet?.name }}</h3>
              <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5 md:mt-1">{{ $t('wallet_detail.title') }} • {{ formatIDR(wallet?.balance || 0) }}</p>
            </div>
          </div>
          <button @click="close" class="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-2xl transition-all">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Toolbar: Filters & View Switch -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="inline-flex p-1 bg-slate-50 dark:bg-gray-800 rounded-2xl shadow-inner">
            <button @click="viewMode = 'list'" :class="viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-md' : 'text-slate-400'" class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {{ $t('wallet_detail.view_list') }}
            </button>
            <button @click="viewMode = 'calendar'" :class="viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-md' : 'text-slate-400'" class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {{ $t('wallet_detail.view_calendar') }}
            </button>
          </div>

          <div class="flex items-center space-x-3 overflow-x-auto pb-1 no-scrollbar">
            <select v-model="dataTypeFilter" class="bg-slate-50 dark:bg-gray-800 border-none rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer">
              <option value="all">{{ $t('wallet_detail.filter_all') }}</option>
              <option value="tx">{{ $t('wallet_detail.filter_tx') }}</option>
              <option value="tr">{{ $t('wallet_detail.filter_tr') }}</option>
            </select>
            <div class="flex items-center space-x-2 bg-slate-50 dark:bg-gray-800 px-3 py-2.5 rounded-xl">
               <input type="date" v-model="startDate" class="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black dark:text-white cursor-pointer w-24">
               <span class="text-slate-300">/</span>
               <input type="date" v-model="endDate" class="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black dark:text-white cursor-pointer w-24">
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-slate-50/30 dark:bg-gray-950/20">
        
        <!-- List View -->
        <div v-if="viewMode === 'list'" class="space-y-6">
          <div v-if="paginatedHistory.length === 0" class="py-20 text-center">
             <div class="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-gray-700 shadow-sm">
                <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <p class="text-slate-400 font-black uppercase tracking-widest text-[10px]">{{ $t('wallet_detail.empty_history') }}</p>
          </div>

          <div v-else class="space-y-4">
             <div v-for="item in paginatedHistory" :key="item.id" 
                  class="group bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-slate-50 dark:border-gray-800/50 flex items-center justify-between hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all shadow-sm">
                <div class="flex items-center space-x-4">
                  <!-- Icon indicator -->
                  <div v-if="item._isTransfer" class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                  </div>
                  <div v-else :style="{ backgroundColor: item.categories?.color + '20', color: item.categories?.color || '#6366f1' }" class="w-12 h-12 rounded-2xl flex items-center justify-center">
                    <svg v-if="!item.categories?.icon || item.categories?.icon === 'Tag'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                    <component v-else :is="item.categories.icon" class="w-6 h-6" />
                  </div>

                  <div>
                    <h4 class="text-sm font-black text-slate-900 dark:text-white mb-0.5 tracking-tight">
                       {{ item.description || (item._isTransfer ? (item.from_wallet_id === wallet.id ? $t('wallet_detail.transfer_to', {wallet: item.to_wallet?.name}) : $t('wallet_detail.transfer_from', {wallet: item.from_wallet?.name})) : item.categories?.name) }}
                    </h4>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                       {{ new Date(item.created_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {day: 'numeric', month: 'short', year: '2-digit'}) }}
                       <span class="mx-2 opacity-30">•</span>
                       {{ item._isTransfer ? $t('nav.transfer') : item.categories?.name }}
                    </p>
                  </div>
                </div>

                <div class="text-right">
                  <p :class="getItemColorClass(item)" class="text-lg font-black tracking-tighter tabular-nums">
                    {{ getItemAmountPrefix(item) }}{{ formatIDR(item.amount) }}
                  </p>
                </div>
             </div>
          </div>
        </div>

        <!-- Calendar View -->
        <div v-else class="animate-in fade-in duration-300">
           <div class="flex items-center justify-between mb-8">
              <h3 class="text-xl font-black dark:text-white tracking-tight">{{ currentMonthName }}</h3>
              <div class="flex items-center space-x-2 bg-white dark:bg-gray-900 p-1 rounded-2xl border border-slate-100 dark:border-gray-800">
                 <button @click="prevMonth" class="p-2 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg></button>
                 <button @click="nextMonth" class="p-2 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg></button>
              </div>
           </div>

           <div class="grid grid-cols-7 gap-px bg-slate-100 dark:bg-gray-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm">
              <div v-for="day in ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']" :key="day" class="bg-white dark:bg-gray-900 p-3 text-center">
                 <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">{{ $t(`common.days.${day}`) }}</span>
              </div>
              <div v-for="(day, idx) in calendarDays" :key="idx" 
                   class="min-h-[100px] p-2 transition-colors relative group"
                   :class="[day.current ? 'bg-white dark:bg-gray-900' : 'bg-slate-50/50 dark:bg-gray-950/30 text-slate-300']"
                   @click="day.current && selectCalendarDay(day.date)">
                <span class="text-[10px] font-black ml-1 transition-colors" :class="[day.isToday ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md' : '']">{{ day.day }}</span>
                
                <div v-if="day.summary" class="mt-2 space-y-1">
                  <div v-if="day.summary.income > 0" class="h-1 lg:h-4 w-full bg-emerald-500/10 rounded-full flex items-center px-1">
                     <div class="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 hidden lg:block"></div>
                     <span class="text-[8px] font-black text-emerald-600 hidden lg:block uppercase tracking-tighter">+{{ (day.summary.income/1000).toFixed(0) }}k</span>
                  </div>
                  <div v-if="day.summary.expense > 0" class="h-1 lg:h-4 w-full bg-rose-500/10 rounded-full flex items-center px-1">
                     <div class="w-1 h-1 rounded-full bg-rose-500 mr-1.5 hidden lg:block"></div>
                     <span class="text-[8px] font-black text-rose-600 hidden lg:block uppercase tracking-tighter">-{{ (day.summary.expense/1000).toFixed(0) }}k</span>
                  </div>
                  <div v-if="day.summary.transferCount > 0" class="h-1 w-2/3 bg-blue-500/10 rounded-full lg:hidden mx-auto mt-1"></div>
                </div>
              </div>
           </div>

           <!-- Day detail popup below calendar on mobile or side on desktop could be complex, 
                let's just filter the list below or show a small list -->
           <div v-if="selectedDayHistory.length > 0" class="mt-10 animate-in fade-in slide-in-from-top-4 duration-500">
              <div class="flex items-center justify-between mb-4 px-2">
                 <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ formattedSelectedDate }}</h4>
                 <button @click="selectedDayTransactionsDate = null" class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{{ $t('dashboard.calendar_dismiss') }}</button>
              </div>
              <div class="space-y-3">
                 <div v-for="item in selectedDayHistory" :key="item.id" 
                      class="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-50 dark:border-gray-800 flex items-center justify-between shadow-sm">
                    <div class="flex items-center space-x-3">
                       <div class="w-8 h-8 rounded-xl flex items-center justify-center" :style="{ backgroundColor: (item._isTransfer ? '#3b82f620' : (item.categories?.color + '20' || '#6366f120')), color: (item._isTransfer ? '#3b82f6' : (item.categories?.color || '#6366f1')) }">
                          <svg v-if="item._isTransfer" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                          <svg v-else-if="!item.categories?.icon || item.categories?.icon === 'Tag'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                          <component v-else :is="item.categories.icon" class="w-4 h-4" />
                       </div>
                       <span class="text-xs font-black text-slate-800 dark:text-slate-200">{{ item.description || (item._isTransfer ? 'Transfer' : item.categories?.name) }}</span>
                    </div>
                    <span :class="getItemColorClass(item)" class="text-sm font-black tabular-nums">{{ getItemAmountPrefix(item) }}{{ item.amount.toLocaleString() }}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <!-- Sticky Footer / Pagination -->
      <div v-if="viewMode === 'list' && totalPages > 1" class="border-t border-slate-100 bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] dark:border-gray-800 dark:bg-gray-900 sm:p-6">
         <div class="flex items-center justify-between">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ $t('transactions.pagination_info', { current: currentPage, total: totalPages }) }}</span>
            <div class="flex space-x-2">
               <button @click="currentPage--" :disabled="currentPage === 1" class="px-5 py-2.5 bg-slate-50 dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all border border-slate-100 dark:border-gray-700">{{ $t('common.prev') }}</button>
               <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-5 py-2.5 bg-slate-50 dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all border border-slate-100 dark:border-gray-700">{{ $t('common.next') }}</button>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useTransferStore } from '../stores/useTransferStore'
import { useCurrency } from '../composables/useCurrency'

const { formatIDR } = useCurrency()
// Removed lucide-vue-next import

const props = defineProps({
  isOpen: Boolean,
  wallet: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const transactionStore = useTransactionStore()
const transferStore = useTransferStore()

const viewMode = ref('list')
const dataTypeFilter = ref('all')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 8

const currentMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const selectedDayTransactionsDate = ref(null)

const combinedHistory = computed(() => {
  if (!props.wallet) return []
  
  // Get Transactions
  let txs = transactionStore.transactions
    .filter(tx => tx.wallet_id === props.wallet.id)
    .map(tx => ({ ...tx, _isTransfer: false }))
    
  // Get Transfers
  let trs = transferStore.transfers
    .filter(tr => tr.from_wallet_id === props.wallet.id || tr.to_wallet_id === props.wallet.id)
    .map(tr => ({ ...tr, _isTransfer: true }))
    
  // Merge and apply data type filter
  let merged = []
  if (dataTypeFilter.value === 'all' || dataTypeFilter.value === 'tx') merged.push(...txs)
  if (dataTypeFilter.value === 'all' || dataTypeFilter.value === 'tr') merged.push(...trs)
  
  // Apply date filters
  if (startDate.value) {
    const start = new Date(startDate.value)
    merged = merged.filter(item => new Date(item.created_at) >= start)
  }
  if (endDate.value) {
    const end = new Date(endDate.value + 'T23:59:59')
    merged = merged.filter(item => new Date(item.created_at) <= end)
  }
  
  return merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const totalPages = computed(() => Math.ceil(combinedHistory.value.length / itemsPerPage))
const paginatedHistory = computed(() => combinedHistory.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))

const getItemColorClass = (item) => {
  if (item._isTransfer) {
    return item.from_wallet_id === props.wallet.id ? 'text-slate-900 dark:text-white' : 'text-emerald-500'
  }
  return item.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
}

const getItemAmountPrefix = (item) => {
  if (item._isTransfer) {
    return item.from_wallet_id === props.wallet.id ? '-' : '+'
  }
  return item.type === 'INCOME' ? '+' : '-'
}

// Calendar Logic
const currentMonthName = computed(() => {
  return currentMonth.value.toLocaleDateString(locale.value === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })
})

const prevMonth = () => { currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1) }
const nextMonth = () => { currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1) }

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
  
  const today = new Date()
  for (let i = 1; i <= lastDay.getDate(); i++) {
     const date = new Date(year, month, i)
     const isToday = date.toDateString() === today.toDateString()
     
     // Calculate summaries for this day
     const dayHistory = combinedHistory.value.filter(item => {
        const itemDate = new Date(item.created_at)
        return itemDate.getFullYear() === year && itemDate.getMonth() === month && itemDate.getDate() === i
     })
     
     const summary = dayHistory.length > 0 ? {
        income: dayHistory.reduce((sum, item) => {
           if (item._isTransfer) return sum + (item.to_wallet_id === props.wallet.id ? Number(item.amount) : 0)
           return sum + (item.type === 'INCOME' ? Number(item.amount) : 0)
        }, 0),
        expense: dayHistory.reduce((sum, item) => {
           if (item._isTransfer) return sum + (item.from_wallet_id === props.wallet.id ? Number(item.amount) : 0)
           return sum + (item.type === 'EXPENSE' ? Number(item.amount) : 0)
        }, 0),
        transferCount: dayHistory.filter(i => i._isTransfer).length
     } : null
     
     days.push({ day: i, current: true, date, isToday, summary })
  }
  
  const totalDays = 42
  const remaining = totalDays - days.length
  for (let i = 1; i <= remaining; i++) {
     days.push({ day: i, current: false, date: new Date(year, month + 1, i) })
  }
  
  return days
})

const selectedDayHistory = computed(() => {
  if (!selectedDayTransactionsDate.value) return []
  const d = selectedDayTransactionsDate.value
  return combinedHistory.value.filter(item => {
    const itemDate = new Date(item.created_at)
    return itemDate.getFullYear() === d.getFullYear() && itemDate.getMonth() === d.getMonth() && itemDate.getDate() === d.getDate()
  })
})

const formattedSelectedDate = computed(() => {
  if (!selectedDayTransactionsDate.value) return ''
  return selectedDayTransactionsDate.value.toLocaleDateString(locale.value === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })
})

const selectCalendarDay = (date) => {
  selectedDayTransactionsDate.value = date
}

const close = () => {
  emit('close')
}

// Reset pagination when filters change
watch([dataTypeFilter, startDate, endDate], () => {
  currentPage.value = 1
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    currentPage.value = 1
    selectedDayTransactionsDate.value = null
  }
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 10px; }
</style>
