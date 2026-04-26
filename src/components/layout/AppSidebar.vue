<template>
  <aside 
    class="app-sidebar" 
    :class="{ 'app-sidebar--collapsed': isCollapsed }"
  >
    <div class="app-sidebar__header">
      <div class="app-sidebar__logo">
        <div class="app-sidebar__logo-box">MC</div>
        <div v-if="!isCollapsed" class="app-sidebar__brand">
          <span class="app-sidebar__app-name">MoneyCap</span>
          <!-- Workspace Switcher -->
          <div class="app-sidebar__workspace-selector">
            <select 
              v-model="authStore.activeWorkspaceId" 
              class="workspace-select"
            >
              <option 
                v-for="ws in authStore.workspaces" 
                :key="ws.id" 
                :value="ws.id"
              >
                {{ ws.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <button class="app-sidebar__toggle" @click="isCollapsed = !isCollapsed">
        <component :is="isCollapsed ? ChevronRight : ChevronLeft" :size="20" />
      </button>
    </div>

    <nav class="app-sidebar__nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="app-sidebar__item"
        active-class="app-sidebar__item--active"
      >
        <component :is="item.icon" class="app-sidebar__icon" :size="22" />
        <span v-if="!isCollapsed" class="app-sidebar__label">{{ $t(item.label) }}</span>
        <div v-if="isCollapsed" class="app-sidebar__tooltip">{{ $t(item.label) }}</div>
      </router-link>
    </nav>

    <div class="app-sidebar__footer">
      <div class="app-sidebar__user">
        <AppAvatar :name="userName" size="sm" />
        <div v-if="!isCollapsed" class="app-sidebar__user-info">
          <p class="app-sidebar__user-name">{{ userName }}</p>
          <p class="app-sidebar__user-email">{{ userEmail }}</p>
        </div>
      </div>
      <button v-if="!isCollapsed" class="app-sidebar__logout" @click="$emit('logout')">
        <LogOut :size="18" />
        <span>{{ $t('nav.signout') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet,
  Tag,
  Sparkles,
  CreditCard,
  LifeBuoy,
  Camera
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/useAuthStore'
import AppAvatar from '../ui/AppAvatar.vue'

const authStore = useAuthStore()

defineProps({
  userName: { type: String, default: 'User' },
  userEmail: { type: String, default: '' }
})

defineEmits(['logout'])

const isCollapsed = ref(false)

const navItems = [
  { to: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/transaction', label: 'nav.history', icon: History },
  { to: '/wallet', label: 'nav.wallets', icon: Wallet },
  { to: '/category', label: 'nav.categories', icon: Tag },
  { to: '/budget', label: 'nav.budgets', icon: PieChart },
  { to: '/debt', label: 'nav.debt', icon: CreditCard },
  { to: '/emergency-fund', label: 'nav.emergency', icon: LifeBuoy },
  // { to: '/import', label: 'nav.import', icon: Camera },
  { to: '/whats-new', label: 'nav.news', icon: Sparkles },
  { to: '/transfer', label: 'nav.transfer', icon: ArrowLeftRight },
  { to: '/settings', label: 'nav.settings', icon: Settings },
]
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background-color: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  z-index: 600;
}

@media (max-width: 639.9px) {
  .app-sidebar {
    display: none;
  }
}

.app-sidebar--collapsed {
  width: 80px;
}

.app-sidebar__header {
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.app-sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.app-sidebar__logo-box {
  width: 40px;
  height: 40px;
  background-color: var(--color-primary-600);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 18px;
  flex-shrink: 0;
}

.app-sidebar__app-name {
  font-size: var(--font-size-md);
  font-weight: 900;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  line-height: 1;
}

.app-sidebar__brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-sidebar__workspace-selector {
  margin-top: 4px;
}

.workspace-select {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
  max-width: 140px;
  outline: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workspace-select:hover {
  color: var(--color-primary-600);
}

.app-sidebar__toggle {
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.app-sidebar__toggle:hover {
  background-color: var(--color-primary-50);
  color: var(--color-primary-600);
}

.app-sidebar__nav {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.app-sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  position: relative;
  height: 48px;
}

.app-sidebar__item:hover {
  background-color: var(--color-bg-base);
  color: var(--color-primary-600);
}

.app-sidebar__item--active {
  background-color: var(--color-primary-50);
  color: var(--color-primary-600);
  font-weight: var(--font-weight-semibold);
}

.dark .app-sidebar__item--active {
  background-color: var(--color-primary-900);
  color: var(--color-primary-100);
}

.app-sidebar__icon {
  flex-shrink: 0;
}

.app-sidebar__label {
  font-size: var(--font-size-sm);
}

/* Tooltip for collapsed state */
.app-sidebar__tooltip {
  position: absolute;
  left: 100%;
  margin-left: 12px;
  padding: 6px 12px;
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  box-shadow: var(--shadow-md);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
  white-space: nowrap;
  border: 1px solid var(--color-border);
  z-index: 1000;
}

.app-sidebar--collapsed .app-sidebar__item:hover .app-sidebar__tooltip {
  opacity: 1;
}

.app-sidebar__footer {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.app-sidebar__user {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.app-sidebar__user-info {
  overflow: hidden;
}

.app-sidebar__user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.app-sidebar__user-email {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.app-sidebar__logout {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: var(--space-sm) 0;
  transition: color var(--transition-fast);
}

.app-sidebar__logout:hover {
  color: var(--color-danger);
}
</style>
