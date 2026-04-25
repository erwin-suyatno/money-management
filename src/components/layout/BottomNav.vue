<template>
  <nav class="bottom-nav">
    <div class="bottom-nav__container">
      <router-link
        v-for="item in primaryNavItems"
        :key="item.to"
        :to="item.to"
        class="bottom-nav__item"
        active-class="bottom-nav__item--active"
      >
        <component :is="item.icon" class="bottom-nav__icon" :size="22" />
        <span class="bottom-nav__label">{{ $t(item.label) }}</span>
      </router-link>

      <!-- More Menu Trigger -->
      <button 
        @click="isMenuOpen = true"
        class="bottom-nav__item"
        :class="{ 'bottom-nav__item--active': isMoreActive }"
      >
        <Menu class="bottom-nav__icon" :size="22" />
        <span class="bottom-nav__label">{{ $t('common.all') }}</span>
      </button>

      <!-- Mobile Menu Bottom Sheet -->
      <Teleport to="body">
        <MobileMenuModal 
          :is-open="isMenuOpen"
          :user-name="authStore.user?.user_metadata?.full_name || $t('common.user')"
          :user-email="authStore.user?.email"
          @close="isMenuOpen = false"
          @logout="handleLogout"
        />
      </Teleport>
    </div>
  </nav>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  Wallet,
  PieChart, 
  History,
  Menu
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/useAuthStore'
import MobileMenuModal from './MobileMenuModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isMenuOpen = ref(false)

const primaryNavItems = [
  { to: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/transaction', label: 'nav.history', icon: History },
  { to: '/wallet', label: 'nav.wallets', icon: Wallet },
  { to: '/budget', label: 'nav.budgets', icon: PieChart },
]

// Determine if "More" menu should look active (if we are on a page not in primary nav)
const isMoreActive = computed(() => {
  const primaryPaths = primaryNavItems.map(item => item.to)
  return !primaryPaths.includes(route.path)
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
  z-index: 500;
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(64px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.03);
}

@media (min-width: 640px) {
  .bottom-nav {
    display: none;
  }
}

.bottom-nav__container {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-around;
  align-items: center;
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  padding: 8px 0;
}

.bottom-nav__icon {
  stroke-width: 2px;
}

.bottom-nav__label {
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.bottom-nav__item--active {
  color: var(--color-primary-600);
}

.bottom-nav__item--active .bottom-nav__icon {
  stroke-width: 2.5px;
  transform: translateY(-2px);
}

.bottom-nav__item--active::after {
  content: '';
  position: absolute;
  bottom: 8px;
  width: 4px;
  height: 4px;
  background-color: var(--color-primary-600);
  border-radius: 50%;
}
</style>
