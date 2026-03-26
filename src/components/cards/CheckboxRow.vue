<template>
  <div class="checkbox-row">
    <span class="checkbox-row__label label">{{ label }}</span>
    <div class="checkbox-row__boxes">
      <button
        v-for="i in total"
        :key="i"
        class="cb-box"
        :class="{ 'cb-box--checked': i <= used }"
        :title="`${label} ${i}`"
        @click="$emit('toggle', i - 1)"
      >
        <span v-if="i <= used">✕</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  total: number
  used: number
}>()
defineEmits(['toggle'])
</script>

<style scoped>
.checkbox-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.checkbox-row__label {
  min-width: 90px;
  flex-shrink: 0;
}
.checkbox-row__boxes {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}
.cb-box {
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--color-border-strong);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--color-accent-gold);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
  cursor: pointer;
  flex-shrink: 0;
}
.cb-box:hover {
  border-color: var(--color-accent-gold);
  background: rgba(201, 168, 76, 0.1);
}
.cb-box--checked {
  background: rgba(201, 168, 76, 0.15);
  border-color: var(--color-accent-gold);
}
</style>
