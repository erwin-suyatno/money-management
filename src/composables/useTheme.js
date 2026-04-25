import { ref, watch, onMounted } from 'vue'

export function useTheme() {
  const theme = ref(localStorage.getItem('theme') || 'system')
  const isDark = ref(false)

  const updateTheme = () => {
    const root = document.documentElement
    let effectiveTheme = theme.value

    if (theme.value === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
      isDark.value = true
    } else {
      root.classList.remove('dark')
      isDark.value = false
    }

    localStorage.setItem('theme', theme.value)
  }

  const toggleTheme = () => {
    theme.value = isDark.value ? 'light' : 'dark'
    updateTheme()
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    updateTheme()
  }

  onMounted(() => {
    updateTheme()
    
    // Watch for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') updateTheme()
    })
  })

  return {
    theme,
    isDark,
    updateTheme,
    toggleTheme,
    setTheme
  }
}
