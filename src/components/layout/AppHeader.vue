<template>
  <header class="app-header">
    <div class="app-header__left">
      <RoundTracker
        :round="combatStore.currentRound"
        :playerName="currentPlayerName"
        :turnIndex="combatStore.currentTurnIndex"
        @advance="combatStore.advanceTurn()"
        @retreat="combatStore.retreatTurn()"
      />
      <LairActionBar
        v-if="combatStore.hasEliteWithLair"
        :monsters="lairMonsters"
        @toggleLair="combatStore.toggleLairAction($event)"
      />
    </div>

    <div class="app-header__title">
      <span class="app-header__wordmark">Monster Math</span>
    </div>

    <div class="app-header__right">
      <button class="end-combat-btn" @click="uiStore.openEndCombat()" v-if="combatStore.isActive">
        End Combat
      </button>
      <IconButton variant="ghost" title="Settings" @click="uiStore.openSettings()">⚙</IconButton>
      <div class="add-monster-group">
        <button class="add-btn" @click="uiStore.openAddMonster('basic')" title="Add basic monster">
          <span class="add-btn__icon">＋</span>
          <span class="add-btn__label">Basic</span>
        </button>
        <button class="add-btn add-btn--elite" @click="uiStore.openAddMonster('elite')" title="Add elite monster">
          <span class="add-btn__icon">＋</span>
          <span class="add-btn__label">Elite</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EliteMonster } from '../../types/monster'
import { useCombatStore } from '../../stores/combat'
import { useSettingsStore } from '../../stores/settings'
import { useUiStore } from '../../stores/ui'
import RoundTracker from './RoundTracker.vue'
import LairActionBar from './LairActionBar.vue'
import IconButton from '../shared/IconButton.vue'

const combatStore = useCombatStore()
useSettingsStore() // needed for settings access in template via combatStore
const uiStore = useUiStore()

const currentPlayerName = computed(() => combatStore.currentPlayer?.name ?? '')

const lairMonsters = computed(() =>
  combatStore.liveMonsters.filter(
    (m): m is EliteMonster => m.type === 'elite' && m.lairActionCount !== null
  )
)
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  z-index: 20;
}
.app-header__left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex: 1;
}
.app-header__title {
  flex: 0 0 auto;
}
.app-header__wordmark {
  font-size: var(--text-lg);
  font-weight: 800;
  color: var(--color-accent-gold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.app-header__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  justify-content: flex-end;
}
.add-monster-group {
  display: flex;
  gap: var(--space-1);
}
.add-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.add-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}
.add-btn--elite {
  border-color: rgba(201, 168, 76, 0.3);
  color: var(--color-accent-gold);
}
.add-btn--elite:hover {
  background: rgba(201, 168, 76, 0.1);
  border-color: var(--color-accent-gold);
}
.add-btn__icon {
  font-size: 1rem;
  line-height: 1;
}
.end-combat-btn {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.end-combat-btn:hover {
  background: var(--color-accent);
  color: white;
}
</style>
