<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    :page-title="$t('wallets.title')"
    @logout="handleLogout"
  >
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {{ $t('wallets.title') }}
        </h2>
        <p class="text-sm text-slate-500 font-medium">{{ $t('wallets.balance') }}: {{ formatIDR(totalBalance) }}</p>
      </div>

      <AppButton variant="primary" size="md" @click="showAddModal = true">
        <template #prefix><Plus :size="18" /></template>
        <span>{{ $t('wallets.add') }}</span>
      </AppButton>
    </div>

    <!-- Wallet Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <template v-if="walletStore.loading && walletStore.wallets.length === 0">
        <div v-for="i in 3" :key="i" class="h-[240px] rounded-[2.5rem] bg-slate-100 dark:bg-gray-800 animate-pulse overflow-hidden relative">
           <div class="absolute inset-x-8 top-8 space-y-2">
              <AppSkeleton width="60px" height="12px" class="opacity-20" />
              <AppSkeleton width="120px" height="24px" class="opacity-30" />
           </div>
           <div class="absolute inset-x-8 bottom-8 space-y-4">
              <div class="space-y-2">
                 <AppSkeleton width="80px" height="10px" class="opacity-20" />
                 <AppSkeleton width="180px" height="32px" class="opacity-30" />
              </div>
           </div>
        </div>
      </template>
      <template v-else>
        <div 
          v-for="(wallet, idx) in walletStore.wallets" 
          :key="wallet.id" 
          class="wallet-card-wrapper h-[240px] group cursor-pointer"
          @click="openDetail(wallet)"
        >
          <div 
            class="wallet-card"
            :class="getWalletColor(idx)"
          >
            <!-- Decoration -->
            <div class="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            
            <div class="relative z-10 h-full flex flex-col justify-between">
              <div class="flex justify-between items-start">
                <div class="space-y-1">
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{{ $t('wallets.provider') }}</p>
                  <h3 class="text-xl font-black italic tracking-tighter text-white">{{ wallet.name }}</h3>
                </div>
                <div class="flex gap-2">
                  <button 
                    @click.stop="deleteWallet(wallet.id)" 
                    class="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Trash2 :size="18" />
                  </button>
                </div>
              </div>

              <div class="space-y-4">
                <div class="space-y-1">
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{{ $t('wallets.available_balance') }}</p>
                  <div class="flex items-baseline gap-1 info-shadow">
                    <span class="text-sm font-bold text-white/60">Rp</span>
                    <p class="text-3xl font-black tracking-tighter tabular-nums text-white">
                      {{ formatRaw(wallet.balance) }}
                    </p>
                  </div>
                </div>
                
                <div class="flex justify-between items-center mt-2">
                  <p class="text-[10px] font-mono tracking-widest text-white/40">**** **** **** {{ (1000 + idx).toString() }}</p>
                  <span class="text-lg font-black italic text-white/30 group-hover:text-white/60 transition-colors">VISA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Add New Placeholder -->
      <div 
        class="h-[240px] border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-primary-500/50 transition-all cursor-pointer bg-slate-50/50 dark:bg-gray-900/20"
        @click="showAddModal = true"
      >
        <div class="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Plus :size="24" class="text-slate-400 group-hover:text-primary-600" />
        </div>
        <div class="text-center">
          <p class="text-sm font-black text-slate-900 dark:text-white">{{ $t('wallets.add') }}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ $t('wallets.modal_subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AppModal 
      :is-open="showAddModal" 
      :title="$t('wallets.modal_title')" 
      @close="showAddModal = false"
    >
      <div class="space-y-6">
        <AppInput 
          id="wallet-name" 
          v-model="newWalletName" 
          :label="$t('wallets.form_name')" 
          :placeholder="$t('wallets.empty_title')"
        />
        
        <AppInput 
          id="wallet-balance" 
          v-model.number="newWalletBalance" 
          :label="$t('wallets.form_balance')" 
          type="number"
          placeholder="0"
        >
          <template #prefix><span class="text-xs font-bold">Rp</span></template>
        </AppInput>

        <div class="pt-4 flex flex-col gap-3">
          <AppButton 
            variant="primary" 
            size="lg" 
            full-width 
            @click="submitWallet"
            :loading="walletStore.loading"
          >
            {{ $t('wallets.btn_create') }}
          </AppButton>
          <AppButton 
            variant="ghost" 
            size="lg" 
            full-width 
            @click="showAddModal = false"
          >
            {{ $t('common.cancel') }}
          </AppButton>
        </div>
      </div>
    </AppModal>

    <WalletDetailModal 
      :is-open="showDetailModal" 
      :wallet="selectedWallet" 
      @close="showDetailModal = false" 
    />
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Trash2 } from 'lucide-vue-next'

import { useAuthStore } from '../stores/useAuthStore'
import { useWalletStore } from '../stores/useWalletStore'
import { useCurrency } from '../composables/useCurrency'

import AppShell from '../components/layout/AppShell.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppModal from '../components/ui/AppModal.vue'
import AppSkeleton from '../components/ui/AppSkeleton.vue'
import WalletDetailModal from '../components/WalletDetailModal.vue'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const router = useRouter()
const { formatIDR, formatRaw } = useCurrency()

const showAddModal = ref(false)
const showDetailModal = ref(false)
const selectedWallet = ref(null)
const newWalletName = ref('')
const newWalletBalance = ref(0)

const isLoading = computed(() => walletStore.loading)

onMounted(async () => {
  await walletStore.fetchWallets()
})

const totalBalance = computed(() => {
  return walletStore.wallets.reduce((sum, w) => sum + Number(w.balance), 0)
})

const getWalletColor = (idx) => {
  const colors = [
    'bg-primary-600',
    'bg-emerald-600',
    'bg-slate-900',
    'bg-indigo-600',
    'bg-rose-600',
    'bg-amber-600'
  ]
  return colors[idx % colors.length]
}

const openDetail = (wallet) => {
  selectedWallet.value = wallet
  showDetailModal.value = true
}

const submitWallet = async () => {
  if (!newWalletName.value) return;
  const success = await walletStore.createWallet(newWalletName.value, newWalletBalance.value)
  if (success) {
    showAddModal.value = false
    newWalletName.value = ''
    newWalletBalance.value = 0
  }
}

const deleteWallet = async (id) => {
  if (confirm(t('wallets.delete_confirm'))) {
    await walletStore.deleteWallet(id)
  }
}

const handleLogout = async () => { await authStore.logout(); router.push('/login') }

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.wallet-card {
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: var(--radius-2xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-xl);
  transition: all var(--transition-base);
  overflow: hidden;
  border-bottom: 4px solid rgba(0, 0, 0, 0.1);
}

.wallet-card-wrapper:hover .wallet-card {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.2);
}

.info-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bg-primary-600 { background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800)); }
.bg-emerald-600 { background: linear-gradient(135deg, var(--color-success), #065f46); }
.bg-slate-900 { background: linear-gradient(135deg, #1e293b, #0f172a); }
.bg-rose-600 { background: linear-gradient(135deg, var(--color-danger), #9f1239); }
.bg-amber-600 { background: linear-gradient(135deg, var(--color-warning), #92400e); }
</style>
