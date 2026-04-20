<template>
  <nav class="bottom-nav">
    <div class="bottom-nav__container">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="bottom-nav__item"
        active-class="bottom-nav__item--active"
      >
        <component :is="item.icon" class="bottom-nav__icon" :size="24" />
        <span class="bottom-nav__label">{{ $t(item.label) }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Settings,
  History
} from 'lucide-vue-next'

const navItems = [
  { to: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/transaction', label: 'nav.history', icon: History },
  { to: '/budget', label: 'nav.budgets', icon: PieChart },
  { to: '/transfer', label: 'nav.transfer', icon: ArrowLeftRight },
  { to: '/settings', label: 'nav.settings', icon: Settings },
]
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
}
</style>
