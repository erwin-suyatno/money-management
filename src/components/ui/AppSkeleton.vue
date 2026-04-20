<template>
  <div
    class="app-skeleton"
    :class="[
      `app-skeleton--${variant}`,
      { 'app-skeleton--pulse': animate }
    ]"
    :style="{ width, height }"
  ></div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'rect',
    validator: (v) => ['rect', 'circle', 'pill', 'text'].includes(v)
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '20px'
  },
  animate: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.app-skeleton {
  background-color: var(--color-border-strong);
  position: relative;
  overflow: hidden;
}

.app-skeleton--rect {
  border-radius: var(--radius-sm);
}

.app-skeleton--circle {
  border-radius: var(--radius-full);
}

.app-skeleton--pill {
  border-radius: var(--radius-full);
}

.app-skeleton--text {
  border-radius: 4px;
  height: 1em;
}

.app-skeleton--pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.dark .app-skeleton {
  background-color: var(--color-bg-elevated);
}
</style>
