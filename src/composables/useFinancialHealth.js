import { computed } from 'vue'
import { useWalletStore } from '../stores/useWalletStore'
import { useDebtStore } from '../stores/useDebtStore'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useEmergencyFund } from './useEmergencyFund'

export function useFinancialHealth() {
  const walletStore = useWalletStore()
  const debtStore = useDebtStore()
  const transactionStore = useTransactionStore()
  const ef = useEmergencyFund()

  // 1. Safety Starter (Total Balance >= 10jt)
  const isLevel1Complete = computed(() => {
    const totalBalance = walletStore.wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0)
    return totalBalance >= 10000000
  })

  // 2. Consumer Debt Freedom (DTI < 30%)
  const isLevel2Complete = computed(() => {
    // Healthy if DTI is Low or no debts
    if (debtStore.debts.length === 0) return true
    return debtStore.dtiStatus === 'Healthy'
  })

  // 3. Emergency Fund Full (100%)
  const isLevel3Complete = computed(() => {
    return ef.progressPercentage.value >= 100
  })

  // 4. Investment Master (Invest Rate >= 20%)
  const isLevel4Complete = computed(() => {
    const txs = transactionStore.transactions
    if (txs.length === 0) return false

    // Average monthly income
    const income = txs.filter(tx => tx.type === 'INCOME').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
    
    // Average monthly investment (category code containing 'INVEST' or 'TABUNGAN')
    const invest = txs.filter(tx => 
      tx.type === 'EXPENSE' && 
      tx.categories?.name?.toUpperCase().includes('INVEST')
    ).reduce((sum, tx) => sum + Math.abs(Number(tx.amount) || 0), 0)

    if (income <= 0) return false
    return (invest / income) >= 0.20
  })

  // 5. Children Education / Long Term Goals
  const isLevel5Complete = computed(() => {
    // Detection logic: has categories related to Education goal with budget
    // For now, checks if level 1-4 are done
    return isLevel1Complete.value && isLevel2Complete.value && isLevel3Complete.value && isLevel4Complete.value
  })

  const levels = computed(() => [
    {
      id: 1,
      name: 'Safety Starter',
      description: 'Tabungan awal Rp 10 Juta tercapai.',
      isCompleted: isLevel1Complete.value,
      requirement: 'Total Saldo >= Rp 10.000.000'
    },
    {
      id: 2,
      name: 'Debt Free Life',
      description: 'Hutang terkendali atau tidak ada.',
      isCompleted: isLevel2Complete.value,
      requirement: 'Rasio Hutang (DTI) < 30%'
    },
    {
      id: 3,
      name: 'Emergency Guard',
      description: 'Dana darurat terkumpul penuh.',
      isCompleted: isLevel3Complete.value,
      requirement: 'EF 100% Sesuai Profil'
    },
    {
      id: 4,
      name: 'Invest Master',
      description: 'Berinvestasi minimal 20% penghasilan.',
      isCompleted: isLevel4Complete.value,
      requirement: 'Invest Rate >= 20%'
    },
    {
      id: 5,
      name: 'Wealth Architect',
      description: 'Membangun aset masa depan & pendidikan.',
      isCompleted: isLevel5Complete.value,
      requirement: 'Semua fondasi dasar kokoh'
    }
  ])

  const currentLevel = computed(() => {
    const completed = levels.value.filter(l => l.isCompleted).length
    return completed
  })

  // Dynamic Health Score (0-100)
  const healthScore = computed(() => {
    const completedCount = levels.value.filter(l => l.isCompleted).length
    const totalCount = levels.value.length
    // Base score from levels (e.g. 5 levels = 80 points) + bonus for EF progress
    const levelScore = (completedCount / totalCount) * 90
    const efBonus = (ef.progressPercentage.value / 100) * 10
    return Math.min(Math.round(levelScore + efBonus), 100)
  })

  return {
    levels,
    currentLevel,
    healthScore,
    isLevel1Complete,
    isLevel2Complete,
    isLevel3Complete,
    isLevel4Complete,
    isLevel5Complete
  }
}
