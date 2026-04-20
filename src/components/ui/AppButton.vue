<template>
  <button
    class="app-button"
    :class="[
      `app-button--${variant}`,
      `app-button--${size}`,
      { 'app-button--loading': loading },
      { 'app-button--icon-only': iconOnly }
    ]"
    :disabled="disabled || loading"
    :type="type"
    v-bind="$attrs"
  >
    <span v-if="loading" class="app-button__loader"></span>
    <span v-else class="app-button__content">
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  },
  iconOnly: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-base);
  cursor: pointer;
  border: 1px solid transparent;
  width: fit-content;
  position: relative;
  gap: var(--space-sm);
  white-space: nowrap;
  user-select: none;
}

.app-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.app-button--sm {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--font-size-xs);
  height: 32px;
}

.app-button--md {
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-size-sm);
  height: 44px; /* Tap target minimum */
}

.app-button--lg {
  padding: var(--space-md) var(--space-xl);
  font-size: var(--font-size-base);
  height: 54px;
}

.app-button--icon-only {
  padding: 0;
  width: 44px;
  height: 44px;
}

.app-button--icon-only.app-button--sm {
  width: 32px;
  height: 32px;
}

/* Variants */
.app-button--primary {
  background-color: var(--color-primary-600);
  color: #ffffff;
}
.app-button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.app-button--primary:active:not(:disabled) {
  transform: translateY(0);
}

.app-button--secondary {
  background-color: var(--color-bg-base);
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}
.app-button--secondary:hover:not(:disabled) {
  background-color: var(--color-border);
  border-color: var(--color-text-muted);
}

.app-button--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}
.app-button--ghost:hover:not(:disabled) {
  background-color: var(--color-bg-base);
  color: var(--color-primary-600);
}

.app-button--danger {
  background-color: var(--color-danger-subtle);
  color: var(--color-danger);
}
.app-button--danger:hover:not(:disabled) {
  background-color: var(--color-danger);
  color: #ffffff;
}

/* Loading State */
.app-button__loader {
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.app-button__content {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
</style>
