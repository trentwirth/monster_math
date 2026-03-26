<template>
  <button
    class="icon-btn"
    :class="[`icon-btn--${variant}`, { 'icon-btn--sm': small }]"
    :title="title"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'ghost' | 'accent' | 'gold' | 'danger'
  title?: string
  disabled?: boolean
  small?: boolean
}>()
defineEmits(['click'])
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast), opacity var(--transition-fast);
  font-size: 1rem;
  flex-shrink: 0;
}
.icon-btn--sm {
  width: 24px;
  height: 24px;
  font-size: 0.85rem;
}
.icon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.icon-btn--ghost {
  color: var(--color-text-secondary);
}
.icon-btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}
.icon-btn--accent {
  color: var(--color-accent);
}
.icon-btn--accent:hover:not(:disabled) {
  background: rgba(233, 69, 96, 0.15);
  color: var(--color-accent-hover);
}
.icon-btn--gold {
  color: var(--color-accent-gold);
}
.icon-btn--gold:hover:not(:disabled) {
  background: rgba(201, 168, 76, 0.15);
  color: var(--color-accent-gold-hover);
}
.icon-btn--danger {
  color: var(--color-text-muted);
}
.icon-btn--danger:hover:not(:disabled) {
  background: rgba(233, 69, 96, 0.15);
  color: var(--color-accent);
}
</style>
