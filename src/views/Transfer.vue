<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 pb-32">
    <div class="mb-10">
      <h2 class="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">Transfer</h2>
      <p class="mt-2 text-gray-500 dark:text-gray-400 font-medium tracking-tight">Move funds between your wallets instantly.</p>
    </div>

    <!-- Error message -->
    <div v-if="transferStore.error" class="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-3xl p-4 flex items-center text-red-700 dark:text-red-400">
      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <p class="text-sm font-bold">{{ transferStore.error }}</p>
    </div>

    <!-- Transfer Form Card -->
    <div class="premium-card p-10 mb-16 relative overflow-hidden">
      <!-- Decorative element -->
      <div class="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full opacity-50 blur-3xl"></div>
      
      <div v-if="walletStore.wallets.length < 2" class="mb-10 p-6 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-[2rem] border border-orange-100 dark:border-orange-900 text-sm font-black uppercase tracking-widest relative z-10 flex items-center">
        <svg class="w-6 h-6 mr-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <span>Insufficient Wallets. <router-link to="/wallet" class="underline ml-2">Add another wallet &rarr;</router-link></span>
      </div>

      <form @submit.prevent="submitTransfer" class="relative z-10 space-y-10">
        <div class="grid grid-cols-1 md:grid-cols-7 gap-8 items-center">
          <div class="md:col-span-3">
             <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-2">From</label>
             <select v-model="fromWallet" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-3xl px-8 py-6 focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-black transition-all appearance-none cursor-pointer">
                <option disabled value="">Source Wallet</option>
                <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id" :disabled="w.id === toWallet">
                   {{ w.name }} (Rp {{ w.balance.toLocaleString('id-ID') }})
                </option>
             </select>
          </div>

          <div class="md:col-span-1 flex justify-center">
             <div class="w-16 h-16 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm rotate-90 md:rotate-0 border border-indigo-100/50 dark:border-indigo-900/50">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
             </div>
          </div>

          <div class="md:col-span-3">
             <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-2">To</label>
             <select v-model="toWallet" required class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-3xl px-8 py-6 focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-black transition-all appearance-none cursor-pointer">
                <option disabled value="">Destination Wallet</option>
                <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id" :disabled="w.id === fromWallet">
                   {{ w.name }} (Rp {{ w.balance.toLocaleString('id-ID') }})
                </option>
             </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div>
              <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-2">Execution Amount</label>
              <div class="relative group">
                 <span class="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">Rp</span>
                 <input v-model.number="amount" type="number" required min="1" placeholder="0" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-3xl pl-16 pr-8 py-6 focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-black text-2xl transition-all tabular-nums">
              </div>
           </div>
           <div>
              <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-2">Reference Note</label>
              <input v-model="description" type="text" placeholder="Internal movement" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-3xl px-8 py-6 focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-black transition-all">
           </div>
        </div>

        <button type="submit" :disabled="transferStore.loading || walletStore.wallets.length < 2" class="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-50 mt-6 flex items-center justify-center space-x-4">
          <span class="text-lg tracking-tight">{{ transferStore.loading ? 'Executing Transfer...' : 'Commit Transfer' }}</span>
          <svg v-if="!transferStore.loading" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
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

    <!-- History Container -->
    <div class="space-y-12">
      <div v-if="transferStore.loading && transferStore.transfers.length === 0" class="flex justify-center py-24">
         <div class="w-14 h-14 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="filteredTransfers.length === 0" class="py-24 text-center premium-card !rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-gray-800">
         <p class="text-slate-400 font-black uppercase tracking-widest">No fund movements match your filter.</p>
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
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Movement</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                     <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-slate-50 dark:divide-gray-800/50">
                  <tr v-for="tx in paginatedTransfers" :key="tx.id" class="group hover:bg-slate-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                     <td class="p-6 py-5">
                        <span class="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{{ new Date(tx.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: '2-digit'}) }}</span>
                     </td>
                     <td class="p-6 py-5">
                        <p class="text-sm font-bold text-slate-600 dark:text-gray-300 truncate max-w-xs">{{ tx.description || 'Internal Transfer' }}</p>
                     </td>
                     <td class="p-6 py-5">
                        <div class="flex items-center space-x-2">
                           <span class="px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">{{ tx.from_wallet?.name }}</span>
                           <svg class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                           <span class="px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">{{ tx.to_wallet?.name }}</span>
                        </div>
                     </td>
                     <td class="p-6 py-5 text-right font-black tabular-nums tracking-tighter text-slate-900 dark:text-white">
                        {{ tx.amount.toLocaleString('id-ID') }}
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
               Showing {{ (currentPage-1)*itemsPerPage + 1 }}-{{ Math.min(currentPage*itemsPerPage, filteredTransfers.length) }} of {{ filteredTransfers.length }}
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
             
             <div v-if="transfersByDate[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`]" class="mt-4 space-y-1.5 overflow-y-auto max-h-[120px] pr-1 custom-scrollbar">
                <div v-for="tx in transfersByDate[`${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`]" :key="tx.id" 
                     class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-lg flex flex-col space-y-0.5 border border-indigo-100/50 dark:border-indigo-800/30">
                   <div class="flex items-center justify-between text-[7px] font-black uppercase tracking-tighter opacity-70">
                      <span>{{ tx.from_wallet?.name }}</span>
                      <span class="mx-1">&rarr;</span>
                      <span>{{ tx.to_wallet?.name }}</span>
                   </div>
                   <span class="text-[8px] font-black tabular-nums tracking-tighter">{{ (tx.amount / 1000).toFixed(0) }}k</span>
                </div>
             </div>
           </div>
         </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showModal = false"></div>
       <div class="premium-card !p-0 w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-300 overflow-hidden shadow-2xl border-t-8 border-indigo-600">
          <div class="p-8 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
             <div>
                <h3 class="text-xl font-black dark:text-white tracking-tight">{{ selectedDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</h3>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Movement Logs</p>
             </div>
             <button @click="showModal = false" class="p-3 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-2xl transition-all">
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
             </button>
          </div>
          <div class="max-h-[450px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
             <div v-for="tx in selectedTransfers" :key="tx.id" 
                  class="p-5 rounded-3xl bg-slate-50 dark:bg-gray-800/50 border border-transparent hover:border-slate-100 dark:hover:border-gray-700 transition-all">
                <div class="flex items-center justify-between mb-3">
                   <div class="flex items-center space-x-2">
                      <span class="px-3 py-1 bg-white dark:bg-gray-900 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm">{{ tx.from_wallet?.name }}</span>
                      <svg class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      <span class="px-3 py-1 bg-white dark:bg-gray-900 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm">{{ tx.to_wallet?.name }}</span>
                   </div>
                   <p class="font-black tabular-nums tracking-tighter text-slate-900 dark:text-white">
                      {{ tx.amount.toLocaleString('id-ID') }}
                   </p>
                </div>
                <div class="flex items-center justify-between">
                   <p class="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">{{ tx.description || 'System Transfer' }}</p>
                   <span class="text-[7px] font-black uppercase tracking-widest text-indigo-500 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">Internal</span>
                </div>
             </div>
             <div v-if="selectedTransfers.length === 0" class="py-12 text-center">
                <p class="text-slate-400 font-black uppercase tracking-widest text-[10px]">No logs for this date</p>
             </div>
          </div>
          <div class="p-6 bg-slate-50/50 dark:bg-gray-900/50 text-right border-t border-slate-50 dark:border-gray-800">
             <button @click="showModal = false" class="px-8 py-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all shadow-sm">Dismiss</button>
          </div>
       </div>
    </div>
    <!-- New Edit Modal -->
    <TransferFormModal 
      :is-open="showEditModal" 
      :initial-data="editingTransfer"
      @close="closeEditModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '../stores/useWalletStore'
import { useTransferStore } from '../stores/useTransferStore'
import TransferFormModal from '../components/TransferFormModal.vue'

const walletStore = useWalletStore()
const transferStore = useTransferStore()

const fromWallet = ref('')
const toWallet = ref('')
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
  await walletStore.fetchWallets()
  await transferStore.fetchTransfers()
})

