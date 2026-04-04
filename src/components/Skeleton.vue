<template>
  <div 
    class="skeleton-loading bg-slate-100 dark:bg-gray-800 relative overflow-hidden"
    :class="[roundedClass]"
    :style="{ width: width, height: height }"
  ></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '20px' },
  variant: { type: String, default: 'rect' } // 'rect', 'circle', 'pill'
})

const roundedClass = computed(() => {
  if (props.variant === 'circle') return 'rounded-full'
  if (props.variant === 'pill') return 'rounded-[2rem]'
  return 'rounded-2xl'
})
</script>

<style scoped>
.skeleton-loading::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

:deep(.dark) .skeleton-loading::after {
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
}
</style>
