<template>
  <div class="app-shell" :class="{ 'app-shell--no-auth': !isAuthenticated }">
    <!-- Desktop Sidebar -->
    <AppSidebar 
      v-if="isAuthenticated" 
      :user-name="userName" 
      :user-email="userEmail" 
      @logout="$emit('logout')"
    />

    <div class="app-shell__container">
      <!-- Mobile Header -->
      <AppNavbar 
        v-if="isAuthenticated && showNavbar" 
        :title="pageTitle" 
        :show-back="showBackButton"
      >
        <template #right>
          <slot name="navbar-right"></slot>
        </template>
      </AppNavbar>

      <!-- Main Content -->
      <main class="app-shell__main" :class="{ 'app-shell__main--centered': centered }">
        <slot></slot>
        <AppFooter v-if="showFooter" />
      </main>

      <!-- Mobile Bottom Nav -->
      <BottomNav v-if="isAuthenticated" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'
import AppFooter from './AppFooter.vue'
import BottomNav from './BottomNav.vue'

const props = defineProps({
  isAuthenticated: { type: Boolean, default: false },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  pageTitle: { type: String, default: '' },
  showNavbar: { type: Boolean, default: true },
  showBackButton: { type: Boolean, default: false },
  showFooter: { type: Boolean, default: true },
  centered: { type: Boolean, default: false }
})

defineEmits(['logout'])
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.app-shell__container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: padding var(--transition-base);
}

@media (min-width: 640px) {
  /* Offset by Sidebar width on desktop */
  .app-sidebar ~ .app-shell__container {
    margin-left: 260px; /* Base width */
  }

  /* Handle collapsed state if we track it globally or use selectors */
  .app-sidebar.app-sidebar--collapsed ~ .app-shell__container {
    margin-left: 80px;
  }
}

.app-shell__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

@media (min-width: 640px) {
  .app-shell__main {
    padding: var(--space-xl);
  }
}

.app-shell__main--centered {
  max-width: 1200px;
  margin: 0 auto;
}

.app-shell--no-auth .app-shell__container {
  margin-left: 0 !important;
}
</style>
