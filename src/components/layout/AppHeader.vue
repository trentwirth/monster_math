<template>
  <header class="app-header">
    <div class="app-header__left">
      <RoundTracker
        :round="combatStore.currentRound"
        :mode="rulesetMode"
        :playerName="currentPlayerName"
        :turnIndex="combatStore.currentTurnIndex"
        :players="settingsStore.players"
        :activeHeroId="combatStore.dsActiveHeroId"
        @advance="onAdvance"
        @retreat="onRetreat"
        @setActiveHero="combatStore.setDsActiveHero($event)"
      />
      <LairActionBar
        v-if="combatStore.hasEliteWithLair"
        :monsters="lairMonsters"
        @toggleLair="combatStore.toggleLairAction($event)"
      />
      <MaliceTracker v-if="rulesetMode === 'drawsteel' && combatStore.dsSetupDone" />
    </div>

    <div class="app-header__title">
      <span class="app-header__wordmark">Monster Math</span>
    </div>

    <div class="app-header__right">
      <button class="end-combat-btn" @click="uiStore.openEndCombat()" v-if="combatStore.isActive">
        End Combat
      </button>
      <IconButton variant="ghost" title="Save combat" @click="onSave" :disabled="!combatStore.isActive">💾</IconButton>
      <IconButton variant="ghost" title="Load combat" @click="onLoad">📂</IconButton>
      <IconButton variant="ghost" title="Settings" @click="uiStore.openSettings()">⚙</IconButton>
      <div class="add-monster-group">
        <button class="add-btn" @click="uiStore.openAddMonster('basic')" :title="basicLabel">
          <span class="add-btn__icon">＋</span>
          <span class="add-btn__label">{{ basicLabel }}</span>
        </button>
        <button class="add-btn add-btn--elite" @click="uiStore.openAddMonster('elite')" :title="eliteLabel">
          <span class="add-btn__icon">＋</span>
          <span class="add-btn__label">{{ eliteLabel }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { EliteMonster } from '../../types/monster'
import { useCombatStore } from '../../stores/combat'
import { useSettingsStore } from '../../stores/settings'
import { useUiStore } from '../../stores/ui'
import RoundTracker from './RoundTracker.vue'
import LairActionBar from './LairActionBar.vue'
import MaliceTracker from './MaliceTracker.vue'
import IconButton from '../shared/IconButton.vue'

const combatStore = useCombatStore()
const settingsStore = useSettingsStore()
const uiStore = useUiStore()

const rulesetMode = computed<'dnd5e' | 'drawsteel'>(() =>
  settingsStore.activeRulesetId === 'drawsteel' ? 'drawsteel' : 'dnd5e'
)
const isDS = computed(() => rulesetMode.value === 'drawsteel')
const basicLabel = computed(() => isDS.value ? 'Creature' : 'Basic')
const eliteLabel = computed(() => isDS.value ? 'Squad' : 'Elite')

const currentPlayerName = computed(() => combatStore.currentPlayer?.name ?? '')

const lairMonsters = computed(() =>
  combatStore.liveMonsters.filter(
    (m): m is EliteMonster => m.type === 'elite' && m.lairActionCount !== null
  )
)

function onAdvance() {
  if (isDS.value) combatStore.advanceRound()
  else combatStore.advanceTurn()
}
function onRetreat() {
  if (isDS.value) combatStore.retreatRoundDirectly()
  else combatStore.retreatTurn()
}

async function onSave() {
  try {
    const json = combatStore.exportState()
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`
    const slug = settingsStore.activePlayerSetName
      ? settingsStore.activePlayerSetName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : 'unnamed'
    const fileName = `monster-math-combat-${slug}-${dateStr}.json`
    await invoke('save_combat_state', { json, fileName })
  } catch (e) {
    if (e !== 'Save cancelled') console.error('Save failed:', e)
  }
}

async function onLoad() {
  try {
    const json = await invoke<string>('load_combat_state')
    const result = combatStore.importState(json)
    if (!result.ok) {
      console.error('Load failed:', result.error)
    }
  } catch (e) {
    if (e !== 'Load cancelled') console.error('Load failed:', e)
  }
}
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
.app-header__title { flex: 0 0 auto; }
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
.add-monster-group { display: flex; gap: var(--space-1); }
.add-btn {
  display: flex; align-items: center; gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-alt); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); color: var(--color-text-secondary);
  font-size: var(--text-sm); font-family: inherit; font-weight: 600; cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.add-btn:hover { background: var(--color-surface-hover); color: var(--color-text-primary); border-color: var(--color-border-strong); }
.add-btn--elite {
  border-color: rgba(192, 112, 16, 0.3);
  color: var(--color-accent-gold);
}
.add-btn--elite:hover { background: rgba(192, 112, 16, 0.1); border-color: var(--color-accent-gold); }
.add-btn__icon { font-size: 1rem; line-height: 1; }
.end-combat-btn {
  padding: var(--space-2) var(--space-4);
  background: transparent; border: 1px solid var(--color-accent);
  border-radius: var(--radius-md); color: var(--color-accent);
  font-size: var(--text-sm); font-family: inherit; font-weight: 600; cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.end-combat-btn:hover { background: var(--color-accent); color: white; }
</style>
