<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || $t('common.user')"
    :user-email="authStore.user?.email"
    :page-title="$t('import.title')"
    @logout="handleLogout"
  >
    <div class="max-w-5xl mx-auto py-6 md:py-8 px-1 md:px-0">
      <!-- Header Area -->
      <div class="mb-8 md:mb-12 animate-slide-up">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles :size="14" class="fill-current" />
            {{ $t('import.powered_by') }}
          </div>
          <h2 class="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 italic">
            {{ $t('import.title') }}
          </h2>
          <p class="text-xs md:text-sm text-slate-500 font-medium">{{ $t('import.subtitle') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Left: Upload & Result -->
        <div class="lg:col-span-7 space-y-8">
          <!-- Dropzone -->
          <AppCard 
            class="relative border-4 border-dashed border-slate-200 dark:border-gray-800 hover:border-primary-500 transition-all duration-300 !p-0 overflow-hidden group"
            :class="{ 'opacity-50 pointer-events-none': scanning }"
          >
            <input 
              type="file" 
              accept="image/*" 
              class="absolute inset-0 opacity-0 cursor-pointer z-10"
              @change="handleFileUpload"
            />
            <div class="py-20 flex flex-col items-center justify-center text-center">
               <div class="w-20 h-20 bg-slate-50 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:text-primary-500 group-hover:scale-110 transition-all mb-6">
                  <UploadCloud :size="32" />
               </div>
               <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">{{ $t('import.drop_zone') }}</h3>
               <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ $t('import.click_zone') }}</p>
            </div>

            <!-- Preview Overlay -->
            <div v-if="previewUrl" class="absolute inset-0 bg-white dark:bg-gray-950 z-20 flex flex-col">
               <img :src="previewUrl" class="flex-1 object-contain bg-slate-50 dark:bg-gray-900" />
               <div class="p-4 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ fileName }}</span>
                  <button @click="resetUpload" class="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">{{ $t('common.cancel') }}</button>
               </div>
            </div>

            <!-- Scanning Overlay -->
            <div v-if="scanning" class="absolute inset-0 bg-white/90 dark:bg-gray-950/90 z-30 flex flex-col items-center justify-center text-center p-10 animate-in fade-in">
               <div class="relative w-24 h-24 mb-8">
                  <div class="absolute inset-0 border-4 border-primary-100 dark:border-primary-900/20 rounded-full"></div>
                  <div class="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
               </div>
               <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">{{ $t('import.scanning') }}</h3>
               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{{ progress }}%</p>
            </div>
          </AppCard>

          <!-- Result View -->
          <div v-if="ocrResult" class="animate-in slide-in-from-bottom duration-500">
             <div class="flex items-center gap-3 px-2 mb-6">
               <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">{{ $t('import.result') }}</h3>
               <div class="h-px bg-slate-100 dark:bg-gray-800 flex-1"></div>
             </div>

             <AppCard class="border-l-8 border-primary-600 !p-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div class="space-y-6">
                      <div class="space-y-1">
                         <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('import.merchant') }}</label>
                         <input v-model="ocrResult.merchant" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div class="space-y-1">
                         <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('import.total_amount') }}</label>
                         <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                            <input v-model.number="ocrResult.total" type="number" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl pl-10 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500" />
                         </div>
                      </div>
                   </div>

                   <div class="space-y-6">
                      <div class="space-y-1">
                         <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('transactions.form_wallet') }}</label>
                         <select v-model="selectedWallet" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500">
                            <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">{{ w.name }} ({{ formatIDR(w.balance) }})</option>
                         </select>
                      </div>
                      <div class="space-y-1">
                         <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('transactions.form_category') }}</label>
                         <select v-model="selectedCategory" class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500">
                            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                         </select>
                      </div>
                   </div>
                </div>

                <div class="mt-10 pt-10 border-t border-slate-50 dark:border-gray-800/50 flex gap-4">
                   <AppButton variant="secondary" size="lg" full-width @click="resetUpload">{{ $t('common.cancel') }}</AppButton>
                   <AppButton variant="primary" size="lg" full-width :loading="saving" @click="saveTransaction">
                      <template #prefix><Check :size="18" /></template>
                      {{ $t('transactions.commit_btn') }}
                   </AppButton>
                </div>
             </AppCard>
          </div>
        </div>

        <!-- Right: Info -->
        <div class="lg:col-span-5 space-y-8">
           <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 px-2">{{ $t('nav.import') }} INFO</h3>
           
           <div class="space-y-6">
              <AppCard v-for="(info, idx) in infoCards" :key="idx" class="!p-6 flex items-start gap-6 group hover:-translate-y-1 transition-all">
                 <div :class="info.color" class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                    <component :is="info.icon" :size="20" />
                 </div>
                 <div>
                    <h4 class="text-sm font-black text-slate-900 dark:text-white mb-1">{{ $t(info.titleKey) }}</h4>
                    <p class="text-xs font-medium text-slate-500 leading-relaxed">{{ $t(info.descKey) }}</p>
                 </div>
              </AppCard>
           </div>

           <div class="bg-primary-50 dark:bg-primary-900/10 p-6 md:p-8 rounded-[2.5rem] border border-primary-100 dark:border-primary-900/20">
              <div class="flex items-center gap-3 mb-4 text-primary-600">
                 <Zap :size="18" />
                 <span class="text-xs font-black uppercase tracking-widest">{{ $t('import.tips_title') }}</span>
              </div>
              <p class="text-xs font-bold text-primary-700 dark:text-primary-300 leading-relaxed">
                 {{ $t('import.tips_desc') }}
              </p>
           </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Sparkles, 
  UploadCloud, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Check,
  X
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from '../stores/useAuthStore'
import { useWalletStore } from '../stores/useWalletStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useCategoryStore } from '../stores/useCategoryStore'
import { useOCR } from '../composables/useOCR'
import { useCurrency } from '../composables/useCurrency'

