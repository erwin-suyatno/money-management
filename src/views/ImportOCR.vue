<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-10 lg:p-16 pb-32">
    <!-- Header Section -->
    <div class="mb-14 flex flex-col md:flex-row md:items-end justify-between space-y-8 md:space-y-0">
      <div>
        <h1 class="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">AI Import</h1>
        <p class="mt-3 text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">Intelligence-driven ledger automation.</p>
      </div>
      <div v-if="parsedData" class="flex space-x-4">
         <button @click="resetOCR" class="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100 dark:border-gray-800">
           Discard & Restart
         </button>
      </div>
    </div>

    <!-- Workflow Progress (Visual only) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      <div :class="!parsedData ? 'border-indigo-600' : 'border-emerald-500'" class="premium-card !p-8 border-t-8 transition-all">
         <div class="flex items-center justify-between mb-4">
            <div :class="!parsedData ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'" class="w-10 h-10 rounded-2xl flex items-center justify-center font-black">1</div>
            <svg v-if="parsedData" class="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
         </div>
         <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Data Ingestion</p>
      </div>
      <div :class="isProcessing ? 'border-indigo-600' : parsedData ? 'border-emerald-500' : 'border-slate-100'" class="premium-card !p-8 border-t-8 transition-all">
         <div class="flex items-center justify-between mb-4">
            <div :class="isProcessing ? 'bg-indigo-600 text-white' : parsedData ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'" class="w-10 h-10 rounded-2xl flex items-center justify-center font-black">2</div>
            <div v-if="isProcessing" class="flex space-x-1"><div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div></div>
         </div>
         <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">AI Extraction</p>
      </div>
      <div :class="hasSelectedData ? 'border-indigo-600' : 'border-slate-100'" class="premium-card !p-8 border-t-8 transition-all">
         <div class="flex items-center justify-between mb-4">
            <div :class="hasSelectedData ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'" class="w-10 h-10 rounded-2xl flex items-center justify-center font-black">3</div>
         </div>
         <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Verification</p>
      </div>
    </div>

    <!-- Step 1: Upload Interface -->
    <div v-if="!parsedData" class="max-w-4xl mx-auto space-y-8">
      <!-- Format Warning -->
      <div class="premium-card !p-6 border-l-8 border-amber-500 bg-amber-50/30 dark:bg-amber-900/10 flex items-start space-x-6">
         <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
         </div>
         <div class="space-y-1">
            <h4 class="text-sm font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest">System Limitations</h4>
            <p class="text-xs font-bold text-amber-700/70 dark:text-amber-400/70 leading-relaxed">
               Currently only supports **BCA Mobile** mutation screenshots. Image processing is performed **locally in your browser**—no transaction images are stored in our database for your privacy.
            </p>
         </div>
      </div>

      <div class="premium-card !p-12 relative overflow-hidden group">
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-indigo-50 dark:bg-indigo-900/10 rounded-full opacity-50 blur-3xl group-hover:bg-indigo-100 transition-all duration-1000"></div>
        
        <div class="relative z-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
               <h3 class="text-3xl font-black text-slate-900 dark:text-white mb-6 leading-tight">Supply your Mutation Data</h3>
               <p class="text-slate-500 dark:text-gray-400 font-medium text-lg mb-10 leading-relaxed">Our AI will parse dates, amounts, and descriptions directly from your screenshots.</p>
               
               <div class="space-y-8">
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Funding Source</label>
                    <select v-model="selectedWallet" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-750 rounded-3xl px-8 py-6 focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-black transition-all appearance-none cursor-pointer">
                      <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
                    </select>
                  </div>
                  
                  <button @click="processFile" :disabled="!selectedFile || !selectedWallet || isProcessing" 
                          class="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-4">
                    <span class="text-lg tracking-tight">{{ isProcessing ? 'Extracting Intelligence...' : 'Begin Extraction' }}</span>
                    <svg v-if="!isProcessing" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </button>
               </div>
            </div>

            <div class="relative group">
              <input type="file" accept="image/*" @change="handleFileSelected" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-[20]">
              <div :class="selectedFile ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100 dark:border-gray-800'" 
                   class="border-4 border-dashed rounded-[3rem] p-12 text-center transition-all group-hover:border-indigo-200 dark:group-hover:border-indigo-900/40">
                <div v-if="selectedFile" class="flex flex-col items-center">
                   <div class="w-24 h-24 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
                      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                   </div>
                   <p class="text-xl font-black text-slate-900 dark:text-white max-w-[200px] truncate">{{ selectedFile.name }}</p>
                   <p class="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB • READY</p>
                </div>
                <div v-else class="flex flex-col items-center">
                   <div class="w-24 h-24 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-indigo-500/5">
                      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                   </div>
                   <p class="text-xl font-black text-slate-900 dark:text-white">Drop Screenshot</p>
                   <p class="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">IMAGES ONLY (PDF LATER)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Extraction Results -->
    <div v-else class="animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div class="premium-card !p-0 overflow-hidden mb-12">
        <div class="max-h-[600px] overflow-y-auto">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 border-b border-slate-100 dark:border-gray-800">
              <tr>
                <th class="p-6 w-16">
                  <div class="flex items-center justify-center">
                    <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                  </div>
                </th>
                <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                <th class="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-gray-800/50">
              <tr v-for="(row, idx) in parsedData" :key="idx" 
                  class="group hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td class="p-6">
                  <div class="flex items-center justify-center">
                    <input type="checkbox" v-model="row.selected" class="w-6 h-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer transition-all">
                  </div>
                </td>
                <td class="p-6">
                  <input type="text" v-model="row.date" class="bg-transparent border-none p-0 focus:ring-0 text-sm font-black text-slate-900 dark:text-white w-28 tracking-tight">
                </td>
                <td class="p-6">
                  <input type="text" v-model="row.description" class="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-600 dark:text-gray-300 w-full tracking-tight truncate" placeholder="Description">
                </td>
                <td class="p-6">
                  <select v-model="row.type" 
                          :class="row.type === 'INCOME' ? 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50/50 dark:bg-rose-900/20'" 
                          class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer border-none appearance-none transition-colors">
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </td>
                <td class="p-6 text-right">
                  <input v-model.number="row.amount" type="number" 
                         class="bg-transparent border-none p-0 focus:ring-0 text-lg font-black text-slate-900 dark:text-white w-full text-right tracking-tighter tabular-nums">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="sticky bottom-10 z-[50]">
        <button @click="saveTransactions" :disabled="!hasSelectedData || isSaving" 
                class="w-full py-8 bg-slate-900 dark:bg-indigo-600 text-white rounded-[3rem] font-black shadow-2xl hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 text-xl tracking-tight flex items-center justify-center space-x-6">
           <span v-if="isSaving" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-6 h-8 w-8 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Committing to Ledger...
           </span>
           <span v-else class="flex items-center">
              <span>Commit {{ selectedCount }} Transactions</span>
              <svg class="w-8 h-8 ml-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
           </span>
        </button>
      </div>

      <!-- Advanced Debug Info -->
      <div class="mt-20">
        <button @click="showRaw = !showRaw" class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-colors px-6">
          {{ showRaw ? 'Hide' : 'View' }} Processing Logs
        </button>
        <div v-if="showRaw" class="mt-6 premium-card !p-8 ring-1 ring-slate-100">
           <pre class="text-[11px] font-mono text-slate-500 whitespace-pre-wrap leading-relaxed">{{ rawText }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '../stores/useWalletStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const walletStore = useWalletStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()
const router = useRouter()

const selectedWallet = ref('')
const selectedFile = ref(null)
const isProcessing = ref(false)
const rawText = ref('')
const parsedData = ref(null)
const isSaving = ref(false)
const showRaw = ref(false)

onMounted(async () => {
  await walletStore.fetchWallets()
  if (walletStore.wallets.length > 0 && !selectedWallet.value) {
    selectedWallet.value = walletStore.wallets[0].id
  }
})

const handleFileSelected = (e) => {
  if (e.target.files.length > 0) {
    const file = e.target.files[0]
    if (!file.type.startsWith('image/')) {
       alert('⚠️ Currently only Image files (.jpg, .png) are supported. PDF support is coming soon.')
       return
    }
    selectedFile.value = file
  }
}

const processFile = async () => {
   if (!selectedFile.value) return
   isProcessing.value = true
   try {
     // No storage upload for privacy - processing locally
     await processImage()
     parseRawText(rawText.value)
   } catch(e) {
     console.error(e)
     alert("Failed to process file: " + e.message)
   } finally {
     isProcessing.value = false
   }
}

const processImage = async () => {
   const result = await Tesseract.recognize(selectedFile.value, 'eng+ind')
   rawText.value = result.data.text
}

const processPDF = async () => {
   const arrayBuffer = await selectedFile.value.arrayBuffer()
   const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
   let extractedText = ''
   let hasNativeText = false
   
   for (let i = 1; i <= pdf.numPages; i++) {
       const page = await pdf.getPage(i)
       const textContent = await page.getTextContent()
       if (textContent.items.length > 0) {
           hasNativeText = true
           let lastY = -1
           let pageText = ''
           textContent.items.forEach(item => {
               if (lastY !== -1 && Math.abs(lastY - item.transform[5]) > 4) pageText += '\n'
               pageText += item.str + ' '
               lastY = item.transform[5]
           })
           extractedText += pageText + '\n'
       }
   }
   
   if (hasNativeText && extractedText.trim().length > 20) {
       rawText.value = extractedText
       return
   }

   const page = await pdf.getPage(1)
   const viewport = page.getViewport({ scale: 2.0 })
   const canvas = document.createElement('canvas')
   const ctx = canvas.getContext('2d')
   canvas.height = viewport.height
   canvas.width = viewport.width
   await page.render({ canvasContext: ctx, viewport }).promise
   const result = await Tesseract.recognize(canvas.toDataURL('image/png'), 'eng+ind')
   rawText.value = result.data.text
}

const parseRawText = (text) => {
  const lines = text.split('\n')
  const results = []
  
  // Refined patterns for better accuracy
  const blacklist = ["HALAMAN", "PERIODE", "REKENING", "SALDO", "NAMA", "MATA UANG", "CATATAN", "TANGGAL", "KETERANGAN", "MUTASI", "USER ID", "TGL"];
  const startOfRowRegex = /^(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/; 
  const crRegex = /\b(CR|K|KREDIT|IN|INCOME|\+)\b/i
  const amountAndTypeRegex = /([\d,.]+)\s*(CR|DB|K|D)\b/i

  let currentTransaction = null

  lines.forEach(line => {
     const trimmedLine = line.trim()
     if (trimmedLine.length < 3) return

     // 1. Skip non-transactional headers (if they don't start a row with a date)
     const isStartOfRow = startOfRowRegex.test(trimmedLine)
     if (!isStartOfRow && blacklist.some(word => trimmedLine.toUpperCase().includes(word))) return

     // 2. Detect New Transaction Start
     if (isStartOfRow) {
        // Finalize previous if valid
        if (currentTransaction && currentTransaction.amount > 0) {
            results.push(currentTransaction)
        }
        
        // Start new
        const dateMatch = trimmedLine.match(startOfRowRegex)
        const dateStr = dateMatch[1]
        
        currentTransaction = {
            selected: true,
            date: dateStr,
            description: trimmedLine.replace(dateStr, '').trim(),
            amount: 0,
            type: 'EXPENSE'
        }
        
        // Attempt immediate extraction
        extractFromText(trimmedLine, currentTransaction, amountAndTypeRegex, crRegex)
     } else if (currentTransaction) {
        // Accumulate data to current transaction
        currentTransaction.description += ' ' + trimmedLine
        extractFromText(trimmedLine, currentTransaction, amountAndTypeRegex, crRegex)
     }
  })

  // Final push
  if (currentTransaction && currentTransaction.amount > 0) {
      results.push(currentTransaction)
  }

  // Deduplicate and final cleanup of descriptions
  parsedData.value = results.map(tr => {
      tr.description = cleanDescription(tr.description, tr.date)
      return tr
  }).filter((item, idx, self) => idx === self.findIndex((t) => t.date === item.date && t.amount === item.amount && t.description === item.description))
}

// Helper to extract amount/type from any line fragment
function extractFromText(text, trans, amountAndTypeRegex, crRegex) {
    const amountAndTypeMatch = text.match(amountAndTypeRegex)
    if (amountAndTypeMatch) {
        trans.amount = cleanAmountValue(amountAndTypeMatch[1])
        const typeStr = amountAndTypeMatch[2].toUpperCase()
        trans.type = (typeStr === 'CR' || typeStr === 'K') ? 'INCOME' : 'EXPENSE'
    } else if (trans.amount === 0) {
        // Fallback: search for numbers and pick the largest one that doesn't look like a date or partial metadata
        const allNumbers = text.match(/[\d,.]+/g) || []
        allNumbers.forEach(n => {
            if (n === trans.date) return
            const val = cleanAmountValue(n)
            // Heuristic: valid transaction amounts are usually larger than 100 in IDR context
            if (val > trans.amount && val > 100) {
                trans.amount = val
            }
        })
        if (crRegex.test(text)) trans.type = 'INCOME'
    }
}

function cleanAmountValue(str) {
    let clean = str
    if (clean.includes(',') && clean.includes('.')) clean = clean.replace(/,/g, '')
    else if ((clean.match(/\./g) || []).length > 1) clean = clean.replace(/\./g, '')
    else if (clean.includes(',') && !clean.includes('.')) {
        if (/,(\d{2})$/.test(clean)) clean = clean.replace(/\./g, '').replace(',', '.')
        else clean = clean.replace(/,/g, '')
    }
    return parseFloat(clean) || 0
}

function cleanDescription(desc, dateStr) {
    return desc.replace(dateStr, '')
               .replace(/\b(DB|CR|D|K|Rp|TRSF|TGL|BI-FAST|E-BANKING)\b/gi, '')
               .replace(/[^\w\s\/-]/g, ' ')
               .replace(/\s+/g, ' ')
               .trim()
               .substring(0, 80)
}

const resetOCR = () => {
   parsedData.value = null
   rawText.value = ''
   selectedFile.value = null
}

const selectedCount = computed(() => parsedData.value?.filter(r => r.selected).length || 0)
const hasSelectedData = computed(() => selectedCount.value > 0)

const saveTransactions = async () => {
   const selectedRows = parsedData.value.filter(r => r.selected && r.amount > 0)
   if(selectedRows.length === 0) return
   isSaving.value = true
   let successCount = 0
   for(const row of selectedRows) {
      let isoDate = null
      if (row.date) {
          const parts = row.date.split(/[\/-]/)
          if (parts.length >= 2) {
               const day = parts[0].padStart(2, '0')
               const month = parts[1].padStart(2, '0')
               const year = parts.length === 3 ? (parts[2].length === 2 ? `20${parts[2]}` : parts[2]) : new Date().getFullYear()
               try {
                  const d = new Date(`${year}-${month}-${day}T12:00:00`)
                  if (!isNaN(d.getTime())) isoDate = d.toISOString()
               } catch (e) {}
          }
      }
      const ok = await transactionStore.addTransaction(selectedWallet.value, row.type, row.amount, row.description, isoDate)
      if(ok) successCount++
   }
   isSaving.value = false
   alert(`SUCCESS: Imported ${successCount} transactions!`)
   router.push('/transaction')
}
</script>
