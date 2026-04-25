<template>
  <div
    class="app-divider"
    :class="`app-divider--${vertical ? 'vertical' : 'horizontal'}`"
    :style="{ margin }"
  ></div>
</template>

<script setup>
defineProps({
  vertical: {
    type: Boolean,
    default: false
  },
  margin: {
    type: String,
    default: '16px 0'
  }
})
</script>

<style scoped>
.app-divider {
  background-color: var(--color-border);
}

.app-divider--horizontal {
  width: 100%;
  height: 1px;
}

.app-divider--vertical {
  width: 1px;
  height: 100%;
  display: inline-block;
}
</style>
