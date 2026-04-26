import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './useAuthStore'
import { useTransactionStore } from './useTransactionStore'

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    budgets: [],
    loading: false,
    error: null
  }),

  getters: {
    // Calculates spent amount and metrics for each budget
    budgetsWithStats: (state) => {
      const txStore = useTransactionStore()

      return state.budgets.map(budget => {
        const { start, end } = calculatePeriodRange(budget.period_type)

        const spent = txStore.transactions
          .filter(tx => {
            const txDate = new Date(tx.created_at)
            return (
              tx.category_id === budget.category_id &&
              tx.type === 'EXPENSE' &&
              txDate >= start &&
              txDate <= end
            )
          })
          .reduce((sum, tx) => sum + Number(tx.amount), 0)

        const percentage = Math.min((spent / budget.amount) * 100, 1000) // Caps at 1000% for extreme cases
        const remaining = Math.max(budget.amount - spent, 0)
        const isOver = spent > budget.amount

        return {
          ...budget,
          spent,
          remaining,
          percentage,
          isOver,
          periodRange: { start, end }
        }
      })
    }
  },

  actions: {
    async fetchBudgets() {
      this.loading = true
      this.error = null

      const authStore = useAuthStore()
      if (!authStore.activeWorkspaceId) {
        this.budgets = []
        this.loading = false
        return
      }

      try {
        const { data, error } = await supabase
          .from('budgets')
          .select(`
            *,
            categories (
              id,
              name,
              icon,
              color,
              category_types (code, name)
            )
          `)
          .eq('workspace_id', authStore.activeWorkspaceId)
          .order('created_at', { ascending: false })

        if (error) throw error
        this.budgets = data || []
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async addBudget(payload) {
      this.loading = true
      const authStore = useAuthStore()
      if (!authStore.activeWorkspaceId) {
        this.error = "Workspace not selected"
        this.loading = false
        return false
      }

      try {
        const { data, error } = await supabase
          .from('budgets')
          .insert([{
            ...payload,
            user_id: authStore.user?.id,
            workspace_id: authStore.activeWorkspaceId
          }])
          .select(`
            *,
            categories (id, name, icon, color, category_types (code, name))
          `)
          .single()

        if (error) throw error
        this.budgets.unshift(data)
        return true
      } catch (err) {
        this.error = err.message
        return false
      } finally {
        this.loading = false
      }
    },

    async updateBudget(id, updates) {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('budgets')
          .update(updates)
          .eq('id', id)
          .select(`
            *,
            categories (id, name, icon, color, category_types (code, name))
          `)
          .single()

        if (error) throw error
        const index = this.budgets.findIndex(b => b.id === id)
        if (index !== -1) this.budgets[index] = data
        return true
      } catch (err) {
        this.error = err.message
        return false
      } finally {
        this.loading = false
      }
    },

    async deleteBudget(id) {
      this.loading = true
      try {
        const { error } = await supabase
          .from('budgets')
          .delete()
          .eq('id', id)

        if (error) throw error
        this.budgets = this.budgets.filter(b => b.id !== id)
        return true
      } catch (err) {
        this.error = err.message
        return false
      } finally {
        this.loading = false
      }
    }
  }
})

/**
 * Utility to calculate the start and end of the current period based on type
 */
function calculatePeriodRange(period) {
  const now = new Date()
  let start = new Date(now)
  let end = new Date(now)

  switch (period) {
    case 'DAILY':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'WEEKLY':
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Start from Monday
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    case 'MONTHLY':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'YEARLY':
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31)
      end.setHours(23, 59, 59, 999)
      break
  }

  return { start, end }
}
