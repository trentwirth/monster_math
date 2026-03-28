<template>
  <div class="combat-canvas" @click.self="uiStore.clearMonsterSelection()">
    <div class="canvas-empty" v-if="liveMonsters.length === 0 && !hasDeadMonsters">
      <p class="canvas-empty__text">No monsters yet</p>
      <p class="canvas-empty__hint">Click <strong>+</strong> to add a monster</p>
    </div>

    <TransitionGroup name="card-grid" tag="div" class="card-grid">
      <div
        v-for="monster in previewOrder"
        :key="monster.id"
        class="card-wrapper"
        :data-monster-id="monster.id"
        :class="{
          'card-wrapper--placeholder': dragId === monster.id,
          'card-wrapper--drag-over': dragOverId === monster.id,
        }"
        @pointerdown="(e) => onCardPointerDown(e, monster.id)"
        @click="(e) => onCardClick(e, monster.id)"
      >
        <MonsterCard
          :monster="monster"
          :players="players"
          :currentPlayerId="currentPlayerId"
          :selected="uiStore.selectedMonsterIds.includes(monster.id)"
          @damage="(amount, pid) => onDamage(monster.id, amount, pid)"
          @remove="onRemove(monster.id)"
          @toggleResistance="onToggleResistance(monster.id)"
          @toggleLegendaryAction="onToggleLegendaryAction(monster.id)"
          @toggleActivated="onToggleActivated(monster.id)"
          @toggleVillainAction="onToggleVillainAction(monster.id)"
        />
      </div>
    </TransitionGroup>

    <DeadPile :monsters="deadMonsters" @open="uiStore.openDeadPile()" />

    <!-- Flying ghost card — renders above everything via Teleport -->
    <Teleport to="body">
      <div
        v-if="isDragging && dragMonster"
        class="drag-ghost"
        :style="{ transform: `translate(${ghostX}px, ${ghostY}px)` }"
      >
        <div
          class="drag-ghost__inner"
          :style="{ transform: `rotate(${ghostRotation}deg) scale(1.06)` }"
        >
          <MonsterCard
            :monster="dragMonster"
            :players="players"
            :currentPlayerId="currentPlayerId"
            :selected="false"
            @damage="() => {}"
            @remove="() => {}"
            @toggleResistance="() => {}"
            @toggleLegendaryAction="() => {}"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Player } from '../../types/player'
import type { Monster } from '../../types/monster'
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

// Drag state (reactive — drives template)
const isDragging = ref(false)
const dragId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)
const ghostX = ref(0)
const ghostY = ref(0)
const ghostRotation = ref(0)

// Non-reactive drag internals
let grabOffsetX = 0
let grabOffsetY = 0
let lastPointerX = 0
let pendingDragId: string | null = null
let hasDragInitiated = false
const DRAG_THRESHOLD = 8

const dragMonster = computed<Monster | null>(() =>
  dragId.value ? liveMonsters.value.find(m => m.id === dragId.value) ?? null : null
)

// Reorder preview: insert dragged card at hover position so TransitionGroup can FLIP
const previewOrder = computed(() => {
  if (!dragId.value || !dragOverId.value) return liveMonsters.value
  const arr = [...liveMonsters.value]
  const fromIdx = arr.findIndex(m => m.id === dragId.value)
  const toIdx = arr.findIndex(m => m.id === dragOverId.value)
  if (fromIdx === -1 || toIdx === -1) return arr
  const [item] = arr.splice(fromIdx, 1)
  arr.splice(toIdx, 0, item)
  return arr
})

function findInsertTarget(x: number, y: number): string | null {
  if (!dragId.value) return null
  let closest: string | null = null
  let closestDist = Infinity
  for (const el of document.querySelectorAll<HTMLElement>('[data-monster-id]')) {
    const id = el.dataset.monsterId
    if (!id || id === dragId.value) continue
    const r = el.getBoundingClientRect()
    const dist = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2))
    if (dist < closestDist) { closestDist = dist; closest = id }
  }
  return closest
}