const filteredTransfers = computed(() => {
  let list = [...transferStore.transfers]
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

const totalPages = computed(() => Math.ceil(filteredTransfers.value.length / itemsPerPage.value))

const paginatedTransfers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTransfers.value.slice(start, end)
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

const transfersByDate = computed(() => {
    const map = {}
    transferStore.transfers.forEach(tx => {
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
const showModal = ref(false)
const showEditModal = ref(false)
const selectedDate = ref(null)
const editingTransfer = ref(null)
const selectedTransfers = computed(() => {
  if (!selectedDate.value) return []
  const d = selectedDate.value
  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  return transferStore.transfers.filter(tx => {
    const txDate = new Date(tx.created_at)
    return `${txDate.getFullYear()}-${txDate.getMonth()}-${txDate.getDate()}` === key
  })
})

const openDetails = (date) => {
  selectedDate.value = date
  showModal.value = true
}

const openEdit = (transfer) => {
  editingTransfer.value = transfer
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingTransfer.value = null
}

const confirmDelete = async (transfer) => {
  if (!confirm('Are you sure you want to delete this transfer? Source balance will be refunded and destination balance will be deducted.')) return
  const success = await transferStore.deleteTransfer(transfer.id)
  if (success) {
    handleSuccess()
  }
}

const handleSuccess = async () => {
  await Promise.all([walletStore.fetchWallets(), transferStore.fetchTransfers()])
}

const submitTransfer = async () => {
  if (!fromWallet.value || !toWallet.value || !amount.value) return
  const success = await transferStore.addTransfer(fromWallet.value, toWallet.value, amount.value, description.value)
  if (success) {
    fromWallet.value = ''
    toWallet.value = ''
    amount.value = null
    description.value = ''
    await handleSuccess()
  }
}
</script>
