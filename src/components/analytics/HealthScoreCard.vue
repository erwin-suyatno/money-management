<template>
  <div class="premium-card p-6 h-full flex flex-col justify-between group overflow-hidden relative">
    <div class="relative z-10">
      <h3 class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">Financial Score</h3>
      <div class="flex items-end space-x-2">
        <p class="text-4xl font-black text-emerald-500 tracking-tighter">{{ score }}/100</p>
      </div>
    </div>
    
    <div class="mt-4 relative z-10">
       <p class="text-xs font-bold text-slate-600 dark:text-gray-300 mb-1 line-clamp-2 italic">
         "{{ insightText }}"
       </p>
    </div>
    
    <!-- Background element -->
    <div class="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 dark:opacity-5 text-emerald-500 rotate-12 group-hover:scale-110 transition-transform duration-700">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Simple dummy health score logic based on transactions
const score = computed(() => {
  if (!props.transactions || props.transactions.length === 0) return 60
  
  let income = 0
  let expense = 0
  props.transactions.forEach(tx => {
    if (tx.type === 'INCOME') income += Number(tx.amount)
    if (tx.type === 'EXPENSE') expense += Number(tx.amount)
  })

  if (income === 0 && expense > 0) return 45
  if (income === 0 && expense === 0) return 60

  const rate = ((income - expense) / income) * 100
  let baseScore = 50
  
  if (rate > 30) baseScore += 40
  else if (rate > 15) baseScore += 25
  else if (rate > 0) baseScore += 10
  else if (rate > -20) baseScore -= 10
  else baseScore -= 20
  
  return Math.min(100, Math.max(0, baseScore))
})

const insightText = computed(() => {
  const s = score.value
  if (s >= 80) return "Kondisi finansial sangat sehat! Teruskan rutinitas menabungmu."
  if (s >= 60) return "Cukup baik, tapi waspadai pengeluaran kecil yang menumpuk."
  if (s >= 40) return "Pengeluaran cukup agresif. Kurangi top kategori pengeluaranmu."
  return "Peringatan: Kamu lebih banyak mengeluarkan uang daripada pemasukan."
})
</script>
