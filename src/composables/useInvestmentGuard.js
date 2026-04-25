import { computed } from 'vue'
import { useEmergencyFund } from './useEmergencyFund'
import { useWalletStore } from '../stores/useWalletStore'

/**
 * useInvestmentGuard
 * Logic to prevent risky investments before basic foundations are solid.
 */
export function useInvestmentGuard() {
  const ef = useEmergencyFund()
  const walletStore = useWalletStore()

  // 1. Is Emergency Fund full?
  const isEfReady = computed(() => (ef.progressPercentage.value || 0) >= 100)

  // 2. Is there enough Cash Buffer? 
  // Defined as having cash in hand >= 1 month of current expenses, 
  // SEPARATE from the emergency fund target (The EF is for 6-12 months, 
  // but you need the 1st month in liquidity to even survive the month).
  const currentCash = computed(() => {
    return walletStore.wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0)
  })

  const cashBufferRequirement = computed(() => ef.averageMonthlyExpense.value || 0)

  const hasCashBuffer = computed(() => {
    // Current cash must be at least 1 month expense
    return currentCash.value >= cashBufferRequirement.value
  })

  const isSafeToInvest = computed(() => isEfReady.value && hasCashBuffer.value)

  const guardStatus = computed(() => {
    if (isSafeToInvest.value) return 'SAFE'
    if (isEfReady.value) return 'LOW_BUFFER' // EF Done, but liquidity low
    return 'DANGER' // EF or Basics not done
  })

  const advice = computed(() => {
    if (guardStatus.value === 'SAFE') {
      return 'guard.investment_safe_advice'
    }
    if (guardStatus.value === 'LOW_BUFFER') {
      return 'guard.investment_low_buffer_advice'
    }
    return 'guard.investment_danger_advice'
  })

  return {
    isSafeToInvest,
    isEfReady,
    hasCashBuffer,
    guardStatus,
    advice,
    cashBufferRequirement,
    currentCash
  }
}
