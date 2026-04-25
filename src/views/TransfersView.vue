<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || $t('common.user')"
    :user-email="authStore.user?.email"
    :page-title="$t('transfer.title')"
    @logout="handleLogout"
  >
    <!-- Header Area -->
    <div class="mb-8 md:mb-10 animate-slide-up px-1 md:px-0">
      <h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
        {{ $t('transfer.title') }}
      </h2>
      <p class="text-xs md:text-sm text-slate-500 font-medium">{{ $t('transfer.modal_subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- Left Column: Form -->
      <div class="lg:col-span-5">
        <AppCard class="border-t-4 border-primary-600">
          <template #header>
            <h3 class="text-xs font-black uppercase tracking-widest">{{ $t('transfer.send_funds') }}</h3>
          </template>
          
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- From-To Visual -->
            <div class="space-y-4">
              <div class="space-y-1">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('transactions.from') }}</label>
                <select 
                  v-model="form.from_wallet_id" 
                  required 
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option :value="null" disabled>{{ $t('transfer.select_wallet') }}</option>
                  <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">
                    {{ w.name }} ({{ formatIDR(w.balance) }})
                  </option>
                </select>
              </div>

              <div class="flex justify-center -my-2 relative z-10">
                <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <ArrowDown :size="20" />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('transactions.to') }}</label>
                <select 
                  v-model="form.to_wallet_id" 
                  required 
                  class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option :value="null" disabled>{{ $t('transfer.select_wallet') }}</option>
                  <option v-for="w in walletStore.wallets" :key="w.id" :value="w.id">
                    {{ w.name }} ({{ formatIDR(w.balance) }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Amount -->
            <AppInput 
              id="transfer-amount" 
              v-model.number="form.amount" 
              :label="$t('transfer.amount')" 
              type="number"
              placeholder="0"
              required
            >
              <template #prefix><span class="text-xs font-bold text-slate-400">Rp</span></template>
            </AppInput>

            <!-- Note -->
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('transfer.note') }} ({{ $t('common.optional') }})</label>
              <textarea 
                v-model="form.note" 
                class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500" 
                rows="3"
                :placeholder="$t('transfer.note') + '...'"
              ></textarea>
            </div>

            <AppButton 
              variant="primary" 
              size="lg" 
              full-width 
              type="submit"
              :loading="loading"
            >
              {{ $t('transfer.btn_transfer') }}
            </AppButton>
          </form>
        </AppCard>
      </div>

      <!-- Right Column: History -->
      <div class="lg:col-span-7 space-y-6">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">{{ $t('transfer.history') }}</h3>
          <AppButton variant="ghost" size="sm" icon-only @click="fetchTransfers"><RotateCw :size="16" /></AppButton>
        </div>
        
        <div v-if="isInitialLoading" class="space-y-4">
           <AppCard v-for="i in 3" :key="i" class="!p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-6">
                   <div class="space-y-1 min-w-[100px] flex flex-col items-center">
                      <AppSkeleton width="60px" height="10px" />
                      <AppSkeleton width="40px" height="8px" />
                   </div>
                   <AppSkeleton width="120px" height="20px" />
                </div>
                <AppSkeleton width="80px" height="24px" />
              </div>
           </AppCard>
        </div>
        <div v-else-if="transfers.length === 0" class="py-24 text-center grayscale opacity-50">
           <div class="w-16 h-16 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <History :size="24" />
           </div>
           <p class="text-xs font-black uppercase tracking-widest">{{ $t('transfer.empty') }}</p>
        </div>

        <div v-else class="space-y-4">
           <AppCard v-for="t in transfers" :key="t.id" class="!p-4 border-l-4 border-primary-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-6">
                   <div class="flex flex-col items-center min-w-[100px]">
                      <span class="text-[10px] font-black text-slate-900 dark:text-white uppercase">{{ t.from_wallet?.name }}</span>
                      <ArrowRight :size="12" class="text-slate-300 my-1" />
                      <span class="text-[10px] font-black text-slate-900 dark:text-white uppercase">{{ t.to_wallet?.name }}</span>
                   </div>
                   <div class="h-10 w-px bg-slate-100 dark:bg-gray-800"></div>
                   <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ formatDate(t.created_at) }}</p>
                      <p v-if="t.description" class="text-[10px] font-bold text-slate-500 italic">{{ t.description }}</p>
                   </div>
                </div>
                <div class="text-right">
                   <p class="text-base font-black text-slate-900 dark:text-white tabular-nums">{{ formatIDR(t.amount) }}</p>
                </div>
              </div>
           </AppCard>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, ArrowRight, RotateCw, History } from 'lucide-vue-next'
import { supabase } from '../services/supabase'

import { useAuthStore } from '../stores/useAuthStore'
import { useWalletStore } from '../stores/useWalletStore'
import { useCurrency } from '../composables/useCurrency'
import { useFormatDate } from '../composables/useFormatDate'

import AppShell from '../components/layout/AppShell.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppSkeleton from '../components/ui/AppSkeleton.vue'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const router = useRouter()
const { formatIDR } = useCurrency()
const { formatDate } = useFormatDate()

const loading = ref(false)
const isInitialLoading = ref(true)
const transfers = ref([])
const form = ref({
  from_wallet_id: null,
  to_wallet_id: null,
  amount: 0,
  note: ''
})

const fetchTransfers = async () => {
  isInitialLoading.value = true
  const { data, error } = await supabase
    .from('transfers')
    .select(`
      *,
      from_wallet:wallets!transfers_from_wallet_id_fkey(name),
      to_wallet:wallets!transfers_to_wallet_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
  
  if (!error) transfers.value = data
  isInitialLoading.value = false
}

const handleSubmit = async () => {
  if (form.value.from_wallet_id === form.value.to_wallet_id) {
    alert(t('transfer.error_same_wallet'))
    return
  }
  if (form.value.amount <= 0) {
    alert(t('transfer.error_amount'))
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
    form.value.from_wallet_id = null
    form.value.to_wallet_id = null
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

const handleLogout = async () => { await authStore.logout(); router.push('/login') }

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
