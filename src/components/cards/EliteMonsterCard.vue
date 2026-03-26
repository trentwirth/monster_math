<template>
  <div class="elite-card" :class="hpClass">
    <div class="card-header">
      <div class="card-header__title">
        <span class="elite-badge label">ELITE</span>
        <h3 class="card-name" :title="monster.name">{{ monster.name }}</h3>
      </div>
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

    <div class="elite-section">
      <CheckboxRow
        label="Leg. Resist."
        :total="monster.legendaryResistances"
        :used="monster.legendaryResistancesUsed"
        @toggle="$emit('toggleResistance')"
      />
      <CheckboxRow
        label="Leg. Actions"
        :total="monster.legendaryActionPoints"
        :used="monster.legendaryActionsUsed"
        @toggle="$emit('toggleLegendaryAction')"
      />
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
import type { EliteMonster } from '../../types/monster'
import type { Player } from '../../types/player'
import DamageInput from './DamageInput.vue'
import CheckboxRow from './CheckboxRow.vue'
import IconButton from '../shared/IconButton.vue'

const props = defineProps<{
  monster: EliteMonster
  players: Player[]
  currentPlayerId?: string
}>()

defineEmits<{
  damage: [amount: number, playerId: string]
  remove: []
  toggleResistance: []
  toggleLegendaryAction: []
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
.elite-card {
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
.card-header__title {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
  min-width: 0;
}
.elite-badge {
  color: var(--color-accent-gold);
}
.card-name {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  word-break: break-word;
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
.elite-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: rgba(201, 168, 76, 0.05);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(201, 168, 76, 0.15);
}
</style>
