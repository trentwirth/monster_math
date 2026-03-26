<template>
  <div class="combat-canvas">
    <div class="canvas-empty" v-if="liveMonsters.length === 0 && !hasDeadMonsters">
      <p class="canvas-empty__text">No monsters yet</p>
      <p class="canvas-empty__hint">Click <strong>+</strong> to add a monster</p>
    </div>

    <div class="card-grid">
      <div
        v-for="monster in liveMonsters"
        :key="monster.id"
        class="card-wrapper"
        :data-monster-id="monster.id"
        :class="{
          'card-wrapper--drag-over': dragOverId === monster.id,
          'card-wrapper--dragging': dragId === monster.id
        }"
      >
        <!-- Drag handle -->
        <div
          class="card-drag-handle"
          title="Drag to reorder"
          @pointerdown.prevent="(e) => onHandleDown(e, monster.id)"
        >⠿</div>

        <MonsterCard
          :monster="monster"
          :players="players"
          :currentPlayerId="currentPlayerId"
          @damage="(amount, pid) => onDamage(monster.id, amount, pid)"
          @remove="onRemove(monster.id)"
          @toggleResistance="onToggleResistance(monster.id)"
          @toggleLegendaryAction="onToggleLegendaryAction(monster.id)"
        />
      </div>
    </div>

    <DeadPile :monsters="deadMonsters" @open="uiStore.openDeadPile()" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

const dragId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)

function onHandleDown(_e: PointerEvent, id: string) {
  dragId.value = id

  const onMove = (ev: PointerEvent) => {
    // Find which card wrapper is under the pointer
    const el = document.elementFromPoint(ev.clientX, ev.clientY)
    const wrapper = el?.closest('[data-monster-id]') as HTMLElement | null
    const overId = wrapper?.dataset.monsterId ?? null
    dragOverId.value = overId !== id ? overId : null
  }

  const onUp = () => {
    if (dragId.value && dragOverId.value) {
      combatStore.reorderMonsters(dragId.value, dragOverId.value)
    }
    dragId.value = null
    dragOverId.value = null
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

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
.card-wrapper {
  position: relative;
  padding-top: 18px;
  transition: opacity var(--transition-fast);
}
.card-wrapper--dragging {
  opacity: 0.4;
}
.card-wrapper--drag-over > :deep(.monster-card) {
  outline: 2px solid var(--color-accent-gold);
  outline-offset: 3px;
}
.card-drag-handle {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  cursor: grab;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  z-index: 2;
  transition: color var(--transition-fast), background-color var(--transition-fast);
  line-height: 1;
}
.card-drag-handle:hover {
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
}
.card-drag-handle:active {
  cursor: grabbing;
}
</style>
