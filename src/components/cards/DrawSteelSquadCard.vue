<template>
  <div class="ds-squad-card" :class="hpClass">
    <div class="card-header">
      <div class="card-header__left">
        <label class="activated-check" :title="monster.activated ? 'Mark as not activated' : 'Mark as activated'">
          <input type="checkbox" :checked="monster.activated" @change="$emit('toggleActivated')" />
          <span class="activated-check__box" :class="{ 'activated-check__box--on': monster.activated }"></span>
        </label>
        <div class="card-header__title">
          <span class="squad-badge label">SQUAD</span>
          <h3 class="card-name" :title="monster.name">{{ monster.name }}</h3>
        </div>
      </div>
      <IconButton variant="danger" title="Remove" small @click="$emit('remove')">✕</IconButton>
    </div>

    <!-- Winded indicator -->
    <div class="winded-badge" v-if="isWinded && !monster.isDead">WINDED</div>

    <!-- Squad circles -->
    <div class="squad-circles">
      <div
        v-for="i in monster.squadSize"
        :key="i"
        class="squad-circle"
        :class="{ 'squad-circle--dead': i <= deadMinions }"
        :title="`Minion ${i}${i <= deadMinions ? ' — dead' : ''}`"
      />
    </div>

    <div class="squad-info">
      <span class="squad-info__dead">{{ deadMinions }}/{{ monster.squadSize }} down</span>
      <span class="squad-info__hp text-muted">{{ monster.currentHp }} / {{ monster.maxHp }} HP</span>
    </div>

    <div class="hp-bar">
      <div class="hp-bar__fill" :style="{ width: hpPercent + '%' }" />
    </div>

    <!-- Villain action -->
    <div class="villain-row" v-if="monster.isVillain">
      <label class="villain-check">
        <input type="checkbox" :checked="monster.villainActionUsed" @change="$emit('toggleVillainAction')" />
        <span class="villain-check__label" :class="{ 'villain-check__label--used': monster.villainActionUsed }">
          Villain Action
        </span>
      </label>
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
import type { DrawSteelSquadMonster } from '../../types/monster'
import type { Player } from '../../types/player'
import DamageInput from './DamageInput.vue'
import IconButton from '../shared/IconButton.vue'

const props = defineProps<{
  monster: DrawSteelSquadMonster
  players: Player[]
  currentPlayerId?: string
}>()

defineEmits<{
  damage: [amount: number, playerId: string]
  remove: []
  toggleActivated: []
  toggleVillainAction: []
}>()

const hpPercent = computed(() =>
  Math.max(0, Math.min(100, (props.monster.currentHp / props.monster.maxHp) * 100))
)
// Number of dead minions = floor of damage dealt / stamina per minion
const deadMinions = computed(() => {
  const dmg = props.monster.maxHp - props.monster.currentHp
  return Math.min(props.monster.squadSize, Math.floor(dmg / props.monster.minionStamina))
})
const isWinded = computed(() =>
  props.monster.currentHp <= props.monster.maxHp / 2 && props.monster.currentHp > 0
)
const hpClass = computed(() => {
  if (hpPercent.value <= 0) return 'hp--dead'
  if (hpPercent.value <= 25) return 'hp--critical'
  if (hpPercent.value <= 50) return 'hp--low'
  return ''
})
</script>

<style scoped>
.ds-squad-card {
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
.card-header__left {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
}
.card-header__title {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
  min-width: 0;
}
.squad-badge { color: var(--color-accent-gold); }
.card-name {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  word-break: break-word;
}
.activated-check {
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 18px; /* align with name, past the SQUAD badge */
}
.activated-check input { display: none; }
.activated-check__box {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 2px solid var(--color-border-strong);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}
.activated-check__box--on {
  background: var(--color-ds-activated-check);
  border-color: var(--color-ds-activated-check);
}
.winded-badge {
  display: inline-block;
  font-size: var(--text-xs);
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
  align-self: flex-start;
}
/* Circles */
.squad-circles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.squad-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--color-border-strong);
  background: transparent;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}
.squad-circle--dead {
  background: var(--color-accent);
  border-color: var(--color-accent);
}
.squad-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.squad-info__dead {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-secondary);
}
.squad-info__hp {
  font-size: var(--text-xs);
}
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
.villain-row {
  padding-top: var(--space-1);
  border-top: 1px solid var(--color-border);
}
.villain-check {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}
.villain-check input { accent-color: var(--color-accent-gold); }
.villain-check__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: color var(--transition-fast);
}
.villain-check__label--used {
  color: var(--color-accent-gold);
  text-decoration: line-through;
}
</style>
