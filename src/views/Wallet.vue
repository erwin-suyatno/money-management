<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 pb-32">
    <!-- Skeleton Loading -->
    <div v-if="walletStore.loading && walletStore.wallets.length === 0" class="animate-in fade-in duration-500">
       <div class="mb-12 flex items-center justify-between">
          <div class="space-y-4">
             <Skeleton width="300px" height="50px" />
             <Skeleton width="150px" height="20px" />
          </div>
          <Skeleton width="180px" height="60px" variant="pill" />
       </div>
       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Skeleton v-for="i in 3" :key="i" height="240px" />
       </div>
    </div>

    <!-- Main Content -->
    <template v-else>
      <div class="mb-12 flex items-center justify-between">
      <div>
        <h1 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{{ $t('wallets.title') }}</h1>
        <p class="text-xs sm:text-sm font-bold text-slate-400 mt-2 uppercase tracking-[0.3em] ml-1">{{ $t('wallets.balance') }}: {{ formatCurrency(totalBalance) }}</p>
      </div>
      <button @click="showModal = true" class="px-8 py-5 bg-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95 flex items-center space-x-3">
         <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
         <span class="hidden sm:inline">{{ $t('wallets.add') }}</span>
      </button>
    </div>

    <!-- Error message -->
    <div v-if="walletStore.error" class="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-2xl p-4 flex items-center text-red-700 dark:text-red-400">
      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </div>

    <!-- Wallet Grid -->
    <div v-else class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="(wallet, idx) in walletStore.wallets" :key="wallet.id" 
           :class="[
             idx % 3 === 0 ? 'bg-indigo-600' : 
             idx % 3 === 1 ? 'bg-emerald-600' : 'bg-slate-900'
           ]"
           class="rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl transition-all hover:-translate-y-2 hover:shadow-indigo-500/10 min-h-[240px] flex flex-col justify-between text-white border-b-4 border-black/10">
        
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-20 pointer-events-none">
           <svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="white" stroke-width="0.5" />
              <path d="M0,60 Q25,40 50,60 T100,60" fill="none" stroke="white" stroke-width="0.5" />
              <path d="M0,70 Q25,50 50,70 T100,70" fill="none" stroke="white" stroke-width="0.5" />
           </svg>
        </div>
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>

        <div class="relative z-10">
          <div class="flex justify-between items-start mb-8">
            <div class="flex flex-col">
              <span class="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">{{ $t('wallets.provider') }}</span>
              <h3 class="text-xl font-black italic tracking-tighter">{{ wallet.name.split(' ')[0] || 'BANK' }}</h3>
            </div>
            <div class="flex flex-col items-end">
               <button @click="deleteWallet(wallet.id)" class="p-2 text-white/40 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </div>
          </div>
          <div class="mt-2">
            <p class="text-xs font-mono tracking-[0.3em] opacity-40 mb-1">**** **** **** 0781</p>
            <p class="text-[8px] font-black uppercase tracking-widest opacity-60">Expires 09 / 28</p>
          </div>
        </div>
        
        <div class="relative z-10 flex items-end justify-between">
          <div class="flex flex-col">
            <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{{ $t('wallets.available_balance') }}</span>
            <div class="flex items-baseline space-x-1">
               <span class="text-sm font-medium opacity-60">Rp</span>
               <p class="text-3xl font-black tracking-tighter tabular-nums drop-shadow-md">
                 {{ wallet.balance.toLocaleString($i18n.locale === 'id' ? 'id-ID' : 'en-US') }}
               </p>
            </div>
          </div>
          <div class="font-black italic text-lg opacity-40 group-hover:opacity-80 transition-opacity">VISA</div>
        </div>
      </div>

      <!-- Empty State Card -->
      <div v-if="walletStore.wallets.length === 0" class="col-span-full py-24 px-4 text-center glass-card rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-gray-700">
         <div class="w-20 h-20 bg-slate-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
            <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
         </div>
         <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">{{ $t('wallets.empty_title') }}</h3>
         <p class="text-slate-500 dark:text-gray-400 max-w-sm mx-auto mb-10 text-lg leading-relaxed font-medium">{{ $t('wallets.empty_subtitle') }}</p>
         <button @click="showModal = true" class="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95">{{ $t('wallets.btn_create') }} &rarr;</button>
      </div>
    </div>

    <!-- Create Wallet Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[100] overflow-y-auto px-4 py-6 sm:p-0 flex items-center justify-center">
      <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="showModal = false"></div>
      
      <div class="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl transform transition-all sm:max-w-md w-full p-8 relative z-10">
        <div class="mb-8">
          <div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <h3 class="text-2xl font-black text-gray-900 dark:text-white">{{ $t('wallets.modal_title') }}</h3>
          <p class="text-gray-500 dark:text-gray-400 font-medium">{{ $t('wallets.modal_subtitle') }}</p>
        </div>

        <div class="space-y-5">
           <div>
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{{ $t('wallets.form_name') }}</label>
              <input v-model="newWalletName" type="text" placeholder="e.g. BCA Savings" class="w-full bg-gray-50 dark:bg-gray-750 border-none rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 dark:text-white placeholder-gray-400 font-bold transition-all">
           </div>
           <div>
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{{ $t('wallets.form_balance') }}</label>
              <div class="relative">
                 <span class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                 <input v-model.number="newWalletBalance" type="number" class="w-full bg-gray-50 dark:bg-gray-750 border-none rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-blue-500/10 dark:text-white placeholder-gray-400 font-bold transition-all tabular-nums">
              </div>
           </div>
        </div>

        <div class="mt-10 flex flex-col space-y-3">
          <button @click="submitWallet" :disabled="walletStore.loading || !newWalletName" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-95 disabled:opacity-50">
            {{ walletStore.loading ? $t('wallets.creating') : $t('wallets.btn_create') }}
          </button>
          <button @click="showModal = false" class="w-full py-4 text-gray-500 font-bold hover:text-gray-900 dark:hover:text-white transition">
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '../stores/useWalletStore'
import Skeleton from '../components/Skeleton.vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const walletStore = useWalletStore()
const showModal = ref(false)
const newWalletName = ref('')
const newWalletBalance = ref(0)
const selectedColor = ref('#4F46E5')
const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6']

onMounted(() => {
  walletStore.fetchWallets()
})

const totalBalance = computed(() => {
  return walletStore.wallets.reduce((sum, w) => sum + Number(w.balance), 0)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat(locale.value === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const submitWallet = async () => {
  if (!newWalletName.value) return;
  
  const success = await walletStore.createWallet(newWalletName.value, newWalletBalance.value)
  if (success) {
    showModal.value = false
    newWalletName.value = ''
    newWalletBalance.value = 0
  }
}

const deleteWallet = async (id) => {
  if (confirm(t('wallets.delete_confirm'))) {
    await walletStore.deleteWallet(id)
  }
}
</script>
