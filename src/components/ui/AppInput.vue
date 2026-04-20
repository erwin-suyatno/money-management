<template>
  <div class="app-input" :class="{ 'app-input--error': error, 'app-input--focused': isFocused }">
    <label v-if="label" :for="id" class="app-input__label">{{ label }}</label>
    
    <div class="app-input__wrapper">
      <div v-if="$slots.prefix" class="app-input__icon-prefix">
        <slot name="prefix"></slot>
      </div>

      <input
        :id="id"
        class="app-input__field"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${id}-error` : helperText ? `${id}-helper` : undefined"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <div v-if="clearable && modelValue" class="app-input__clear" @click="onClear">
        <slot name="clear-icon">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </slot>
      </div>

      <div v-if="$slots.suffix" class="app-input__icon-suffix">
        <slot name="suffix"></slot>
      </div>
    </div>

    <p v-if="error" :id="`${id}-error`" class="app-input__error-text">{{ error }}</p>
    <p v-else-if="helperText" :id="`${id}-helper`" class="app-input__helper-text">{{ helperText }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  id: {
    type: String,
    required: true
  },
  error: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isFocused = ref(false)

const onInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const onClear = () => {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.app-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  width: 100%;
}

.app-input__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  tracking: 0.05em;
  margin-left: 2px;
}

.app-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  min-height: 48px;
  overflow: hidden;
}

.app-input__wrapper:hover {
  border-color: var(--color-text-muted);
}

.app-input--focused .app-input__wrapper {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.dark .app-input--focused .app-input__wrapper {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.app-input__field {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0 var(--space-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-base); /* Min 15px for mobile */
  width: 100%;
}

.app-input__field::placeholder {
  color: var(--color-text-muted);
}

.app-input__field:disabled {
  cursor: not-allowed;
  background-color: var(--color-bg-base);
}

.app-input__icon-prefix {
  padding-left: var(--space-md);
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
}

.app-input__icon-suffix {
  padding-right: var(--space-md);
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
}

.app-input__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 0 var(--space-sm);
  transition: color var(--transition-fast);
}

.app-input__clear:hover {
  color: var(--color-danger);
}

.app-input__error-text {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  margin-top: 2px;
}

.app-input__helper-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.app-input--error .app-input__wrapper {
  border-color: var(--color-danger);
}

.app-input--error .app-input__label {
  color: var(--color-danger);
}
</style>