import AppShell from '../components/layout/AppShell.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const txStore = useTransactionStore()
const categoryStore = useCategoryStore()
const router = useRouter()
const { formatIDR } = useCurrency()
const { scanning, progress, ocrResult, scanReceipt } = useOCR()

const previewUrl = ref(null)
const fileName = ref('')
const selectedWallet = ref(null)
const selectedCategory = ref(null)
const saving = ref(false)

const categories = computed(() => categoryStore.categories.filter(c => c.type === 'expense'))

const infoCards = [
  {
    titleKey: 'import.info_speed_title',
    descKey: 'import.info_speed_desc',
    icon: Zap,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
  },
  {
    titleKey: 'import.info_secure_title',
    descKey: 'import.info_secure_desc',
    icon: ShieldCheck,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
  },
  {
    titleKey: 'import.info_format_title',
    descKey: 'import.info_format_desc',
    icon: Layers,
    color: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20'
  }
]

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  fileName.value = file.name
  previewUrl.value = URL.createObjectURL(file)
  
  await scanReceipt(file)
}

const resetUpload = () => {
  previewUrl.value = null
  fileName.value = ''
  ocrResult.value = null
}

const saveTransaction = async () => {
  if (!selectedWallet.value) {
    alert(t('import.error_no_wallet'))
    return
  }

  saving.value = true
  try {
    const success = await txStore.addTransaction({
      type: 'expense',
      amount: ocrResult.value.total,
      wallet_id: selectedWallet.value,
      category_id: selectedCategory.value,
      note: ocrResult.value.merchant,
      created_at: new Date().toISOString()
    })

    if (success) {
      alert(t('import.success_msg'))
      resetUpload()
      await walletStore.fetchWallets()
    } else {
      alert(t('import.error_save', { error: txStore.error }))
    }
  } catch (err) {
    alert(t('import.error_save', { error: err.message }))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  walletStore.fetchWallets()
  categoryStore.fetchCategories()
  if (walletStore.wallets.length > 0) selectedWallet.value = walletStore.wallets[0].id
})

const handleLogout = async () => { await authStore.logout(); router.push('/login') }
</script>
