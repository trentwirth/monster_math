<template>
  <div class="combat-canvas">
    <div class="canvas-empty" v-if="liveMonsters.length === 0 && !hasDeadMonsters">
      <p class="canvas-empty__text">No monsters yet</p>
      <p class="canvas-empty__hint">Click <strong>+</strong> to add a monster</p>
    </div>

    <TransitionGroup name="card-list" tag="div" class="card-grid">
      <MonsterCard
        v-for="monster in liveMonsters"
        :key="monster.id"
        :monster="monster"
        :players="players"
        :currentPlayerId="currentPlayerId"
        @damage="(amount, pid) => onDamage(monster.id, amount, pid)"
        @remove="onRemove(monster.id)"
        @toggleResistance="onToggleResistance(monster.id)"
        @toggleLegendaryAction="onToggleLegendaryAction(monster.id)"
      />
    </TransitionGroup>

    <DeadPile :monsters="deadMonsters" @open="uiStore.openDeadPile()" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '../../types/player'
import { useCombatStore } from '../../stores/combat'
import { useUiStore } from '../../stores/ui'
import MonsterCard from '../cards/MonsterCard.vue'
import DeadPile from '../layout/DeadPile.vue'

defineProps<{
  players: Player[]
  currentPlayerId?: string
}>()

const combatStore = useCombatStore()
const uiStore = useUiStore()

const liveMonsters = computed(() => combatStore.liveMonsters)
const deadMonsters = computed(() => combatStore.deadMonsters)
const hasDeadMonsters = computed(() => deadMonsters.value.length > 0)

function onDamage(monsterId: string, amount: number, playerId: string) {
  combatStore.applyDamage(monsterId, amount, playerId)
}
function onRemove(monsterId: string) {
  combatStore.removeMonster(monsterId)
}
function onToggleResistance(monsterId: string) {
  combatStore.toggleLegendaryResistance(monsterId)
}
function onToggleLegendaryAction(monsterId: string) {
  combatStore.toggleLegendaryAction(monsterId)
}
</script>

<style scoped>
.combat-canvas {
  flex: 1;
  overflow: auto;
  padding: var(--space-6);
  position: relative;
}
.canvas-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-3);
  pointer-events: none;
}
.canvas-empty__text {
  font-size: var(--text-xl);
  color: var(--color-text-muted);
  font-weight: 600;
}
.canvas-empty__hint {
  font-size: var(--text-base);
  color: var(--color-text-muted);
}
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  align-content: flex-start;
}
</style>
