<template>
  <div v-if="monsters.length > 0" class="dead-pile" @click="$emit('open')" title="Click to view fallen monsters">
    <div class="dead-pile__stack">
      <div
        v-for="(m, i) in displayMonsters"
        :key="m.id"
        class="dead-pile__card"
        :style="{ transform: `rotate(${stackAngles[i]}deg) translate(${stackOffsets[i].x}px, ${stackOffsets[i].y}px)`, zIndex: i }"
      />
    </div>
    <div class="dead-pile__info">
      <span class="dead-pile__count">{{ monsters.length }}</span>
      <span class="label dead-pile__label">Fallen</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Monster } from '../../types/monster'

const props = defineProps<{ monsters: Monster[] }>()
defineEmits(['open'])

const displayMonsters = computed(() => props.monsters.slice(0, 5))
const stackAngles = [-8, 4, -2, 6, -4]
const stackOffsets = [
  { x: -4, y: 2 }, { x: 3, y: -3 }, { x: -2, y: 4 },
  { x: 5, y: 1 },  { x: -1, y: -2 },
]
</script>

<style scoped>
.dead-pile {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  z-index: 10;
  transition: transform var(--transition-fast);
}
.dead-pile:hover {
  transform: translateY(-4px);
}
.dead-pile__stack {
  position: relative;
  width: 60px;
  height: 80px;
}
.dead-pile__card {
  position: absolute;
  inset: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  opacity: 0.5;
  filter: grayscale(1);
}
.dead-pile__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.dead-pile__count {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-muted);
  line-height: 1;
}
.dead-pile__label {
  color: var(--color-text-muted);
}
</style>
