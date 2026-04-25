<template>
  <!-- Global loading state when initializing session -->
  <div v-if="authStore.loading" class="flex justify-center items-center h-screen bg-slate-50 dark:bg-gray-950">
    <div class="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
  
  <div v-else class="app-root">
    <router-view />
    <AppToast :toasts="toastStore.toasts" />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from './stores/useAuthStore'
import { useToastStore } from './stores/useToastStore'
import { useWalletStore } from './stores/useWalletStore'
import { useTransactionStore } from './stores/useTransactionStore'
import { useCategoryStore } from './stores/useCategoryStore'
import { useBudgetStore } from './stores/useBudgetStore'
import { useDebtStore } from './stores/useDebtStore'
import { useTransferStore } from './stores/useTransferStore'
import { useTheme } from './composables/useTheme'
import AppToast from './components/ui/AppToast.vue'

const authStore = useAuthStore()
const toastStore = useToastStore()
const walletStore = useWalletStore()
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const budgetStore = useBudgetStore()
const debtStore = useDebtStore()
const transferStore = useTransferStore()

const { updateTheme } = useTheme()

const refreshAllData = async () => {
  if (!authStore.user || !authStore.activeWorkspaceId) return
  
  await Promise.all([
    walletStore.fetchWallets(),
    transactionStore.fetchTransactions({ limit: 20 }),
    categoryStore.fetchInitialData(),
    budgetStore.fetchBudgets(),
    debtStore.fetchDebts(),
    transferStore.fetchTransfers()
  ])
}

onMounted(async () => {
  await authStore.initialize()
  // Ensure theme is applied on load
  updateTheme()
  
  // Fetch initial data if logged in
  if (authStore.user) {
    await refreshAllData()
  }
})

// Watch for workspace changes to refresh data
watch(() => authStore.activeWorkspaceId, (newId) => {
  if (newId) {
    refreshAllData()
  }
})
</script>

<style>
.app-root {
  min-height: 100vh;
}
</style>
