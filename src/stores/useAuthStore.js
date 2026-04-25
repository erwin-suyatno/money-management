import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    workspaces: [],
    activeWorkspaceId: null,
    loading: true,
    error: null
  }),
  actions: {
    async initialize() {
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      this.user = session ? session.user : null
      
      if (this.user) {
        await this.fetchWorkspaces()
      }

      this.loading = false

      supabase.auth.onAuthStateChange(async (_event, session) => {
        this.session = session
        this.user = session ? session.user : null
        if (this.user) {
          await this.fetchWorkspaces()
        } else {
          this.workspaces = []
          this.activeWorkspaceId = null
        }
      })
    },
    async fetchWorkspaces() {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
      
      if (error) {
        console.error('Error fetching workspaces:', error)
        return
      }

      this.workspaces = data || []
      // Set active workspace to Personal by default
      const personal = this.workspaces.find(w => w.type === 'personal')
      if (personal) {
        this.activeWorkspaceId = personal.id
      } else if (this.workspaces.length > 0) {
        this.activeWorkspaceId = this.workspaces[0].id
      }
    },
    async setActiveWorkspace(id) {
      this.activeWorkspaceId = id
      // You could trigger global refreshes here if needed
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
