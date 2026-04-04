<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 pb-32">
    <!-- Skeleton Loading -->
    <div v-if="loadingGlobal" class="animate-in fade-in duration-500">
       <div class="mb-12 space-y-4">
          <Skeleton width="400px" height="60px" />
          <Skeleton width="220px" height="20px" />
       </div>
       <Skeleton height="400px" />
    </div>

    <!-- Main Content -->
    <!-- Main Content -->
    <div v-else>
      <div class="mb-12">
      <h1 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{{ $t('import.title') }}</h1>
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2 ml-1">v1.1.0 {{ $t('import.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- Left: Scanner Area -->
      <div class="lg:col-span-12">
        <div class="premium-card p-12 border-4 border-dashed border-slate-100 dark:border-gray-800 flex flex-col items-center justify-center min-h-[400px] text-center group hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden"
             @dragover.prevent @drop.prevent="handleDrop" @click="$refs.fileInput.click()">
          
          <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileSelect">
          
          <div class="space-y-8 animate-in fade-in zoom-in duration-700">
             <div class="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/40 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mx-auto group-hover:scale-110 transition-transform">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
             </div>
             
             <div>
                <h3 class="text-xl font-black dark:text-white mb-2">{{ $t('import.drop_zone') }}</h3>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ $t('import.click_zone') }}</p>
             </div>

             <div v-if="selectedFile" class="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/40">
                {{ $t('import.file_label') }}: {{ selectedFile.name }}
             </div>

             <button v-if="selectedFile" @click.stop="processReceipt" :disabled="loading"
                     class="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50">
                {{ loading ? $t('import.scanning') : $t('import.scan_btn') }}
             </button>
          </div>

          <!-- Pulsing Background -->
          <div v-if="loading" class="absolute inset-0 bg-indigo-600/5 animate-pulse"></div>
        </div>
      </div>

      <!-- Scan Result -->
      <div v-if="scanResult" class="lg:col-span-12 animate-in slide-in-from-bottom-8 duration-500">
         <div class="premium-card p-8 border-t-8 border-emerald-500">
            <h3 class="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">{{ $t('import.result') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{{ $t('import.merchant') }}</p>
                  <p class="text-2xl font-black dark:text-white">{{ scanResult.merchant }}</p>
               </div>
               <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{{ $t('import.total_amount') }}</p>
                  <p class="text-2xl font-black text-emerald-600">{{ formatCurrency(scanResult.amount) }}</p>
               </div>
               <div class="flex items-end">
                  <button class="w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform">
                     {{ $t('common.save') }}
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Skeleton from '../components/Skeleton.vue'

const { t, locale } = useI18n()
const selectedFile = ref(null)
const loading = ref(false)
const loadingGlobal = ref(true) // Initial load simulator
const scanResult = ref(null)
const fileInput = ref(null)

const formatCurrency = (value) => {
  return new Intl.NumberFormat(locale.value === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

onMounted(() => {
  // Simulate page data preparation
  setTimeout(() => {
    loadingGlobal.value = false
  }, 1200)
})

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) selectedFile.value = file
}

const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file) selectedFile.value = file
}

const processReceipt = () => {
  loading.value = true
  // Simulate AI processing
  setTimeout(() => {
    loading.value = false
    scanResult.value = { merchant: 'Indomaret', amount: 45600 }
  }, 2500)
}
</script>
