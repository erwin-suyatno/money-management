<template>
  <div v-if="isOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="close"></div>
    
    <!-- Modal Content -->
    <div class="premium-card !p-0 w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-300 overflow-hidden shadow-2xl border-t-8 border-indigo-600">
      <!-- Header -->
      <div class="p-8 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
        <div>
          <h3 class="text-xl font-black dark:text-white tracking-tight">Edit Transfer</h3>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Movement Correction</p>
        </div>
        <button @click="close" class="p-3 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-2xl transition-all">
          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <!-- From Wallet -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">From</label>
            <select v-model="fromWalletId" required 
                    class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold transition-all appearance-none cursor-pointer">
              <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
            </select>
          </div>

          <!-- To Wallet -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">To</label>
            <select v-model="toWalletId" required 
                    class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold transition-all appearance-none cursor-pointer">
              <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
            </select>
          </div>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Amount (IDR)</label>
          <div class="relative group">
            <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within:text-indigo-500 transition-colors">Rp</span>
            <input v-model.number="amount" type="number" required min="1" placeholder="0" 
                   class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl pl-14 pr-6 py-5 focus:ring-0 dark:text-white font-black transition-all tabular-nums text-xl tracking-tighter">
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Note (Optional)</label>
          <input v-model="description" type="text" placeholder="Internal movement" 
                 class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold transition-all">
        </div>

        <!-- Actions -->
        <div class="pt-4 flex flex-col space-y-3">
          <button type="submit" 
                  :disabled="transferStore.loading" 
                  class="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3">
             <span v-if="transferStore.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
             <span>{{ transferStore.loading ? 'Updating...' : 'Update Transfer' }}</span>
          </button>

          <button type="button" @click="handleDelete" 
                  :disabled="transferStore.loading"
                  class="w-full py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition disabled:opacity-50">
            Delete Transfer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useWalletStore } from '../stores/useWalletStore'
import { useTransferStore } from '../stores/useTransferStore'

const props = defineProps({
  isOpen: Boolean,
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const walletStore = useWalletStore()
const transferStore = useTransferStore()

const fromWalletId = ref('')
const toWalletId = ref('')
const amount = ref(null)
const description = ref('')

// Initialize form
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.initialData) {
    fromWalletId.value = props.initialData.from_wallet_id
    toWalletId.value = props.initialData.to_wallet_id
    amount.value = props.initialData.amount
    description.value = props.initialData.description || ''
  }
})

const close = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!fromWalletId.value || !toWalletId.value || !amount.value) return
  if (fromWalletId.value === toWalletId.value) {
    alert("Source and destination wallets must be different.")
    return
  }

  const success = await transferStore.updateTransfer(props.initialData.id, {
    from_wallet_id: fromWalletId.value,
    to_wallet_id: toWalletId.value,
    amount: amount.value,
    description: description.value
  })

  if (success) {
    emit('success')
    close()
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this transfer? This will revert the movement and update both wallet balances.')) return
  
  const success = await transferStore.deleteTransfer(props.initialData.id)
  if (success) {
    emit('success')
    close()
  }
}
</script>