function onCardPointerDown(e: PointerEvent, id: string) {
  const target = e.target as HTMLElement
  // Let inputs, buttons, and checkboxes handle their own events
  if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.tagName === 'LABEL') return

  pendingDragId = id
  hasDragInitiated = false

  // Capture grab offset relative to the card element
  const cardEl = (e.currentTarget as HTMLElement).querySelector('.monster-card')
  const rect = cardEl ? cardEl.getBoundingClientRect() : (e.currentTarget as HTMLElement).getBoundingClientRect()
  grabOffsetX = e.clientX - rect.left
  grabOffsetY = e.clientY - rect.top
  lastPointerX = e.clientX

  const startX = e.clientX
  const startY = e.clientY

  const onMove = (ev: PointerEvent) => {
    ev.preventDefault()

    if (!hasDragInitiated) {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
        hasDragInitiated = true
        dragId.value = pendingDragId
        isDragging.value = true
        // Start ghost at card's screen position
        ghostX.value = ev.clientX - grabOffsetX
        ghostY.value = ev.clientY - grabOffsetY
      }
      return
    }

    // Update ghost position — follows cursor exactly (no transition)
    ghostX.value = ev.clientX - grabOffsetX
    ghostY.value = ev.clientY - grabOffsetY

    // Tilt proportional to horizontal velocity
    const dx = ev.clientX - lastPointerX
    ghostRotation.value = Math.max(-9, Math.min(9, dx * 0.65))
    lastPointerX = ev.clientX

    // Find target card by center-distance (not elementFromPoint — that breaks
    // when the card slides away and the cursor is over the empty gap)
    dragOverId.value = findInsertTarget(ev.clientX, ev.clientY)
  }

  const onUp = () => {
    if (hasDragInitiated && dragId.value && dragOverId.value) {
      combatStore.reorderMonsters(dragId.value, dragOverId.value)
    }
    dragId.value = null
    dragOverId.value = null
    isDragging.value = false
    ghostRotation.value = 0
    pendingDragId = null
    hasDragInitiated = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

function onCardClick(e: MouseEvent, id: string) {
  if (hasDragInitiated) return
  const tag = (e.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'LABEL') return

  if (e.shiftKey) {
    uiStore.rangeSelectMonsters(id, liveMonsters.value.map(m => m.id))
    return
  }

  if (e.metaKey || e.ctrlKey) {
    // Add/remove from multi-selection without clearing others
    uiStore.toggleMonsterSelection(id)
    return
  }

  // Regular click: single-select. If this card is already the sole selection, deselect it.
  const sel = uiStore.selectedMonsterIds
  const isSole = sel.length === 1 && sel[0] === id
  uiStore.clearMonsterSelection()
  if (!isSole) uiStore.toggleMonsterSelection(id)
}

function onDamage(monsterId: string, amount: number, playerId: string) {
  const sel = uiStore.selectedMonsterIds
  if (sel.length > 1 && sel.includes(monsterId)) {
    sel.forEach(id => combatStore.applyDamage(id, amount, playerId))
  } else {
    combatStore.applyDamage(monsterId, amount, playerId)
  }
}
function onRemove(monsterId: string) {
  uiStore.clearMonsterSelection()
  combatStore.removeMonster(monsterId)
}
function onToggleResistance(monsterId: string) {
  combatStore.toggleLegendaryResistance(monsterId)
}
function onToggleLegendaryAction(monsterId: string) {
  combatStore.toggleLegendaryAction(monsterId)
}
function onToggleActivated(monsterId: string) {
  const m = combatStore.liveMonsters.find(x => x.id === monsterId)
  if (!m || m.rulesetId !== 'drawsteel') return
  combatStore.setMonsterActivated(monsterId, !(m as any).activated)
}
function onToggleVillainAction(monsterId: string) {
  combatStore.toggleVillainAction(monsterId)
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

/* FLIP animation for all cards while dragging */
.card-grid-move {
  transition: transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.card-grid-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.card-grid-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.card-wrapper {
  cursor: grab;
  position: relative;
}
.card-wrapper:active {
  cursor: grabbing;
}
.card-wrapper--placeholder > :deep(.monster-card) {
  opacity: 0;
  pointer-events: none;
}
.card-wrapper--drag-over > :deep(.monster-card) {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
</style>

<style>
/* Global — ghost lives outside scoped component */
.drag-ghost {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9999;
  pointer-events: none;
  will-change: transform;
}
.drag-ghost__inner {
  width: 260px;
  transition: transform 0.1s ease-out;
  filter:
    drop-shadow(0 20px 48px rgba(0, 0, 0, 0.75))
    drop-shadow(0 4px 16px rgba(224, 146, 26, 0.18));
}
</style>
