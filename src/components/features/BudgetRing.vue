<template>
  <div class="budget-ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :viewBox="`0 0 ${size} ${size}`" class="budget-ring__svg">
      <!-- Background Circle -->
      <circle
        class="budget-ring__bg"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="strokeWidth"
      />
      <!-- Progress Circle -->
      <circle
        class="budget-ring__progress"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashoffset"
        :stroke="color"
        stroke-linecap="round"
        transform-origin="center"
        style="transform: rotate(-90deg)"
      />
    </svg>
    <div class="budget-ring__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 120
  },
  strokeWidth: {
    type: Number,
    default: 12
  },
  color: {
    type: String,
    default: 'var(--color-primary-500)'
  }
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashoffset = computed(() => {
  const p = Math.min(Math.max(props.percentage, 0), 100)
  return circumference.value - (p / 100) * circumference.value
})
</script>

<style scoped>
.budget-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.budget-ring__svg {
  width: 100%;
  height: 100%;
}

.budget-ring__bg {
  fill: none;
  stroke: var(--color-border);
}

.budget-ring__progress {
  fill: none;
  transition: stroke-dashoffset var(--transition-base);
}

.budget-ring__content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
