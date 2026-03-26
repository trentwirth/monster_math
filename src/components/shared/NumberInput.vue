<template>
  <input
    type="number"
    class="number-input"
    :class="{ 'number-input--lg': large }"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :value="modelValue"
    @input="$emit('update:modelValue', +($event.target as HTMLInputElement).value)"
    @keydown.enter="$emit('enter')"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: number | null
  placeholder?: string
  min?: number
  max?: number
  large?: boolean
}>()
defineEmits(['update:modelValue', 'enter'])
</script>

<style scoped>
.number-input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  width: 100%;
  transition: border-color var(--transition-fast);
}
.number-input:focus {
  border-color: var(--color-accent);
  outline: none;
}
.number-input--lg {
  font-size: var(--text-lg);
  padding: var(--space-3) var(--space-4);
  text-align: center;
}
.number-input::placeholder {
  color: var(--color-text-muted);
}
</style>
