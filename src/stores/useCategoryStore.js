import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './useAuthStore'
import { markRaw } from 'vue'
import { 
  ShoppingBag, Utensils, Car, Home, Zap, 
  Coffee, Heart, Smartphone, Gift, Briefcase, 
  CircleDollarSign, PiggyBank, Landmark, Activity,
  Tag, Wallet, CreditCard, Book, Tv, Music, 
  TrendingUp, TrendingDown, Shield, Bitcoin,
  ShoppingCart, Gamepad2, Plane, GraduationCap, 
  Stethoscope, Dumbbell, Wine, Camera, 
  Wrench, Globe, Mail, Phone, Lock, 
  Key, User, Settings, AlertCircle, 
  CheckCircle2, Info, HelpCircle
} from 'lucide-vue-next'

const iconMap = {
  'shopping-bag': markRaw(ShoppingBag),
  'utensils': markRaw(Utensils),
  'car': markRaw(Car),
  'home': markRaw(Home),
  'zap': markRaw(Zap),
  'coffee': markRaw(Coffee),
  'heart': markRaw(Heart),
  'smartphone': markRaw(Smartphone),
  'gift': markRaw(Gift),
  'briefcase': markRaw(Briefcase),
  'dollar': markRaw(CircleDollarSign),
  'piggy-bank': markRaw(PiggyBank),
  'bank': markRaw(Landmark),
  'activity': markRaw(Activity),
  'tag': markRaw(Tag),
  'wallet': markRaw(Wallet),
  'credit-card': markRaw(CreditCard),
  'book': markRaw(Book),
  'tv': markRaw(Tv),
  'music': markRaw(Music),
  'up': markRaw(TrendingUp),
  'down': markRaw(TrendingDown),
  'shield': markRaw(Shield),
  'bitcoin': markRaw(Bitcoin),
  'shopping-cart': markRaw(ShoppingCart),
  'game': markRaw(Gamepad2),
  'plane': markRaw(Plane),
  'education': markRaw(GraduationCap),
  'health': markRaw(Stethoscope),
  'fitness': markRaw(Dumbbell),
  'drinks': markRaw(Wine),
  'camera': markRaw(Camera),
  'tools': markRaw(Wrench),
  'web': markRaw(Globe),
  'email': markRaw(Mail),
  'phone': markRaw(Phone),
  'lock': markRaw(Lock),
  'key': markRaw(Key),
  'user': markRaw(User),
  'settings': markRaw(Settings),
  'alert': markRaw(AlertCircle),
  'success': markRaw(CheckCircle2),
  'info': markRaw(Info),
  'help': markRaw(HelpCircle)
}

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
    getCategoryById: (state) => (id) => state.categories.find(c => c.id === id),

    // Resolve icon string to component
    resolveIcon: () => (iconName) => {
      return iconMap[iconName] || Tag
    },

    // Get list of all available icon names
    availableIcons: () => Object.keys(iconMap)
  },
  actions: {
    async fetchInitialData() {
      this.loading = true
      this.error = null

      const authStore = useAuthStore()
      if (!authStore.activeWorkspaceId) {
        this.categories = []
        this.loading = false
        return
      }

      try {
        // Fetch Types first
        const { data: types, error: typesError } = await supabase
          .from('category_types')
          .select('*')
          .order('name', { ascending: true })

        if (typesError) throw typesError
        this.types = types

        // Fetch Categories: Current Workspace OR System Categories (user_id IS NULL)
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
          .or(`workspace_id.eq.${authStore.activeWorkspaceId},user_id.is.null`)
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
        user_id: authStore.user?.id,
        workspace_id: authStore.activeWorkspaceId
      }

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
