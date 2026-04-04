import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './useAuthStore'

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    wallets: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchWallets() {
      this.loading = true
      this.error = null
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: false })
        
      if (error) {
        this.error = error.message
        console.error('Error fetching wallets:', error)
      } else {
        this.wallets = data || []
      }
      this.loading = false
    },
    
    async createWallet(name, initialBalance = 0) {
      this.loading = true
      this.error = null
      
      const authStore = useAuthStore()
      if (!authStore.user) {
        this.error = "User not logged in"
        this.loading = false
        return false
      }

      const { data, error } = await supabase
        .from('wallets')
        .insert([
          { 
            name, 
            balance: initialBalance,
            user_id: authStore.user.id
          }
        ])
        .select()
        .single()
        
      if (error) {
        this.error = error.message
        console.error('Error creating wallet:', error)
        this.loading = false
        return false
      } else {
        this.wallets.unshift(data)
        this.loading = false
        return true
      }
    },

    async deleteWallet(id) {
      this.loading = true
      this.error = null
      
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', id)
        
      if (error) {
        this.error = error.message
        console.error('Error deleting wallet:', error)
        this.loading = false
        return false
      } else {
        this.wallets = this.wallets.filter(w => w.id !== id)
        this.loading = false
        return true
      }
    }
  }
})
