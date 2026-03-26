<template>
  <div class="dead-card" :class="{ 'dead-card--elite': monster.type === 'elite' }">
    <span v-if="monster.type === 'elite'" class="dead-elite-badge label">ELITE</span>
    <div class="dead-card__name">{{ monster.name }}</div>
    <div class="dead-card__hp">0 / {{ monster.maxHp }} HP</div>
  </div>
</template>

<script setup lang="ts">
import type { Monster } from '../../types/monster'
defineProps<{ monster: Monster }>()
</script>

<style scoped>
.dead-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  opacity: 0.6;
  filter: grayscale(1);
}
.dead-card--elite {
  border-top: 2px solid var(--color-accent-gold);
}
.dead-elite-badge {
  color: var(--color-accent-gold);
  display: block;
  margin-bottom: var(--space-1);
}
.dead-card__name {
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
}
.dead-card__hp {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
