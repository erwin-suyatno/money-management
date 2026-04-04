<template>
  <div v-if="isOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="close"></div>
    
    <!-- Modal Content -->
    <div class="premium-card !p-0 w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-300 overflow-hidden shadow-2xl border-t-8 border-blue-600">
      <!-- Header -->
      <div class="p-8 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
        <div>
          <h3 class="text-xl font-black dark:text-white tracking-tight">{{ isEdit ? 'Edit Transaction' : 'Post Transaction' }}</h3>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{{ isEdit ? 'Update Details' : 'Contextual Recording' }}</p>
        </div>
        <button @click="close" class="p-3 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-2xl transition-all">
          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
        <!-- Date Display (Read-only or editable) -->
        <div class="flex items-center justify-between bg-slate-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-slate-100 dark:border-gray-800">
           <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div>
                 <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</p>
                 <p class="text-sm font-black text-slate-900 dark:text-white capitalize">{{ formattedDate }}</p>
              </div>
           </div>
           <!-- Optional: Add a button to change date if needed -->
        </div>

        <!-- Type Toggle -->
        <div class="flex p-1.5 bg-slate-100 dark:bg-gray-900 rounded-[2rem] shadow-inner">
          <button type="button" @click="txType = 'EXPENSE'" 
                  :class="txType === 'EXPENSE' ? 'bg-white dark:bg-gray-800 text-rose-600 shadow-xl scale-[1.02]' : 'text-slate-400'" 
                  class="flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all">
            Expense
          </button>
          <button type="button" @click="txType = 'INCOME'" 
                  :class="txType === 'INCOME' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-xl scale-[1.02]' : 'text-slate-400'" 
                  class="flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all">
            Income
          </button>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <!-- Wallet Selection -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Source Wallet</label>
            <select v-model="selectedWallet" required 
                    class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold transition-all appearance-none cursor-pointer">
              <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
            </select>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Amount (IDR)</label>
            <div class="relative group">
              <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within:text-blue-500 transition-colors">Rp</span>
              <input v-model.number="amount" type="number" required min="1" placeholder="0" 
                     class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/20 rounded-3xl pl-14 pr-6 py-5 focus:ring-0 dark:text-white font-black transition-all tabular-nums text-xl tracking-tighter">
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Note (Optional)</label>
            <input v-model="description" type="text" placeholder="What was this for?" 
                   class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold transition-all">
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex flex-col space-y-3">
          <button type="submit" 
                  :disabled="transactionStore.loading || walletStore.wallets.length === 0" 
                  class="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3">
             <span v-if="transactionStore.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
             <span>{{ transactionStore.loading ? 'Saving...' : (isEdit ? 'Update Transaction' : 'Commit Transaction') }}</span>
          </button>

          <button v-if="isEdit" type="button" @click="handleDelete" 
                  :disabled="transactionStore.loading"
                  class="w-full py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition disabled:opacity-50">
            Delete Transaction
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWalletStore } from '../stores/useWalletStore'
import { useTransactionStore } from '../stores/useTransactionStore'

const props = defineProps({
  isOpen: Boolean,
  date: {
    type: Date,
    default: () => new Date()
  },
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const walletStore = useWalletStore()
const transactionStore = useTransactionStore()

const txType = ref('EXPENSE')
const selectedWallet = ref('')
const amount = ref(null)
const description = ref('')

const isEdit = computed(() => !!props.initialData)

const formattedDate = computed(() => {
  return props.date.toLocaleDateString('id-ID', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
})

// Initialize form
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (isEdit.value) {
      txType.value = props.initialData.type
      selectedWallet.value = props.initialData.wallet_id
      amount.value = props.initialData.amount
      description.value = props.initialData.description || ''
    } else {
      if (walletStore.wallets.length > 0 && !selectedWallet.value) {
        selectedWallet.value = walletStore.wallets[0].id
      }
      // Reset form
      amount.value = null
      description.value = ''
      txType.value = 'EXPENSE'
    }
  }
})

const close = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!selectedWallet.value || amount.value <= 0) return

  if (isEdit.value) {
    const success = await transactionStore.updateTransaction(props.initialData.id, {
      wallet_id: selectedWallet.value,
      type: txType.value,
      amount: amount.value,
      description: description.value
    })
    if (success) {
      emit('success')
      close()
    }
  } else {
    // Set the time to current time but on the selected date
    const now = new Date()
    const txDate = new Date(props.date)
    txDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds())

    const success = await transactionStore.addTransaction(
      selectedWallet.value,
      txType.value,
      amount.value,
      description.value,
      txDate.toISOString()
    )

    if (success) {
      emit('success')
      close()
    }
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone and will affect your wallet balance.')) return
  
  const success = await transactionStore.deleteTransaction(props.initialData.id)
  if (success) {
    emit('success')
    close()
  }
}
</script>
