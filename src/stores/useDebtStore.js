import { defineStore } from 'pinia'
import { useTransactionStore } from './useTransactionStore'
import { useCategoryStore } from './useCategoryStore'
import { useAuthStore } from './useAuthStore'
import { supabase } from '../services/supabase'
import { computed, ref } from 'vue'

export const useDebtStore = defineStore('debt', () => {
  const transactionStore = useTransactionStore()
  const categoryStore = useCategoryStore()
  const authStore = useAuthStore()

  const debts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // keywords to identify debt-related categories (legacy support)
  const debtKeywords = ['hutang', 'cicilan', 'debt', 'loan', 'credit card', 'pinjaman', 'kpr']

  /**
   * Fetch all debts
   */
  async function fetchDebts() {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('debts')
        .select(`
          *,
          categories (id, name, color, icon)
        `)
        .order('created_at', { ascending: false })

      if (err) throw err
      debts.value = data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching debts:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Add new debt
   */
  async function addDebt(payload) {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('debts')
        .insert([{ ...payload, user_id: authStore.user?.id }])
        .select()
        .single()

      if (err) throw err
      debts.value.unshift(data)
      return data
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update debt
   */
  async function updateDebt(id, payload) {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('debts')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err
      const index = debts.value.findIndex(d => d.id === id)
      if (index !== -1) debts.value[index] = data
      return data
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete debt
   */
  async function deleteDebt(id) {
    loading.value = true
    try {
      const { error: err } = await supabase.from('debts').delete().eq('id', id)
      if (err) throw err
      debts.value = debts.value.filter(d => d.id !== id)
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Calculated Debts with Progress
   */
  const debtsWithStats = computed(() => {
    return debts.value.map(debt => {
      // Calculate payments made to this specific debt
      const payments = transactionStore.transactions.filter(tx => tx.debt_id === debt.id)
      const totalPaid = payments.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0)
      
      // Calculate tenure progress
      const startDate = new Date(debt.start_date)
      const today = new Date()
      const monthsElapsed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth())
      const currentTenure = Math.min(Math.max(monthsElapsed + 1, 0), debt.tenure_months)
      
      const remainingBalance = Math.max(debt.total_principal - totalPaid, 0)
      const percentagePaid = (totalPaid / debt.total_principal) * 100

      return {
        ...debt,
        totalPaid,
        remainingBalance,
        percentagePaid,
        currentTenure,
        remainingTenure: Math.max(debt.tenure_months - currentTenure, 0),
        isOverdue: currentTenure > debt.tenure_months && remainingBalance > 0
      }
    })
  })

  /**
   * Global stats for DTI Ratio
   */
  const monthlyDebtObligation = computed(() => {
    // Sum of monthly payments for all ACTIVE debts
    return debts.value
      .filter(d => d.status === 'ACTIVE')
      .reduce((sum, d) => sum + Number(d.monthly_payment), 0)
  })

  const monthlyIncome = computed(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return transactionStore.transactions
      .filter(tx => {
        const txDate = new Date(tx.created_at)
        return (
          tx.type === 'INCOME' && 
          txDate.getMonth() === currentMonth && 
          txDate.getFullYear() === currentYear
        )
      })
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
  })

  const dtiRatio = computed(() => {
    if (monthlyIncome.value === 0) return monthlyDebtObligation.value > 0 ? 100 : 0
    return (monthlyDebtObligation.value / monthlyIncome.value) * 100
  })

  const dtiStatus = computed(() => {
    const ratio = dtiRatio.value
    if (ratio === 0 && monthlyDebtObligation.value === 0) return 'safe'
    if (ratio < 30) return 'healthy'
    if (ratio <= 50) return 'warning'
    return 'critical'
  })

  return {
    debts,
    loading,
    error,
    debtsWithStats,
    monthlyDebtObligation,
    monthlyIncome,
    dtiRatio,
    dtiStatus,
    fetchDebts,
    addDebt,
    updateDebt,
    deleteDebt
  }
})
