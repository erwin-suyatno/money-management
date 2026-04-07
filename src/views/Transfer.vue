<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 pb-32">
    <!-- Skeleton Loading -->
    <div v-if="walletStore.loading && transfers.length === 0" class="animate-in fade-in duration-500">
       <div class="mb-12 space-y-4">
          <Skeleton width="400px" height="50px" />
          <Skeleton width="220px" height="20px" />
       </div>
       <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div class="lg:col-span-5">
             <Skeleton height="500px" />
          </div>
          <div class="lg:col-span-7 space-y-6">
             <Skeleton width="180px" height="30px" />
             <Skeleton v-for="i in 4" :key="i" height="100px" />
          </div>
       </div>
    </div>

    <!-- Main Content -->
    <template v-else>
      <div class="mb-12">
      <h1 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{{ $t('transfer.title') }}</h1>
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2 ml-1">V1.1.4 {{ $t('transfer.modal_subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- Left Column: Form -->
      <div class="lg:col-span-5">
        <div class="premium-card !p-0 overflow-hidden border-t-8 border-indigo-600 shadow-2xl">
          <div class="p-8 border-b border-slate-50 dark:border-gray-800">
             <h3 class="text-xl font-black dark:text-white tracking-tight">{{ $t('transfer.title') }}</h3>
          </div>
          
          <form @submit.prevent="handleSubmit" class="p-8 space-y-8">
             <div class="space-y-6">
                <!-- From-To Visual -->
                <div class="grid grid-cols-1 gap-4 relative">
                   <div class="space-y-3">
                      <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{{ $t('transfer.form_from') }}</label>
                      <select v-model="form.from_wallet_id" required class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold appearance-none cursor-pointer">
                         <option :value="null" disabled>{{ $t('transfer.form_from') }}</option>
                         <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">{{ w.name }} ({{ formatCurrency(w.balance) }})</option>
                      </select>
                   </div>
                   
                   <div class="flex justify-center -my-2 relative z-10">
                      <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                      </div>
                   </div>

                   <div class="space-y-3">
                      <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{{ $t('transfer.form_to') }}</label>
                      <select v-model="form.to_wallet_id" required class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold appearance-none cursor-pointer">
                         <option :value="null" disabled>{{ $t('transfer.form_to') }}</option>
                         <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">{{ w.name }} ({{ formatCurrency(w.balance) }})</option>
                      </select>
                   </div>
                </div>

                <!-- Amount -->
                <div class="space-y-3">
                   <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{{ $t('transfer.form_amount') }}</label>
                   <input v-model.number="form.amount" type="number" required class="w-full bg-slate-100 dark:bg-gray-850 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-8 py-6 focus:ring-0 dark:text-white text-3xl font-black tracking-tight transition-all">
                </div>

                <!-- Note -->
                <div class="space-y-3">
                   <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{{ $t('transfer.form_note') }}</label>
                   <textarea v-model="form.note" :placeholder="$t('transfer.form_note_placeholder')" class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold transition-all" rows="2"></textarea>
                </div>
             </div>

             <button type="submit" 
                     :disabled="loading" 
                     class="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-50">
                {{ loading ? $t('common.loading') : $t('transfer.title') }}
             </button>
          </form>
        </div>
      </div>

      <!-- Right Column: History -->
      <div class="lg:col-span-7 space-y-8">
        <h3 class="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center">
           <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
           {{ $t('transfer.history') }}
        </h3>
        
        <div class="space-y-4">
           <div v-for="t in transfers" :key="t.id" class="premium-card !p-6 flex items-center justify-between border-l-4 border-indigo-200">
              <div class="flex items-center space-x-6">
                 <div class="flex flex-col items-center">
                    <span class="text-xs font-black text-slate-900 dark:text-white">{{ t.from_wallet?.name }}</span>
                    <svg class="w-3 h-3 text-slate-300 my-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    <span class="text-xs font-black text-slate-900 dark:text-white">{{ t.to_wallet?.name }}</span>
                 </div>
                 <div class="h-10 w-px bg-slate-100 dark:bg-gray-800"></div>
                 <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ formatDate(t.created_at) }}</p>
                    <p v-if="t.description" class="text-xs font-bold text-slate-500 italic">{{ t.description }}</p>
                 </div>
              </div>
              <div class="text-right">
                 <p class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ formatCurrency(t.amount) }}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../services/supabase'
import { useWalletStore } from '../stores/useWalletStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useI18n } from 'vue-i18n'
import Skeleton from '../components/Skeleton.vue'

const { t, locale } = useI18n()
const walletStore = useWalletStore()
const authStore = useAuthStore()
const loading = ref(false)
const transfers = ref([])
const form = ref({
  from_wallet_id: null,
  to_wallet_id: null,
  amount: 0,
  note: ''
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat(locale.value === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString(locale.value === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchTransfers = async () => {
  const { data, error } = await supabase
    .from('transfers')
    .select(`
      *,
      from_wallet:wallets!transfers_from_wallet_id_fkey(name),
      to_wallet:wallets!transfers_to_wallet_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
  
  if (!error) transfers.value = data
}

const handleSubmit = async () => {
  if (form.value.from_wallet_id === form.value.to_wallet_id) {
    alert(t('transfer.error_same_wallet'))
    return
  }

  loading.value = true
  try {
    const { error } = await supabase
      .from('transfers')
      .insert([{
        from_wallet_id: form.value.from_wallet_id,
        to_wallet_id: form.value.to_wallet_id,
        amount: form.value.amount,
        description: form.value.note || null,
        created_by: authStore.user?.id
      }])

    if (error) throw error

    // Reset form
    form.value.amount = 0
    form.value.note = ''
    
    // Refresh data
    await walletStore.fetchWallets()
    await fetchTransfers()
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  walletStore.fetchWallets()
  fetchTransfers()
})
</script>
