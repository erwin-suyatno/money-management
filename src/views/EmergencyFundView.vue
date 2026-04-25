<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    page-title="Dana Darurat"
    @logout="handleLogout"
  >
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10 px-1 md:px-0">
      <div class="animate-slide-up">
        <h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
          {{ $t('emergency.title') }}
        </h2>
        <p class="text-xs md:text-sm text-slate-500 font-medium">{{ $t('emergency.subtitle') }}</p>
      </div>

      <div class="flex items-center gap-3 animate-slide-up">
         <div class="px-4 py-2.5 bg-primary-50 dark:bg-primary-900/10 rounded-2xl flex items-center gap-2 shadow-sm shadow-primary-500/5">
            <span class="text-[9px] md:text-[10px] font-black uppercase text-primary-600 dark:text-primary-400">{{ $t('emergency.level_multiplier') }}</span>
            <span class="text-xs font-black text-slate-900 dark:text-white">{{ multiplier }}x {{ $t('emergency.multiplier_desc') }}</span>
         </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-slide-up" style="animation-delay: 100ms">
       <!-- Main Progress Card -->
       <AppCard class="lg:col-span-2 relative overflow-hidden group !p-10 border-slate-100 dark:border-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div class="absolute -right-24 -top-24 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl"></div>
          
          <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-12 relative z-10">
             <!-- Circular Progress -->
             
             <div class="relative w-40 h-40 md:w-48 md:h-48 shrink-0">
                <svg class="w-full h-full transform -rotate-90">
                   <circle 
                     cx="50%" cy="50%" r="45%" 
                     class="stroke-slate-100 dark:stroke-gray-800" 
                     stroke-width="12" fill="transparent" 
                   />
                   <circle 
                     cx="50%" cy="50%" r="45%" 
                     class="stroke-primary-600 transition-all duration-1000 ease-out" 
                     stroke-width="12" fill="transparent"
                     stroke-linecap="round"
                     :stroke-dasharray="2 * Math.PI * 88"
                     :stroke-dashoffset="2 * Math.PI * 88 * (1 - progressPercentage / 100)"
                   />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                   <span class="text-3xl md:text-4xl font-black text-slate-900 dark:text-white italic tabular-nums">{{ Math.round(progressPercentage) }}%</span>
                   <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">{{ $t('emergency.fulfilled') }}</span>
                </div>
             </div>

             <div class="flex-1 space-y-6 text-center lg:text-left">
                <div>
                   <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{{ $t('emergency.target') }}</p>
                   <h3 class="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ formatIDR(targetAmount) }}</h3>
                </div>
                
                <div class="grid grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-slate-100 dark:border-gray-800">
                   <div>
                      <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{{ $t('emergency.current_balance') }}</p>
                      <p class="text-base md:text-lg font-black dark:text-white tabular-nums">{{ formatIDR(currentBalance) }}</p>
                   </div>
                   <div>
                      <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{{ $t('emergency.gap') }}</p>
                      <p class="text-base md:text-lg font-black text-rose-500 tabular-nums">{{ formatIDR(gapAmount) }}</p>
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
                <h4 class="text-sm font-black uppercase tracking-tight">{{ $t('emergency.est_time') }}</h4>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ $t('emergency.saving_speed') }}</p>
             </div>
          </div>

          <div class="space-y-6">
             <div v-if="progressPercentage >= 100" class="text-center py-4">
                <div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                   <CheckCircle :size="32" />
                </div>
                <h3 class="text-xl font-black mb-1">{{ $t('emergency.target_reached') }}</h3>
                <p class="text-xs text-slate-400 font-medium">{{ $t('emergency.reached_desc') }}</p>
             </div>
             <div v-else>
                <h3 class="text-4xl md:text-5xl font-black italic tracking-tighter text-primary-400 mb-2">
                   {{ estimatedMonthsToGoal === null ? '∞' : estimatedMonthsToGoal }}
                   <span class="text-sm font-black uppercase not-italic text-white">{{ $t('emergency.months') }}</span>
                </h3>
                <p v-if="estimatedMonthsToGoal === null" class="text-xs text-rose-400 font-medium leading-relaxed">
                   {{ $t('emergency.low_surplus_msg') }}
                </p>
                <p v-else class="text-xs text-slate-400 font-medium leading-relaxed">
                   {{ $t('emergency.reach_time_desc', { amount: formatIDR(monthlySavingCapability) }) }}
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
             <h4 class="text-sm font-black dark:text-white uppercase tracking-tight mb-1">{{ $t('emergency.calc_basis') }}</h4>
             <p class="text-xs text-slate-500 leading-relaxed font-medium">
                {{ $t('emergency.calc_desc', { amount: formatIDR(averageMonthlyExpense) }) }}
             </p>
          </div>
       </AppCard>

       <AppCard class="flex flex-col gap-4 group hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
             <ShieldCheck :size="20" />
          </div>
          <div>
             <h4 class="text-sm font-black dark:text-white uppercase tracking-tight mb-1">{{ $t('emergency.safety_title') }}</h4>
             <p class="text-xs text-slate-500 leading-relaxed font-medium">
                {{ $t('emergency.safety_desc') }}
             </p>
          </div>
       </AppCard>

       <AppCard class="flex flex-col gap-4 group hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
             <AlertCircle :size="20" />
          </div>
          <div>
             <h4 class="text-sm font-black dark:text-white uppercase tracking-tight mb-1">{{ $t('emergency.usage_title') }}</h4>
             <p class="text-xs text-slate-500 leading-relaxed font-medium">
                {{ $t('emergency.usage_desc') }}
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
