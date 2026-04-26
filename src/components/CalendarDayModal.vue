<template>
  <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-end justify-center p-0 sm:items-center sm:p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="close"></div>
    
    <!-- Modal Content -->
    <div class="premium-card !p-0 w-full max-w-lg relative z-10 animate-slide-up overflow-hidden shadow-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t-8 border-indigo-600">
      <!-- Header -->
      <div class="p-8 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h3 class="text-xl font-black dark:text-white tracking-tight">{{ formattedDate }}</h3>
            <span v-if="isToday" class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-indigo-200 dark:border-indigo-800/50">{{ $t('transactions.today') }}</span>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{{ $t('dashboard.calendar_modal_subtitle') }}</p>
        </div>
        <button @click="close" class="p-3 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-2xl transition-all">
          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Transaction List -->
      <div class="max-h-[450px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <div v-for="tx in transactions" :key="tx.id" 
             @click="emit('edit', tx)"
             class="p-5 rounded-[2rem] bg-slate-50 dark:bg-gray-800/50 flex items-center justify-between border border-transparent hover:border-slate-100 dark:hover:border-gray-700 transition-all group cursor-pointer">
          <div class="flex items-center space-x-5">
             <div :class="[
                    tx.type === 'INCOME' ? 'bg-emerald-500' : 
                    tx.type === 'TRANSFER' ? 'bg-blue-500' : 'bg-rose-500'
                  ]" 
                  class="w-1.5 h-10 rounded-full shadow-lg transition-transform group-hover:scale-y-110"></div>
             <div>
                <p class="text-sm font-black text-slate-900 dark:text-white tracking-tight line-clamp-1">{{ tx.description || $t('transactions.general') }}</p>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center">
                   <span class="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                   {{ tx.wallets?.name }}
                </p>
             </div>
          </div>
          <div class="text-right">
             <p :class="[
                  tx.type === 'INCOME' ? 'text-emerald-500' : 
                  tx.type === 'TRANSFER' ? 'text-blue-500' : 'text-slate-900 dark:text-white'
                ]" class="font-black tabular-nums tracking-tighter text-lg">
                {{ tx.type === 'INCOME' ? '+' : (tx.type === 'TRANSFER' ? '' : '-') }}{{ tx.amount.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US') }}
             </p>
          </div>
        </div>

        <div v-if="transactions.length === 0" class="py-16 text-center">
           <div class="w-20 h-20 bg-slate-50 dark:bg-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-gray-800 shadow-sm">
              <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           </div>
           <p class="text-slate-400 font-black uppercase tracking-widest text-[10px]">{{ $t('dashboard.calendar_empty') }}</p>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="p-6 bg-slate-50 dark:bg-gray-900 flex items-center justify-between border-t border-slate-50 dark:border-gray-800">
        <button @click="close" class="px-8 py-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all shadow-sm">{{ $t('dashboard.calendar_dismiss') }}</button>
        
        <button @click="handleQuickAdd" 
                class="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition active:scale-[0.98] flex items-center space-x-3">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/></svg>
           <span>{{ $t('dashboard.calendar_quick_add') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  isOpen: Boolean,
  date: {
    type: Date,
    default: null
  },
  transactions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'quick-add', 'edit'])

const { t, locale } = useI18n()

const formattedDate = computed(() => {
  if (!props.date) return ''
  return props.date.toLocaleDateString(locale.value === 'id' ? 'id-ID' : 'en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
})

const isToday = computed(() => {
  if (!props.date) return false
  const today = new Date()
  return props.date.getDate() === today.getDate() &&
         props.date.getMonth() === today.getMonth() &&
         props.date.getFullYear() === today.getFullYear()
})

const close = () => {
  emit('close')
}

const handleQuickAdd = () => {
  emit('quick-add', props.date)
}
</script>
