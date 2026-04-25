<template>
  <span
    class="app-badge"
    :class="[
      `app-badge--${variant}`,
      `app-badge--${size}`
    ]"
  >
    <slot></slot>
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'neutral',
    validator: (v) => ['success', 'danger', 'warning', 'info', 'neutral', 'primary'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md'].includes(v)
  }
})
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  white-space: nowrap;
  letter-spacing: 0.02em;
}

/* Sizes */
.app-badge--sm {
  font-size: 10px;
  padding: 2px 8px;
  height: 18px;
}

.app-badge--md {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  height: 24px;
}

/* Variants */
.app-badge--neutral {
  background-color: var(--color-bg-base);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.app-badge--success {
  background-color: var(--color-success-subtle);
  color: var(--color-success);
}

.app-badge--danger {
  background-color: var(--color-danger-subtle);
  color: var(--color-danger);
}

.app-badge--warning {
  background-color: var(--color-warning-subtle);
  color: var(--color-warning);
}

.app-badge--info {
  background-color: var(--color-info-subtle);
  color: var(--color-info);
}

.app-badge--primary {
  background-color: var(--color-primary-50);
  color: var(--color-primary-600);
  border: 1px solid var(--color-primary-100);
}

/* Dark mode overrides generally handled by CSS variables, 
   but ensuring legibility */
.dark .app-badge {
  border-width: 1px;
  border-style: solid;
}

.dark .app-badge--success { border-color: rgba(16, 185, 129, 0.2); }
.dark .app-badge--danger { border-color: rgba(244, 63, 94, 0.2); }
.dark .app-badge--warning { border-color: rgba(245, 158, 11, 0.2); }
.dark .app-badge--info { border-color: rgba(59, 130, 246, 0.2); }
</style>
