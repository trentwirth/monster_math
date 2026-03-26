<template>
  <div class="round-tracker" :class="{ 'round-pulse': pulsing }">
    <div class="round-tracker__round">
      <span class="round-tracker__label label">Round</span>
      <span class="round-tracker__number">{{ round }}</span>
    </div>
    <div class="round-tracker__turn" v-if="playerName">
      <IconButton variant="ghost" title="Previous turn" small :disabled="round === 1 && turnIndex === 0" @click="$emit('retreat')">‹</IconButton>
      <span class="round-tracker__player">{{ playerName }}</span>
      <IconButton variant="ghost" title="Next turn / advance round" small @click="onAdvance">›</IconButton>
    </div>
    <div class="round-tracker__turn round-tracker__turn--empty" v-else>
      <span class="round-tracker__player round-tracker__player--empty">No players</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconButton from '../shared/IconButton.vue'

defineProps<{
  round: number
  playerName: string
  turnIndex: number
}>()

const emit = defineEmits(['advance', 'retreat'])
const pulsing = ref(false)

function onAdvance() {
  emit('advance')
  pulsing.value = true
  setTimeout(() => { pulsing.value = false }, 550)
}
</script>

<style scoped>
.round-tracker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-surface);
  border: 2px solid var(--color-accent-gold);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-5);
  min-width: 130px;
  box-shadow: var(--shadow-elite);
}
.round-tracker.round-pulse {
  animation: round-pulse 0.5s ease-out;
}
.round-tracker__round {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}
.round-tracker__label {
  color: var(--color-accent-gold);
}
.round-tracker__number {
  font-size: var(--text-round);
  font-weight: 800;
  line-height: 1;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}
.round-tracker__turn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  width: 100%;
  justify-content: center;
}
.round-tracker__player {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-align: center;
  min-width: 60px;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.round-tracker__player--empty {
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
