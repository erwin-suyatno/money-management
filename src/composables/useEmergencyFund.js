import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/useAuthStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useWalletStore } from '../stores/useWalletStore'
import { useBudgetStore } from '../stores/useBudgetStore'

export function useEmergencyFund() {
  const authStore = useAuthStore()
  const transactionStore = useTransactionStore()
  const walletStore = useWalletStore()
  const budgetStore = useBudgetStore()

  // Use storeToRefs for direct reactive state access
  const { user } = storeToRefs(authStore)
  const { transactions } = storeToRefs(transactionStore)
  const { budgets } = storeToRefs(budgetStore)
  const { wallets } = storeToRefs(walletStore)

  const profile = computed(() => user.value?.user_metadata?.financial_profile || { status: 'single', multiplier: 6 })
  const multiplier = computed(() => Number(profile.value.multiplier) || 6)

  const averageMonthlyExpense = computed(() => {
    // 1. Budget Priority
    if (budgets.value && budgets.value.length > 0) {
      return budgets.value.reduce((sum, b) => {
        const amount = Number(b.amount) || 0
        switch (b.period_type) {
          case 'DAILY': return sum + (amount * 30)
          case 'WEEKLY': return sum + (amount * 4)
          case 'MONTHLY': return sum + amount
          case 'YEARLY': return sum + (amount / 12)
          default: return sum + amount
        }
      }, 0)
    }

    // 2. Transaction Fallback
    const expenses = transactions.value.filter(tx => tx.type === 'EXPENSE')
    if (expenses.length === 0) return 0
    const months = new Set(expenses.map(tx => {
      const d = new Date(tx.created_at)
      return `${d.getMonth()}-${d.getFullYear()}`
    }))
    const totalAmount = expenses.reduce((sum, tx) => sum + Math.abs(Number(tx.amount) || 0), 0)
    return totalAmount / Math.max(months.size, 1)
  })

  const targetAmount = computed(() => (averageMonthlyExpense.value || 0) * multiplier.value)
  const currentBalance = computed(() => wallets.value.reduce((sum, w) => sum + (Number(w.balance) || 0), 0))
  
  const progressPercentage = computed(() => {
    const target = targetAmount.value
    if (!target || target <= 0) return currentBalance.value > 0 ? 100 : 0
    return Math.min((currentBalance.value / target) * 100, 100)
  })

  const gapAmount = computed(() => Math.max(targetAmount.value - currentBalance.value, 0))

  const monthlySavingCapability = computed(() => {
    if (!transactions.value || transactions.value.length === 0) return 0
    const income = transactions.value.filter(tx => tx.type === 'INCOME').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
    const expense = transactions.value.filter(tx => tx.type === 'EXPENSE').reduce((sum, tx) => sum + Math.abs(Number(tx.amount) || 0), 0)
    const months = new Set(transactions.value.map(tx => {
      const d = new Date(tx.created_at)
      return `${d.getMonth()}-${d.getFullYear()}`
    }))
    return (income - expense) / Math.max(months.size, 1)
  })

  const estimatedMonthsToGoal = computed(() => {
    const gap = gapAmount.value
    const saving = monthlySavingCapability.value
    if (gap <= 0) return 0
    if (saving <= 0) return null
    return Math.ceil(gap / saving)
  })

  return {
    profile,
    multiplier,
    averageMonthlyExpense,
    targetAmount,
    currentBalance,
    progressPercentage,
    gapAmount,
    monthlySavingCapability,
    estimatedMonthsToGoal
  }
}
