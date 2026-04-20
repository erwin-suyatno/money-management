import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: true,
    error: null
  }),
  actions: {
    async initialize() {
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      this.user = session ? session.user : null
      this.loading = false

      supabase.auth.onAuthStateChange((_event, session) => {
        this.session = session
        this.user = session ? session.user : null
      })
    },
    async loginWithGoogle() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) {
        console.error('Login error:', error.message)
      }
    },
    async logout() {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error.message)
      }
      this.session = null
      this.user = null
    },
    async updateFinancialProfile(profileData) {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: { financial_profile: profileData }
        })
        if (error) throw error
        this.user = data.user
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
