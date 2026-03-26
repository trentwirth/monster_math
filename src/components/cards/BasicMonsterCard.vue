<template>
  <div class="basic-card" :class="hpClass">
    <div class="card-header">
      <h3 class="card-name" :title="monster.name">{{ monster.name }}</h3>
      <IconButton variant="danger" title="Remove monster" small @click="$emit('remove')">✕</IconButton>
    </div>

    <div class="hp-display">
      <span class="hp-current">{{ monster.currentHp }}</span>
      <span class="hp-sep">/</span>
      <span class="hp-max">{{ monster.maxHp }}</span>
    </div>
    <div class="hp-bar">
      <div class="hp-bar__fill" :style="{ width: hpPercent + '%' }" />
    </div>

    <DamageInput
      :players="players"
      :currentPlayerId="currentPlayerId"
      @submit="(amount, pid) => $emit('damage', amount, pid)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BasicMonster } from '../../types/monster'
import type { Player } from '../../types/player'
import DamageInput from './DamageInput.vue'
import IconButton from '../shared/IconButton.vue'

const props = defineProps<{
  monster: BasicMonster
  players: Player[]
  currentPlayerId?: string
}>()

defineEmits<{
  damage: [amount: number, playerId: string]
  remove: []
}>()

const hpPercent = computed(() => Math.max(0, Math.min(100, (props.monster.currentHp / props.monster.maxHp) * 100)))
const hpClass = computed(() => {
  if (hpPercent.value <= 0) return 'hp--dead'
  if (hpPercent.value <= 25) return 'hp--critical'
  if (hpPercent.value <= 50) return 'hp--low'
  return ''
})
</script>

<style scoped>
.basic-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}
.card-name {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  word-break: break-word;
  flex: 1;
}
.hp-display {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}
.hp-current {
  font-size: var(--text-hp);
  font-weight: 800;
  line-height: 1;
  color: var(--color-success);
  transition: color var(--transition-base);
}
.hp--low .hp-current    { color: var(--color-warning); }
.hp--critical .hp-current { color: var(--color-accent); }
.hp--dead .hp-current   { color: var(--color-text-muted); }
.hp-sep { font-size: var(--text-lg); color: var(--color-text-muted); }
.hp-max { font-size: var(--text-lg); color: var(--color-text-muted); }

.hp-bar {
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}
.hp-bar__fill {
  height: 100%;
  background: var(--color-success);
  border-radius: 2px;
  transition: width var(--transition-base), background-color var(--transition-base);
}
.hp--low .hp-bar__fill    { background: var(--color-warning); }
.hp--critical .hp-bar__fill { background: var(--color-accent); }
</style>
