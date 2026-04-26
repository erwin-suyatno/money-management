import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './useAuthStore'
import { useWalletStore } from './useWalletStore'

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [],
    analyticsTransactions: [], // Data for charts/analytics
    loading: false,
    error: null,
    hasMore: true,
    totalCount: 0
  }),
  actions: {
    async fetchTransactions({ startDate = null, endDate = null, offset = 0, limit = 20, append = false } = {}) {
      this.loading = true
      this.error = null

      const authStore = useAuthStore()
      if (!authStore.activeWorkspaceId) {
        this.transactions = []
        this.loading = false
        return
      }

      let query = supabase
        .from('transactions')
        .select(`
          *,
          wallets(name),
          categories (
            id,
            name,
            icon,
            color,
            category_types (
              code,
              name
            )
          )
        `, { count: 'exact' })
        .eq('workspace_id', authStore.activeWorkspaceId)

      // Apply date filters if provided (useful for Calendar view)
      if (startDate) query = query.gte('created_at', startDate)
      if (endDate) query = query.lte('created_at', endDate)

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        this.error = error.message
        this.loading = false
        return false
      }

      if (append) {
        // Merge and avoid duplicates by ID
        const existingIds = new Set(this.transactions.map(tx => tx.id))
        const uniqueNewData = (data || []).filter(tx => !existingIds.has(tx.id))
        this.transactions = [...this.transactions, ...uniqueNewData]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } else {
        this.transactions = data || []
      }

      this.totalCount = count || 0
      // If we are fetching a specific range (Calendar), hasMore might not be relevant for the global list
      // but we can update it based on the count returned for the current query
      this.hasMore = this.transactions.length < this.totalCount
      
      this.loading = false
      return true
    },
    
    async fetchAnalyticsData({ startDate = null, endDate = null } = {}) {
      this.loading = true
      this.error = null

      const authStore = useAuthStore()
      if (!authStore.activeWorkspaceId) {
        this.analyticsTransactions = []
        this.loading = false
        return
      }

      let query = supabase
        .from('transactions')
        .select(`
          id,
          amount,
          type,
          created_at,
          category_id,
          categories (
            name,
            color
          )
        `)
        .eq('workspace_id', authStore.activeWorkspaceId)

      if (startDate) query = query.gte('created_at', startDate)
      if (endDate) query = query.lte('created_at', endDate)

      const { data, error } = await query.order('created_at', { ascending: true })

      if (error) {
        this.error = error.message
        this.loading = false
        return false
      }

      this.analyticsTransactions = data || []
      this.loading = false
      return true
    },

    async addTransaction(wallet_id, type, amount, description, createdAt = null, category_id = null) {
      this.loading = true
      this.error = null

      const authStore = useAuthStore()
      if (!authStore.user || !authStore.activeWorkspaceId) return false

      const insertData = {
        wallet_id,
        type,
        amount,
        description,
        category_id,
        created_by: authStore.user.id,
        workspace_id: authStore.activeWorkspaceId
      }

      // If a custom date is provided, use it for created_at
      if (createdAt) {
        insertData.created_at = createdAt
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([insertData])
        .select(`
          *,
          wallets(name),
          categories (
            id, 
            name, 
            icon, 
            color,
            category_types (code, name)
          )
        `)
        .maybeSingle()

      if (error) {
        this.error = error.message
        this.loading = false
        return false
      } else if (!data) {
        this.error = "Transaction recorded but failed to retrieve detail."
        this.loading = false
        return false
      } else {
        this.transactions.unshift(data)

        // Refresh wallet balances
        const walletStore = useWalletStore()
        await walletStore.fetchWallets()

        this.loading = false
        return true
      }
    },

    async updateTransaction(id, updates) {
      this.loading = true
      this.error = null

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          wallets(name),
          categories (
            id, 
            name, 
            icon, 
            color,
            category_types (code, name)
          )
        `)
        .maybeSingle()

      if (error) {
        this.error = error.message
        this.loading = false
        return false
      } else if (!data) {
        this.error = "Update failed: record not found."
        this.loading = false
        return false
      } else {
        const index = this.transactions.findIndex(tx => tx.id === id)
        if (index !== -1) {
          this.transactions[index] = data
        }

        // Refresh wallet balances
        const walletStore = useWalletStore()
        await walletStore.fetchWallets()

        this.loading = false
        return true
      }
    },

    async deleteTransaction(id) {
      this.loading = true
      this.error = null

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) {
        this.error = error.message
        this.loading = false
        return false
      } else {
        this.transactions = this.transactions.filter(tx => tx.id !== id)

        // Refresh wallet balances
        const walletStore = useWalletStore()
        await walletStore.fetchWallets()

        this.loading = false
        return true
      }
    }
  }
})
