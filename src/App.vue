<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-0 font-sans antialiased text-gray-900 dark:text-gray-100">
    <!-- Desktop Header -->
    <header v-if="authStore.session" class="hidden sm:block bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-gray-800 sticky top-0 z-[100]">
      <div class="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
        <div class="flex justify-between h-24">
          <div class="flex items-center space-x-12">
            <div class="flex-shrink-0 flex items-center font-black text-3xl tracking-tighter text-indigo-600 dark:text-indigo-400">
              
              <router-link to="/dashboard">
                Money<span class="text-slate-900 dark:text-white">Cap</span>
              </router-link>
            </div>
            <nav class="flex space-x-4">
              <router-link to="/wallet" class="px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-50 dark:hover:bg-gray-800" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/50">Wallets</router-link>
              <router-link to="/category" class="px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-50 dark:hover:bg-gray-800" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/50">Categories</router-link>
              <router-link to="/transaction" class="px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-50 dark:hover:bg-gray-800" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/50">History</router-link>
              <router-link to="/transfer" class="px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-50 dark:hover:bg-gray-800" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/50">Transfer</router-link>
              <router-link to="/import" class="px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-50 dark:hover:bg-gray-800" active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/50">Import</router-link>
            </nav>
          </div>
          <div class="flex items-center space-x-6">
             <div class="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-750 flex items-center justify-center text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
             </div>
             <button @click="handleLogout" class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main v-if="!authStore.loading" class="w-full min-h-screen relative">
      <router-view />
      
      <!-- Premium Footer -->
      <footer v-if="authStore.session" class="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-12 border-t border-slate-100 dark:border-gray-800/50 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center space-x-3">
          <span class="px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">v1.0.0</span>
          <p class="text-[11px] font-bold text-slate-400">All systems operational.</p>
        </div>
        <div class="flex items-center space-x-1 text-[11px] font-bold text-slate-400">
          <span>Created by</span>
          <a href="https://www.instagram.com/erwin.suyatno/" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline">Erwin Suyatno</a>
          <span class="mx-1">&bull;</span>
          <span>&copy; 2026 MoneyCap</span>
        </div>
      </footer>
    </main>
    <div v-else class="flex justify-center items-center h-screen">
      <div class="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav v-if="authStore.session" class="sm:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2rem] border border-white/20 dark:border-gray-800 flex justify-around items-center z-[100] px-4 shadow-2xl shadow-indigo-500/10">
      <router-link to="/dashboard" class="flex flex-col items-center p-3 rounded-2xl transition-all" active-class="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-400">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      </router-link>
      <router-link to="/wallet" class="flex flex-col items-center p-3 rounded-2xl transition-all" active-class="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-400">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
      </router-link>
      <router-link to="/category" class="flex flex-col items-center p-3 rounded-2xl transition-all" active-class="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-400">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
      </router-link>
      <router-link to="/transfer" class="flex flex-col items-center p-3 rounded-2xl transition-all" active-class="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-400">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
      </router-link>
      <router-link to="/transaction" class="flex flex-col items-center p-3 rounded-2xl transition-all" active-class="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-400">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      </router-link>
      <router-link to="/import" class="flex flex-col items-center p-3 rounded-2xl transition-all" active-class="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-400">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      </router-link>

      <button @click="handleLogout" class="flex flex-col items-center p-2 text-gray-500 hover:text-red-500 transition">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        <span class="text-[10px] font-medium leading-none">Keluar</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/useAuthStore'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  await authStore.initialize()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>
