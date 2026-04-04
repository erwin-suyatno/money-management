import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark' || 
                    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches))

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Auto apply on init
  onMounted(() => {
    applyTheme()
  })

  return { isDark, toggleTheme, applyTheme }
})
