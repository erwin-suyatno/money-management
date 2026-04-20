<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    page-title="Dana Darurat"
    @logout="handleLogout"
  >
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div class="animate-slide-up">
        <h2 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Pos Keamanan (Emergency Fund)</h2>
        <p class="text-sm text-slate-500 font-medium">Lindungi dirimu dari ketidakpastian finansial.</p>
      </div>

      <div class="flex items-center gap-3 animate-slide-up">
         <div class="px-4 py-2 bg-primary-50 dark:bg-primary-900/10 rounded-2xl flex items-center gap-2">
            <span class="text-[10px] font-black uppercase text-primary-600 dark:text-primary-400">Level Multiplier:</span>
            <span class="text-xs font-black text-slate-900 dark:text-white">{{ multiplier }}x Pengeluaran</span>
         </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-slide-up" style="animation-delay: 100ms">
       <!-- Main Progress Card -->
       <AppCard class="lg:col-span-2 relative overflow-hidden group !p-10 border-slate-100 dark:border-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div class="absolute -right-24 -top-24 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl"></div>
          
          <div class="flex flex-col md:flex-row items-center gap-12 relative z-10">
             <!-- Circular Progress -->
             
             <div class="relative w-48 h-48 shrink-0">
                <svg class="w-full h-full transform -rotate-90">
                   <circle 
                     cx="96" cy="96" r="88" 
                     class="stroke-slate-100 dark:stroke-gray-800" 
                     stroke-width="12" fill="transparent" 
                   />
                   <circle 
                     cx="96" cy="96" r="88" 
                     class="stroke-primary-600 transition-all duration-1000 ease-out" 
                     stroke-width="12" fill="transparent"
                     stroke-linecap="round"
                     :stroke-dasharray="2 * Math.PI * 88"
                     :stroke-dashoffset="2 * Math.PI * 88 * (1 - progressPercentage / 100)"
                   />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                   <span class="text-4xl font-black text-slate-900 dark:text-white italic tabular-nums">{{ Math.round(progressPercentage) }}%</span>
                   <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Terpenuhi</span>
                </div>
             </div>

             <div class="flex-1 space-y-6">
                <div>
                   <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Target Dana Darurat</p>
                   <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ formatIDR(targetAmount) }}</h3>
                </div>
                
                <div class="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-gray-800">
                   <div>
                      <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Saldo Saat Ini</p>
                      <p class="text-lg font-black dark:text-white tabular-nums">{{ formatIDR(currentBalance) }}</p>
                   </div>
                   <div>
                      <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Kurang (Gap)</p>
                      <p class="text-lg font-black text-rose-500 tabular-nums">{{ formatIDR(gapAmount) }}</p>
                   </div>
                </div>
             </div>
          </div>
       </AppCard>

       <!-- Estimation Card -->
       <AppCard class="bg-slate-900 text-white !p-8 flex flex-col justify-center border-none shadow-2xl shadow-slate-900/20">
          <div class="flex items-center gap-4 mb-8">
             <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary-400 ring-4 ring-white/5">
                <Timer :size="24" />
             </div>
             <div>
                <h4 class="text-sm font-black uppercase tracking-tight">Estimasi Waktu</h4>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kecepatan Menabung</p>
             </div>
          </div>

          <div class="space-y-6">
             <div v-if="progressPercentage >= 100" class="text-center py-4">
                <div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                   <CheckCircle :size="32" />
                </div>
                <h3 class="text-xl font-black mb-1">Target Tercapai!</h3>
                <p class="text-xs text-slate-400 font-medium">Dana daruratmu sudah aman dan terjaga.</p>
             </div>
             <div v-else>
                <h3 class="text-5xl font-black italic tracking-tighter text-primary-400 mb-2">
                   {{ estimatedMonthsToGoal === null ? '∞' : estimatedMonthsToGoal }}
                   <span class="text-sm font-black uppercase not-italic text-white">Bulan</span>
                </h3>
                <p v-if="estimatedMonthsToGoal === null" class="text-xs text-rose-400 font-medium leading-relaxed">
                   Pengeluaranmu saat ini masih lebih besar dari pemasukan. Kurangi pengeluaran agar bisa mulai menabung.
                </p>
                <p v-else class="text-xs text-slate-400 font-medium leading-relaxed">
                   Berdasarkan rata-rata surplus bulananmu sebesar 
                   <span class="text-white font-bold">{{ formatIDR(monthlySavingCapability) }}</span>, 
                   kamu akan mencapai target dalam kurun waktu tersebut.
                </p>
             </div>
          </div>
       </AppCard>
    </div>

    <!-- Recommendations Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style="animation-delay: 200ms">
       <AppCard class="flex flex-col gap-4 group hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
             <Calculator :size="20" />
          </div>
          <div>
             <h4 class="text-sm font-black dark:text-white uppercase tracking-tight mb-1">Basis Perhitungan</h4>
             <p class="text-xs text-slate-500 leading-relaxed font-medium">
                Target dihitung dari rata-rata pengeluaran bulananmu sebesar 
                <span class="font-bold text-slate-900 dark:text-white">{{ formatIDR(averageMonthlyExpense) }}</span> dikali multiplier profilmu.
             </p>
          </div>
       </AppCard>

       <AppCard class="flex flex-col gap-4 group hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
             <ShieldCheck :size="20" />
          </div>
          <div>
             <h4 class="text-sm font-black dark:text-white uppercase tracking-tight mb-1">Keamanan Finansial</h4>
             <p class="text-xs text-slate-500 leading-relaxed font-medium">
                Dana darurat adalah prioritas nomor #1 sebelum kamu mulai berinvestasi di aset berisiko.
             </p>
          </div>
       </AppCard>

       <AppCard class="flex flex-col gap-4 group hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
             <AlertCircle :size="20" />
          </div>
          <div>
             <h4 class="text-sm font-black dark:text-white uppercase tracking-tight mb-1">Kapan Digunakan?</h4>
             <p class="text-xs text-slate-500 leading-relaxed font-medium">
                Hanya gunakan dana ini untuk keadaan mendesak: Kehilangan pekerjaan, sakit, atau perbaikan infrastruktur darurat.
             </p>
          </div>
       </AppCard>
    </div>
  </AppShell>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Timer, Calculator, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-vue-next'
import { useAuthStore } from '../stores/useAuthStore'
import { useEmergencyFund } from '../composables/useEmergencyFund'
import { useCurrency } from '../composables/useCurrency'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useBudgetStore } from '../stores/useBudgetStore'
import { useWalletStore } from '../stores/useWalletStore'
import AppShell from '../components/layout/AppShell.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'

const authStore = useAuthStore()
const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()
const walletStore = useWalletStore()

// Destructure for better reactivity in template
const {
  profile,
  multiplier,
  progressPercentage,
  targetAmount,
  currentBalance,
  gapAmount,
  totalMonthlyExpense,
  averageMonthlyExpense,
  monthlySavingCapability,
  estimatedMonthsToGoal
} = useEmergencyFund()

const { formatIDR } = useCurrency()
const router = useRouter()

// Standard page data initialization
onMounted(async () => {
  try {
    // Parallel fetch for speed
    await Promise.all([
      transactionStore.fetchTransactions(),
      budgetStore.fetchBudgets(),
      walletStore.fetchWallets()
    ])
  } catch (error) {
    console.error('Failed to initialize Emergency Fund data:', error)
  }
})

const handleLogout = async () => { await authStore.logout(); router.push('/login') }
</script>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
