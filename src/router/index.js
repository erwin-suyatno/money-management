import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../services/supabase'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: () => import('../views/Login.vue'), name: 'Login', meta: { public: true } },
  { path: '/dashboard', component: () => import('../views/Dashboard.vue'), name: 'Dashboard' },
  { path: '/wallet', component: () => import('../views/Wallet.vue'), name: 'Wallet' },
  { path: '/transaction', component: () => import('../views/Transaction.vue'), name: 'Transaction' },
  { path: '/transfer', component: () => import('../views/Transfer.vue'), name: 'Transfer' },
  { path: '/category', component: () => import('../views/Category.vue'), name: 'Category' },
  { path: '/import', component: () => import('../views/ImportOCR.vue'), name: 'Import' },
  // Error handling routes
  { 
    path: '/error/:code', 
    component: () => import('../views/Error.vue'), 
    name: 'Error',
    meta: { public: true } 
  },
  { 
    path: '/:pathMatch(.*)*', 
    component: () => import('../views/Error.vue'), 
    name: 'NotFound',
    meta: { code: '404', public: true } 
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth Guard
router.beforeEach(async (to, from) => {
  // We fetch session directly from supabase instead of pinia to avoid async init issues on first load
  const { data: { session } } = await supabase.auth.getSession()
  
  // Allow public routes
  if (to.meta.public) return true

  if (to.name !== 'Login' && !session) {
    return { name: 'Login' }
  } else if (to.name === 'Login' && session) {
    return { name: 'Dashboard' }
  }
})
