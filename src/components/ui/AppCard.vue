<template>
  <div
    class="app-card"
    :class="[
      `app-card--${variant}`,
      { 'app-card--has-header': $slots.header },
      { 'app-card--has-footer': $slots.footer }
    ]"
  >
    <div v-if="$slots.header" class="app-card__header">
      <slot name="header"></slot>
    </div>

    <div class="app-card__body">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="app-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'elevated', 'flat'].includes(v)
  }
})
</script>

<style scoped>
.app-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
}

.app-card--default {
  box-shadow: var(--shadow-sm);
}

.app-card--elevated {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-strong);
}

.app-card--elevated:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.app-card--flat {
  background-color: transparent;
  border-color: var(--color-border-strong);
}

.app-card__header {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-card__body {
  padding: var(--space-lg);
  flex: 1;
}

.app-card__footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
  background-color: rgba(0, 0, 0, 0.02);
}

.dark .app-card__footer {
  background-color: rgba(255, 255, 255, 0.02);
}

.dark .app-card {
  background-color: var(--color-bg-surface);
  border-color: var(--color-border);
}

.dark .app-card--flat {
  background-color: transparent;
}
</style>
