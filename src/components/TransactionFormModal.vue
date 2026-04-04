<template>
  <div v-if="isOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="close"></div>
    
    <!-- Modal Content -->
    <div class="premium-card !p-0 w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-300 overflow-hidden shadow-2xl border-t-8 border-blue-600">
      <!-- Header -->
      <div class="p-8 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
        <div>
          <h3 class="text-xl font-black dark:text-white tracking-tight">{{ isEdit ? $t('transactions.edit_title') : $t('transactions.post_title') }}</h3>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{{ isEdit ? $t('transactions.update_subtitle') : $t('transactions.post_subtitle') }}</p>
        </div>
        <button @click="close" class="p-3 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-2xl transition-all">
          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
        <!-- Date Display -->
        <div class="flex items-center justify-between bg-slate-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-slate-100 dark:border-gray-800">
           <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div>
                 <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ $t('transactions.form_date') }}</p>
                 <p class="text-sm font-black text-slate-900 dark:text-white capitalize">{{ formattedDate }}</p>
              </div>
           </div>
        </div>

        <!-- Type Toggle -->
        <div class="flex p-1.5 bg-slate-100 dark:bg-gray-900 rounded-[2rem] shadow-inner">
          <button v-for="type in categoryStore.types" :key="type.code"
                  type="button" @click="txType = type.code" 
                  :class="txType === type.code ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-xl scale-[1.02]' : 'text-slate-400'" 
                  class="flex-1 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all">
            {{ type.name === 'Income' ? $t('transactions.income') : $t('transactions.expense') }}
          </button>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <!-- Category Selection -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">{{ $t('transactions.form_category') }}</label>
            <div class="grid grid-cols-4 gap-3">
              <button v-for="cat in filteredCategories" :key="cat.id"
                      type="button"
                      @click="selectedCategory = cat.id"
                      :class="selectedCategory === cat.id ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'bg-slate-50 dark:bg-gray-900'"
                      class="p-4 rounded-3xl transition-all flex flex-col items-center justify-center space-y-2 group">
                 <div :style="{ backgroundColor: selectedCategory === cat.id ? cat.color : '#94a3b8' }" 
                      class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform group-active:scale-90">
                    <component :is="cat.icon || 'tag'" class="w-5 h-5" />
                 </div>
                 <span class="text-[9px] font-black uppercase tracking-tighter truncate w-full text-center">{{ cat.name }}</span>
              </button>
            </div>
            <p v-if="filteredCategories.length === 0" class="text-center py-4 text-[10px] font-bold text-slate-400 italic">{{ $t('transactions.empty_categories') }}</p>
          </div>

          <!-- Wallet Selection -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">{{ $t('transactions.form_wallet') }}</label>
            <select v-model="selectedWallet" required 
                    class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold transition-all appearance-none cursor-pointer">
              <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">{{ w.name }} (Rp {{ w.balance.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US') }})</option>
            </select>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">{{ $t('transactions.form_amount') }}</label>
            <div class="relative group">
              <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within:text-blue-500 transition-colors">Rp</span>
              <input v-model.number="amount" type="number" required min="1" placeholder="0" 
                     class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/20 rounded-3xl pl-14 pr-6 py-5 focus:ring-0 dark:text-white font-black transition-all tabular-nums text-xl tracking-tighter">
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">{{ $t('transactions.form_note') }}</label>
            <input v-model="description" type="text" :placeholder="$t('transactions.form_note_placeholder')" 
                   class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold transition-all">
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex flex-col space-y-3">
          <button type="submit" 
                  :disabled="transactionStore.loading || walletStore.wallets.length === 0" 
                  class="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3">
             <span v-if="transactionStore.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
             <span>{{ transactionStore.loading ? $t('transactions.saving') : (isEdit ? $t('transactions.update_btn') : $t('transactions.commit_btn')) }}</span>
          </button>

          <button v-if="isEdit" type="button" @click="handleDelete" 
                  :disabled="transactionStore.loading"
                  class="w-full py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition disabled:opacity-50">
            {{ $t('transactions.delete_btn') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useWalletStore } from '../stores/useWalletStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useCategoryStore } from '../stores/useCategoryStore'
import { useI18n } from 'vue-i18n'

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

const { t, locale } = useI18n()
const walletStore = useWalletStore()
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()

const txType = ref('EXPENSE')
const selectedWallet = ref('')
const selectedCategory = ref(null)
const amount = ref(null)
const description = ref('')

const isEdit = computed(() => !!props.initialData)

const filteredCategories = computed(() => {
  return categoryStore.categories.filter(c => c.category_types?.code === txType.value)
})

const formattedDate = computed(() => {
  return props.date.toLocaleDateString(locale.value === 'id' ? 'id-ID' : 'en-US', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
})

// Reset category when type changes
watch(txType, (newType) => {
  const cats = categoryStore.categories.filter(c => c.category_types?.code === newType)
  if (cats.length > 0) {
    selectedCategory.value = cats[0].id
  } else {
    selectedCategory.value = null
  }
})

// Initialize form
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    if (categoryStore.categories.length === 0) {
      await categoryStore.fetchInitialData()
    }

    if (isEdit.value) {
      txType.value = props.initialData.category_types?.code || props.initialData.type || 'EXPENSE'
      selectedWallet.value = props.initialData.wallet_id
      selectedCategory.value = props.initialData.category_id
      amount.value = props.initialData.amount
      description.value = props.initialData.description || ''
    } else {
      if (walletStore.wallets.length > 0 && !selectedWallet.value) {
        selectedWallet.value = walletStore.wallets[0].id
      }
      
      // Default to Expense
      txType.value = 'EXPENSE'
      const expenseCats = categoryStore.expenseCategories
      if (expenseCats.length > 0) selectedCategory.value = expenseCats[0].id
      
      amount.value = null
      description.value = ''
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
      category_id: selectedCategory.value,
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
      txDate.toISOString(),
      selectedCategory.value
    )

    if (success) {
      emit('success')
      close()
    }
  }
}
async function loadCats() {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchInitialData()
  }
}
onMounted(loadCats)

const handleDelete = async () => {
  if (!confirm(t('transactions.delete_warning'))) return
  
  const success = await transactionStore.deleteTransaction(props.initialData.id)
  if (success) {
    emit('success')
    close()
  }
}
</script>
