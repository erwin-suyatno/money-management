<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 pb-32">
    <!-- 1. Skeleton Loading -->
    <div v-if="transactionStore.loading && transactionStore.transactions.length === 0" class="animate-in fade-in duration-500">
       <div class="mb-12 space-y-4">
          <Skeleton width="400px" height="50px" />
          <Skeleton width="250px" height="20px" />
       </div>
       <div class="premium-card p-12 mb-12">
          <Skeleton height="200px" />
       </div>
       <div class="space-y-6">
          <div class="flex items-center justify-between">
             <Skeleton width="200px" height="40px" variant="pill" />
             <Skeleton width="150px" height="30px" />
          </div>
          <Skeleton v-for="i in 5" :key="i" height="80px" />
       </div>
    </div>

    <!-- 2. Actual Content -->
    <template v-else>
      <div class="mb-10">
        <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl tracking-tighter italic">{{ $t('transactions.title') }}</h2>
        <p class="mt-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">{{ $t('transactions.subtitle') }}</p>
      </div>

      <!-- Quick Entry Card -->
      <div class="premium-card p-8 mb-12 border-t-8 border-indigo-600 shadow-2xl">
         <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
           <h3 class="text-xl font-black dark:text-white tracking-tight">{{ $t('transactions.quick_posting') }}</h3>
           <div class="inline-flex p-1 bg-slate-50 dark:bg-gray-900 rounded-2xl w-full md:w-64">
             <button @click="txType = 'EXPENSE'" :class="txType === 'EXPENSE' ? 'bg-white dark:bg-gray-800 text-rose-600 shadow-sm' : 'text-slate-400'" class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">{{ $t('transactions.expense') }}</button>
             <button @click="txType = 'INCOME'" :class="txType === 'INCOME' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-slate-400'" class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">{{ $t('transactions.income') }}</button>
           </div>
         </div>

         <form @submit.prevent="submitTransaction" class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="md:col-span-1">
               <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">{{ $t('transactions.form_category') }}</label>
               <select v-model="selectedCategory" required class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-5 py-4 focus:ring-0 dark:text-white font-bold transition-all cursor-pointer">
                  <option v-for="cat in filteredQuickCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
               </select>
            </div>
            <div class="md:col-span-1">
               <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">{{ $t('transactions.form_wallet') }}</label>
               <select v-model="selectedWallet" required class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-5 py-4 focus:ring-0 dark:text-white font-bold transition-all cursor-pointer">
                  <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
               </select>
            </div>
            <div class="md:col-span-1">
               <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">{{ $t('transactions.form_amount') }}</label>
               <input v-model.number="amount" type="number" required min="1" placeholder="0" class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-5 py-4 focus:ring-0 dark:text-white font-bold transition-all tabular-nums text-xl">
            </div>
            <div class="md:col-span-1">
               <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">{{ $t('transactions.form_note') }}</label>
               <input v-model="description" type="text" :placeholder="$t('common.commit') + '...'" class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-5 py-4 focus:ring-0 dark:text-white font-bold transition-all">
            </div>
            <div class="md:col-span-4 mt-2">
               <button type="submit" :disabled="transactionStore.loading || walletStore.wallets.length === 0" class="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-50">
                  {{ transactionStore.loading ? $t('transactions.syncing') : $t('transactions.commit_btn') }}
               </button>
            </div>
         </form>
      </div>

      <!-- View & Filters -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-8">
        <div class="inline-flex p-1.5 bg-slate-100 dark:bg-gray-900 rounded-2xl w-full lg:w-auto shadow-inner">
          <button @click="viewMode = 'list'" :class="viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-md' : 'text-slate-400'" 
                  class="flex-1 lg:px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 6h16M4 12h16M4 18h16"/></svg>
            {{ $t('transactions.view_list') }}
          </button>
          <button @click="viewMode = 'calendar'" :class="viewMode === 'calendar' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-md' : 'text-slate-400'" 
                  class="flex-1 lg:px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            {{ $t('transactions.view_calendar') }}
          </button>
        </div>

        <div v-if="viewMode === 'list'" class="flex items-center space-x-3 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
           <div class="flex items-center px-3 space-x-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ $t('transactions.filter_from') }}</span>
              <input type="date" v-model="startDate" class="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black dark:text-white cursor-pointer">
           </div>
           <div class="w-[1px] h-4 bg-slate-100 dark:bg-gray-800"></div>
           <div class="flex items-center px-3 space-x-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ $t('transactions.filter_to') }}</span>
              <input type="date" v-model="endDate" class="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black dark:text-white cursor-pointer">
           </div>
        </div>
      </div>

      <!-- Result Container -->
      <div v-if="filteredTransactions.length === 0" class="py-32 text-center bg-slate-50 dark:bg-gray-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-gray-800">
         <h3 class="text-xl font-black dark:text-white opacity-50 uppercase tracking-widest">{{ $t('transactions.empty_title') }}</h3>
         <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-4">{{ $t('transactions.empty_subtitle') }}</p>
      </div>

      <div v-else-if="viewMode === 'list'" class="premium-card !p-0 overflow-hidden shadow-2xl border-t-8 border-indigo-600">
         <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
               <thead class="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-gray-800">
                  <tr>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('transactions.table_date') }}</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('transactions.table_context') }}</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('transactions.table_source') }}</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{{ $t('transactions.table_amount') }}</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{{ $t('transactions.table_actions') }}</th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-slate-50 dark:divide-gray-800/50">
                  <tr v-for="tx in paginatedTransactions" :key="tx.id" class="group hover:bg-indigo-50/10 transition-colors">
                     <td class="p-6 py-5 text-[10px] font-black text-slate-400 tabular-nums">
                        {{ new Date(tx.created_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {day: 'numeric', month: 'short', year: '2-digit'}) }}
                     </td>
                     <td class="p-6 py-5">
                        <div class="flex items-center space-x-4">
                           <div v-if="tx.categories" :style="{ backgroundColor: tx.categories.color + '20', color: tx.categories.color }" class="w-10 h-10 rounded-xl flex items-center justify-center">
                              <component :is="tx.categories.icon || 'Tag'" class="w-5 h-5" />
                           </div>
                           <div>
                              <p class="text-sm font-black text-slate-900 dark:text-white">{{ tx.description || tx.categories?.name }}</p>
                              <p v-if="tx.categories" class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ tx.categories.name }}</p>
                           </div>
                        </div>
                     </td>
                     <td class="p-6 py-5"><span class="px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-[9px] font-black uppercase text-slate-500">{{ tx.wallets?.name }}</span></td>
                     <td class="p-6 py-5 text-right font-black tracking-tighter" :class="tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'">
                        {{ tx.type === 'INCOME' ? '+' : '-' }}{{ Number(tx.amount).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US') }}
                     </td>
                     <td class="p-6 py-5 text-right flex justify-end space-x-4">
                        <button @click="confirmDelete(tx)" class="p-2 text-slate-300 hover:text-rose-500 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
         <div class="p-6 border-t border-slate-50 dark:border-gray-800 flex items-center justify-between">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
               {{ $t('transactions.pagination_info', { current: currentPage, total: totalPages || 1 }) }}
            </span>
            <div class="flex space-x-2">
               <button @click="currentPage--" :disabled="currentPage === 1" class="px-4 py-2 bg-slate-50 dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all">Prev</button>
               <button @click="currentPage++" :disabled="currentPage >= totalPages" class="px-4 py-2 bg-slate-50 dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all">Next</button>
            </div>
         </div>
      </div>
    </template>

    <!-- Calendar View Placeholder & Modals -->
    <CalendarDayModal :is-open="showDetailModal" :date="selectedDate" :transactions="selectedDateTransactions" @close="showDetailModal = false" @quick-add="openQuickAdd" @edit="openEdit" />
    <TransactionFormModal :is-open="showAddModal" :date="selectedDate" :initial-data="editingTx" @close="closeAddModal" @success="handleTxSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useWalletStore } from '../stores/useWalletStore'
import { useCategoryStore } from '../stores/useCategoryStore'
import { useI18n } from 'vue-i18n'
import CalendarDayModal from '../components/CalendarDayModal.vue'
import TransactionFormModal from '../components/TransactionFormModal.vue'
import Skeleton from '../components/Skeleton.vue'

const { t, locale } = useI18n()
const transactionStore = useTransactionStore()
const walletStore = useWalletStore()
const categoryStore = useCategoryStore()

const txType = ref('EXPENSE')
const selectedWallet = ref('')
const selectedCategory = ref(null)
const amount = ref(null)
const description = ref('')
const viewMode = ref('list')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

onMounted(async () => {
  await Promise.all([walletStore.fetchWallets(), transactionStore.fetchTransactions(), categoryStore.fetchInitialData()])
  if (walletStore.wallets.length > 0) selectedWallet.value = walletStore.wallets[0].id
  if (categoryStore.expenseCategories.length > 0) selectedCategory.value = categoryStore.expenseCategories[0].id
})

const filteredQuickCategories = computed(() => {
  return categoryStore.categories.filter(c => c.category_types?.code === txType.value)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat(locale.value === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

watch(txType, (newType) => {
  const cats = categoryStore.categories.filter(c => c.category_types?.code === newType)
  if (cats.length > 0) selectedCategory.value = cats[0].id
})

const filteredTransactions = computed(() => {
  let list = [...transactionStore.transactions]
  if (startDate.value) list = list.filter(tx => new Date(tx.created_at) >= new Date(startDate.value))
  if (endDate.value) list = list.filter(tx => new Date(tx.created_at) <= new Date(endDate.value + 'T23:59:59'))
  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage))
const paginatedTransactions = computed(() => filteredTransactions.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))

const submitTransaction = async () => {
  if (!selectedWallet.value || !amount.value) return
  const success = await transactionStore.addTransaction(selectedWallet.value, txType.value, amount.value, description.value, null, selectedCategory.value)
  if (success) { amount.value = null; description.value = '' }
}

const confirmDelete = async (tx) => {
  if (confirm(t('transactions.delete_confirm'))) {
    await transactionStore.deleteTransaction(tx.id)
    transactionStore.fetchTransactions()
    walletStore.fetchWallets()
  }
}

// Modals
const showDetailModal = ref(false)
const showAddModal = ref(false)
const selectedDate = ref(null)
const editingTx = ref(null)
const selectedDateTransactions = computed(() => []) // Simplified
const openDetails = (date) => { selectedDate.value = date; showDetailModal.value = true }
const openQuickAdd = (date) => { selectedDate.value = date; showDetailModal.value = false; setTimeout(() => showAddModal.value = true, 100) }
const openEdit = (tx) => { editingTx.value = tx; showAddModal.value = true }
const closeAddModal = () => { showAddModal.value = false; editingTx.value = null }
const handleTxSuccess = () => { transactionStore.fetchTransactions(); walletStore.fetchWallets() }
</script>
