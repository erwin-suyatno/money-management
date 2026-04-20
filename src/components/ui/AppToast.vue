<template>
  <Teleport to="body">
    <div class="app-toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="app-toast"
          :class="`app-toast--${toast.type}`"
        >
          <div class="app-toast__icon">
            <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <svg v-else-if="toast.type === 'danger'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <p class="app-toast__message">{{ toast.message }}</p>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  toasts: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.app-toast-container {
  position: fixed;
  bottom: var(--space-2xl);
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  width: calc(100% - 32px);
  max-width: 400px;
}

@media (min-width: 640px) {
  .app-toast-container {
    bottom: var(--space-xl);
    left: auto;
    right: var(--space-xl);
    transform: none;
  }
}

.app-toast {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: slide-up var(--transition-base) forwards;
}

.app-toast--success {
  border-left: 4px solid var(--color-success);
}
.app-toast--danger {
  border-left: 4px solid var(--color-danger);
}
.app-toast--info {
  border-left: 4px solid var(--color-info);
}

.app-toast__icon {
  flex-shrink: 0;
}
.app-toast--success .app-toast__icon { color: var(--color-success); }
.app-toast--danger .app-toast__icon { color: var(--color-danger); }
.app-toast--info .app-toast__icon { color: var(--color-info); }

.app-toast__message {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* Transitions */
.toast-enter-active, .toast-leave-active { transition: all var(--transition-base); }
.toast-enter-from { opacity: 0; transform: translateY(20px); }
.toast-leave-to { opacity: 0; transform: scale(0.9); }
</style>
