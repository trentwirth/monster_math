<template>
  <div class="lair-bar" v-if="monsters.length > 0">
    <div v-for="monster in monsters" :key="monster.id" class="lair-bar__monster">
      <span class="label lair-bar__name">{{ monster.name }}</span>
      <div class="lair-bar__label label">Lair</div>
      <div class="lair-bar__boxes">
        <button
          v-for="i in monster.lairActionCount!"
          :key="i"
          class="cb-box"
          :class="{ 'cb-box--checked': i <= monster.lairActionsUsed }"
          @click="$emit('toggleLair', monster.id)"
          :title="`${monster.name} Lair Action ${i}`"
        >
          <span v-if="i <= monster.lairActionsUsed">✕</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EliteMonster } from '../../types/monster'
defineProps<{ monsters: EliteMonster[] }>()
defineEmits(['toggleLair'])
</script>

<style scoped>
.lair-bar {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  background: var(--color-surface);
  border: 1px solid rgba(201, 168, 76, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
}
.lair-bar__monster {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}
.lair-bar__name {
  color: var(--color-accent-gold);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lair-bar__label {
  color: var(--color-text-muted);
}
.lair-bar__boxes {
  display: flex;
  gap: var(--space-1);
}
.cb-box {
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--color-border-strong);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--color-accent-gold);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
  cursor: pointer;
}
.cb-box:hover {
  border-color: var(--color-accent-gold);
  background: rgba(201, 168, 76, 0.1);
}
.cb-box--checked {
  background: rgba(201, 168, 76, 0.15);
  border-color: var(--color-accent-gold);
}
</style>
