<template>
  <div
    class="monster-card"
    :class="{ 'is-dead': monster.isDead, 'monster-card--elite': monster.type === 'elite' }"
  >
    <BasicMonsterCard
      v-if="monster.type === 'basic'"
      :monster="monster"
      :players="players"
      :currentPlayerId="currentPlayerId"
      @damage="onDamage"
      @remove="$emit('remove')"
    />
    <EliteMonsterCard
      v-else
      :monster="monster"
      :players="players"
      :currentPlayerId="currentPlayerId"
      @damage="onDamage"
      @remove="$emit('remove')"
      @toggleResistance="$emit('toggleResistance')"
      @toggleLegendaryAction="$emit('toggleLegendaryAction')"
    />
  </div>
</template>

<script setup lang="ts">
import type { Monster } from '../../types/monster'
import type { Player } from '../../types/player'
import BasicMonsterCard from './BasicMonsterCard.vue'
import EliteMonsterCard from './EliteMonsterCard.vue'

defineProps<{
  monster: Monster
  players: Player[]
  currentPlayerId?: string
}>()

const emit = defineEmits<{
  damage: [amount: number, playerId: string]
  remove: []
  toggleResistance: []
  toggleLegendaryAction: []
}>()

function onDamage(amount: number, playerId: string) {
  emit('damage', amount, playerId)
}
</script>

<style scoped>
.monster-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-card);
  width: 260px;
  flex-shrink: 0;
  transition: opacity var(--transition-slow), transform var(--transition-slow), filter var(--transition-slow);
  position: relative;
}
.monster-card--elite {
  border-top: 3px solid var(--color-accent-gold);
  box-shadow: var(--shadow-elite);
}
.monster-card.is-dead {
  opacity: 0.25;
  filter: grayscale(1) brightness(0.6);
  transform: scale(0.9);
  pointer-events: none;
}
</style>
