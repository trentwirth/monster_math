<template>
  <div
    class="monster-card"
    :class="{
      'is-dead': monster.isDead,
      'monster-card--elite': monster.type === 'elite',
      'monster-card--ds-squad': monster.type === 'ds-squad',
      'monster-card--activated': isActivated,
      'is-selected': selected,
    }"
  >
    <!-- Subtle drag-zone tint at top of card -->
    <div class="card-grab-zone" />

    <BasicMonsterCard
      v-if="monster.type === 'basic'"
      :monster="monster"
      :players="players"
      :currentPlayerId="currentPlayerId"
      @damage="onDamage"
      @remove="$emit('remove')"
    />
    <EliteMonsterCard
      v-else-if="monster.type === 'elite'"
      :monster="monster"
      :players="players"
      :currentPlayerId="currentPlayerId"
      @damage="onDamage"
      @remove="$emit('remove')"
      @toggleResistance="$emit('toggleResistance')"
      @toggleLegendaryAction="$emit('toggleLegendaryAction')"
    />
    <DrawSteelBasicCard
      v-else-if="monster.type === 'ds-basic'"
      :monster="monster"
      :players="players"
      :currentPlayerId="currentPlayerId"
      @damage="onDamage"
      @remove="$emit('remove')"
      @toggleActivated="$emit('toggleActivated')"
      @toggleVillainAction="$emit('toggleVillainAction')"
    />
    <DrawSteelSquadCard
      v-else-if="monster.type === 'ds-squad'"
      :monster="monster"
      :players="players"
      :currentPlayerId="currentPlayerId"
      @damage="onDamage"
      @remove="$emit('remove')"
      @toggleActivated="$emit('toggleActivated')"
      @toggleVillainAction="$emit('toggleVillainAction')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Monster } from '../../types/monster'
import { isDrawSteel } from '../../types/monster'
import type { Player } from '../../types/player'
import BasicMonsterCard from './BasicMonsterCard.vue'
import EliteMonsterCard from './EliteMonsterCard.vue'
import DrawSteelBasicCard from './DrawSteelBasicCard.vue'
import DrawSteelSquadCard from './DrawSteelSquadCard.vue'

const props = defineProps<{
  monster: Monster
  players: Player[]
  currentPlayerId?: string
  selected?: boolean
}>()

const emit = defineEmits<{
  damage: [amount: number, playerId: string]
  remove: []
  toggleResistance: []
  toggleLegendaryAction: []
  toggleActivated: []
  toggleVillainAction: []
}>()

const isActivated = computed(() => isDrawSteel(props.monster) && props.monster.activated)

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
  transition: opacity var(--transition-slow), transform var(--transition-slow),
    filter var(--transition-slow), box-shadow var(--transition-fast),
    background-color var(--transition-base), border-color var(--transition-base);
  position: relative;
  overflow: hidden;
}

.card-grab-zone {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 54px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
  pointer-events: none;
  transition: background var(--transition-fast);
}
.monster-card:hover .card-grab-zone {
  background: linear-gradient(to bottom, rgba(224, 146, 26, 0.07) 0%, transparent 100%);
}

.monster-card--elite {
  border-top: 3px solid var(--color-accent-gold);
  box-shadow: var(--shadow-elite);
}
.monster-card--ds-squad {
  border-top: 3px solid var(--color-accent-gold);
}

/* Activated state — blood red */
.monster-card--activated {
  background: var(--color-ds-activated-bg);
  border-color: var(--color-ds-activated-border);
}
.monster-card--activated .card-grab-zone {
  background: linear-gradient(to bottom, var(--color-ds-activated-grab) 0%, transparent 100%);
}
.monster-card--activated:hover .card-grab-zone {
  background: linear-gradient(to bottom, rgba(180, 30, 30, 0.18) 0%, transparent 100%);
}

.monster-card.is-dead {
  opacity: 0.22;
  filter: grayscale(1) brightness(0.55);
  transform: scale(0.9);
  pointer-events: none;
}
.monster-card.is-selected {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  box-shadow: 0 0 22px rgba(224, 146, 26, 0.28);
}
</style>
