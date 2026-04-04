import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './useAuthStore'
import { useWalletStore } from './useWalletStore'

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchTransactions() {
      this.loading = true
      this.error = null

      const { data, error } = await supabase
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
        `)
        .order('created_at', { ascending: false })

      if (error) {
        this.error = error.message
      } else {
        this.transactions = data || []
      }
      this.loading = false
    },

    async addTransaction(wallet_id, type, amount, description, createdAt = null, category_id = null) {
      this.loading = true
      this.error = null

      const authStore = useAuthStore()
      if (!authStore.user) return false

      const insertData = {
        wallet_id,
        type,
        amount,
        description,
        category_id,
        created_by: authStore.user.id
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
