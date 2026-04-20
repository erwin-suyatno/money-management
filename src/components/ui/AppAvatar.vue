<template>
  <div
    class="app-avatar"
    :class="`app-avatar--${size}`"
    :style="{ backgroundColor: bgColor || 'var(--color-primary-100)', color: textColor || 'var(--color-primary-700)' }"
  >
    <img v-if="src" :src="src" :alt="name" class="app-avatar__img" @error="onImgError" />
    <span v-else class="app-avatar__initials">{{ initials }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: 'User'
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v)
  },
  bgColor: {
    type: String,
    default: ''
  },
  textColor: {
    type: String,
    default: ''
  }
})

const hasError = ref(false)

const onImgError = () => {
  hasError.value = true
}

const initials = computed(() => {
  return props.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>

<style scoped>
.app-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  font-weight: var(--font-weight-semibold);
  user-select: none;
}

.app-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-avatar__initials {
  line-height: 1;
}

/* Sizes */
.app-avatar--xs {
  width: 24px;
  height: 24px;
  font-size: 10px;
}

.app-avatar--sm {
  width: 32px;
  height: 32px;
  font-size: var(--font-size-xs);
}

.app-avatar--md {
  width: 44px;
  height: 44px;
  font-size: var(--font-size-sm);
}

.app-avatar--lg {
  width: 64px;
  height: 64px;
  font-size: var(--font-size-md);
}

.app-avatar--xl {
  width: 120px;
  height: 120px;
  font-size: var(--font-size-2xl);
}
</style>
