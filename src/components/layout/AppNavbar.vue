<template>
  <header class="app-navbar">
    <div class="app-navbar__left">
      <slot name="left">
        <button v-if="showBack" class="app-navbar__back" @click="$router.back()">
          <ChevronLeft :size="24" />
        </button>
      </slot>
    </div>

    <div class="app-navbar__center">
      <div class="app-navbar__title-group">
        <h1 class="app-navbar__title">{{ title }}</h1>
        <p v-if="authStore.activeWorkspace" class="app-navbar__subtitle">
          {{ authStore.activeWorkspace.name }}
        </p>
      </div>
    </div>

    <div class="app-navbar__right">
      <slot name="right"></slot>
    </div>
  </header>
</template>

<script setup>
import { ChevronLeft } from 'lucide-vue-next'

import { useAuthStore } from '../../stores/useAuthStore'

const authStore = useAuthStore()

defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.app-navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: rgba(var(--color-bg-base-rgb, 248, 250, 252), 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-md);
  z-index: 500;
  border-bottom: 1px solid var(--color-border);
}

@media (min-width: 640px) {
  .app-navbar {
    display: none;
  }
}

.app-navbar__left, .app-navbar__right {
  display: flex;
  align-items: center;
  width: 44px; /* Balance sizes */
}

.app-navbar__center {
  flex: 1;
  text-align: center;
  display: flex;
  justify-content: center;
}

.app-navbar__title-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-navbar__title {
  font-size: var(--font-size-md);
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.app-navbar__subtitle {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-primary-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 1px;
}

.app-navbar__back {
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-navbar__right {
  justify-content: flex-end;
}
</style>
