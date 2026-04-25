<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="app-modal-backdrop" @click.self="onClose">
        <Transition :name="isMobile ? 'slide-up' : 'scale'">
          <div
            v-if="isOpen"
            class="app-modal"
            :class="{ 'app-modal--mobile': isMobile }"
            role="dialog"
            aria-modal="true"
          >
            <div class="app-modal__header">
              <h3 class="app-modal__title">{{ title }}</h3>
              <button class="app-modal__close" @click="onClose">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="app-modal__body custom-scrollbar">
              <slot></slot>
            </div>

            <div v-if="$slots.footer" class="app-modal__footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const isMobile = ref(window.innerWidth < 640)

const updateView = () => {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  window.addEventListener('resize', updateView)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateView)
})

const onClose = () => {
  emit('close')
}
</script>

<style scoped>
.app-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.app-modal {
  background-color: var(--color-bg-surface);
  width: 100%;
  max-width: 500px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

.app-modal--mobile {
  align-self: flex-end;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  max-width: none;
  width: 100vw;
  margin: 0;
  position: absolute;
  bottom: 0;
  left: 0;
}

.app-modal__header {
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
}

.app-modal__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.app-modal__close {
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.app-modal__close:hover {
  color: var(--color-danger);
}

.app-modal__body {
  padding: var(--space-lg);
  overflow-y: auto;
}

.app-modal__footer {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-md);
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity var(--transition-base); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-enter-active, .scale-leave-active { transition: all var(--transition-base); }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.95); }

.slide-up-enter-active, .slide-up-leave-active { transition: transform var(--transition-base); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>
