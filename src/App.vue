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
import { onMounted } from 'vue'
import { useAuthStore } from './stores/useAuthStore'
import { useToastStore } from './stores/useToastStore'
import { useTheme } from './composables/useTheme'
import AppToast from './components/ui/AppToast.vue'

const authStore = useAuthStore()
const toastStore = useToastStore()
const { updateTheme } = useTheme()

onMounted(async () => {
  await authStore.initialize()
  // Ensure theme is applied on load
  updateTheme()
})
</script>

<style>
.app-root {
  min-height: 100vh;
}
</style>
