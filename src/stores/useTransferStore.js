import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './useAuthStore'
import { useWalletStore } from './useWalletStore'

export const useTransferStore = defineStore('transfer', {
  state: () => ({
    transfers: [],
    loading: false,
    error: null,
    isTableMissing: false
  }),
  actions: {
    async fetchTransfers() {
      if (this.isTableMissing) {
        this.transfers = [
          { id: 'd1', amount: 500000, description: 'Bank to Wallet', from_wallet: { name: 'BCA' }, to_wallet: { name: 'E-Wallet' }, created_at: new Date().toISOString() }
        ]
        return
      }

      this.loading = true
      this.error = null
      
      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          from_wallet:from_wallet_id (name),
          to_wallet:to_wallet_id (name)
        `)
        .order('created_at', { ascending: false })
        
      if (error) {
        if (error.code === '42P01' || error.message.includes('not found')) {
           this.isTableMissing = true
           this.transfers = [
             { id: 'd1', amount: 500000, description: 'Bank to Wallet', from_wallet: { name: 'BCA' }, to_wallet: { name: 'E-Wallet' }, created_at: new Date().toISOString() }
           ]
        } else {
           this.error = error.message
        }
      } else {
        this.transfers = data || []
      }
      this.loading = false
    },
    
    async addTransfer(from_wallet_id, to_wallet_id, amount, description) {
      this.loading = true
      this.error = null
      
      const authStore = useAuthStore()
      if (!authStore.user) return false

      if (from_wallet_id === to_wallet_id) {
         this.error = "Cannot transfer to the same wallet"
         this.loading = false
         return false
      }

      if (amount <= 0) {
         this.error = "Amount must be greater than 0"
         this.loading = false
         return false
      }

      const { data, error } = await supabase
        .from('transfers')
        .insert([{ 
            from_wallet_id, 
            to_wallet_id, 
            amount, 
            description,
            created_by: authStore.user.id
        }])
        .select(`
          *,
          from_wallet:from_wallet_id (name),
          to_wallet:to_wallet_id (name)
        `)
        .maybeSingle()
        
      if (error) {
        // Handle trigger exception
        this.error = error.message.includes('Insufficient balance') ? 'Insufficient balance in source wallet' : error.message
        this.loading = false
        return false
      } else if (!data) {
        this.error = "Transfer recorded but failed to retrieve detail."
        this.loading = false
        return false
      } else {
        this.transfers.unshift(data)
        
        // Refresh wallets
        const walletStore = useWalletStore()
        await walletStore.fetchWallets()
        
        this.loading = false
        return true
      }
    },

    async updateTransfer(id, updates) {
      this.loading = true
      this.error = null

      const { data, error } = await supabase
        .from('transfers')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          from_wallet:from_wallet_id (name),
          to_wallet:to_wallet_id (name)
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
        const index = this.transfers.findIndex(t => t.id === id)
        if (index !== -1) {
          this.transfers[index] = data
        }

        // Refresh wallets
        const walletStore = useWalletStore()
        await walletStore.fetchWallets()

        this.loading = false
        return true
      }
    },

    async deleteTransfer(id) {
      this.loading = true
      this.error = null

      const { error } = await supabase
        .from('transfers')
        .delete()
        .eq('id', id)

      if (error) {
        this.error = error.message
        this.loading = false
        return false
      } else {
        this.transfers = this.transfers.filter(t => t.id !== id)

        // Refresh wallets
        const walletStore = useWalletStore()
        await walletStore.fetchWallets()

        this.loading = false
        return true
      }
    }
  }
})
