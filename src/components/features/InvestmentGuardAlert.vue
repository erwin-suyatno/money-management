<template>
  <div v-if="!isSafeToInvest" class="relative overflow-hidden rounded-3xl group border-none">
    <!-- Animated background for warning -->
    <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-500/10 dark:from-amber-500/5 dark:to-rose-500/5 -z-0"></div>
    
    <AppCard class="relative z-10 border-amber-500/20 shadow-xl shadow-amber-500/5">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
        <!-- Visual Warning -->
        <div class="w-16 h-16 shrink-0 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
          <ShieldAlert :size="32" stroke-width="2.5" />
        </div>

        <div class="space-y-2 flex-1">
          <h4 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
            Aturan Cash Buffer
          </h4>
          <p class="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
            {{ advice }} Kami menyarankan untuk memenuhi 
            <span class="text-amber-600 dark:text-amber-400 font-bold">Dana Darurat</span> & 
            <span class="text-amber-600 dark:text-amber-400 font-bold">Saldo Mengendap 1 Bulan</span> 
            terlebih dahulu.
          </p>
          
          <!-- Progress bars for requirements -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <div class="flex justify-between text-[10px] font-black uppercase mb-1">
                <span class="text-slate-400">Status Dana Darurat</span>
                <span :class="isEfReady ? 'text-emerald-500' : 'text-amber-500'">{{ ef.progressPercentage.value }}%</span>
              </div>
              <div class="h-1.5 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-emerald-500 transition-all duration-1000"
                  :style="{ width: `${ef.progressPercentage.value}%` }"
                ></div>
              </div>
            </div>
            <div>
               <div class="flex justify-between text-[10px] font-black uppercase mb-1">
                <span class="text-slate-400">Cash Buffer (1 Bln Ekspektasi)</span>
                <span :class="hasCashBuffer ? 'text-emerald-500' : 'text-amber-500'">
                  {{ formatIDR(currentCash) }} / {{ formatIDR(cashBufferRequirement) }}
                </span>
              </div>
              <div class="h-1.5 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  class="h-full transition-all duration-1000"
                  :class="hasCashBuffer ? 'bg-emerald-500' : 'bg-amber-500'"
                  :style="{ width: `${Math.min((currentCash / cashBufferRequirement) * 100, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <AppButton 
          variant="ghost" 
          size="sm" 
          class="shrink-0 border-amber-200 dark:border-gray-800"
          @click="router.push('/emergency-fund')"
        >
          Lihat Detail
        </AppButton>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { ShieldAlert } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useInvestmentGuard } from '../../composables/useInvestmentGuard'
import { useEmergencyFund } from '../../composables/useEmergencyFund'
import { useCurrency } from '../../composables/useCurrency'
import AppCard from '../ui/AppCard.vue'
import AppButton from '../ui/AppButton.vue'

const router = useRouter()
const { isSafeToInvest, advice, isEfReady, hasCashBuffer, currentCash, cashBufferRequirement } = useInvestmentGuard()
const ef = useEmergencyFund()
const { formatIDR } = useCurrency()
</script>
