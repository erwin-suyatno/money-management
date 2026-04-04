import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './useAuthStore'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    types: [],
    categories: [],
    loading: false,
    error: null
  }),
  getters: {
    incomeCategories: (state) => state.categories.filter(c => c.category_types?.code === 'INCOME'),
    expenseCategories: (state) => state.categories.filter(c => c.category_types?.code === 'EXPENSE'),
    savingCategories: (state) => state.categories.filter(c => c.category_types?.code === 'SAVING'),
    investmentCategories: (state) => state.categories.filter(c => c.category_types?.code === 'INVESTMENT'),
    
    // Helper to get category by ID with full details
    getCategoryById: (state) => (id) => state.categories.find(c => c.id === id)
  },
  actions: {
    async fetchInitialData() {
      this.loading = true
      this.error = null

      try {
        // Fetch Types first
        const { data: types, error: typesError } = await supabase
          .from('category_types')
          .select('*')
          .order('name', { ascending: true })

        if (typesError) throw typesError
        this.types = types

        // Fetch All Categories for the user (including global)
        const { data: categories, error: catsError } = await supabase
          .from('categories')
          .select(`
            *,
            category_types (
              id,
              code,
              name
            )
          `)
          .is('deleted_at', null)
          .order('name', { ascending: true })

        if (catsError) throw catsError
        this.categories = categories
      } catch (err) {
        this.error = err.message
        console.error('Error fetching categories:', err)
      } finally {
        this.loading = false
      }
    },

    async addCategory(payload) {
      this.loading = true
      const authStore = useAuthStore()
      
      const insertData = {
        ...payload,
        user_id: authStore.user?.id
      }

      console.log('Inserting category with data:', insertData)

      const { data, error } = await supabase
        .from('categories')
        .insert([insertData])
        .select(`
          *,
          category_types (id, code, name)
        `)
        .single()

      if (error) {
        this.error = error.message
        this.loading = false
        return false
      }

      this.categories.push(data)
      this.loading = false
      return true
    },

    async deleteCategory(id) {
      this.loading = true
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        this.error = error.message
        this.loading = false
        return false
      }

      this.categories = this.categories.filter(c => c.id !== id)
      this.loading = false
      return true
    }
  }
})
