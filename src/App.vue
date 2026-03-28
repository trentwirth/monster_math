<template>
  <div id="app-root">
    <AppHeader />

    <DrawSteelHeroBar v-if="settingsStore.activeRulesetId === 'drawsteel'" />

    <CombatCanvas
      :players="settingsStore.players"
      :currentPlayerId="combatStore.currentPlayer?.id"
    />

    <!-- Modals -->
    <SettingsModal
      :show="uiStore.isSettingsModalOpen || !settingsStore.isConfigured"
      :isFirstLaunch="!settingsStore.isConfigured"
      @close="uiStore.closeSettings()"
    />

    <AddMonsterModal
      :show="uiStore.isAddMonsterModalOpen"
      :type="uiStore.addMonsterModalType ?? 'basic'"
      @close="uiStore.closeAddMonster()"
      @submit="onAddMonster"
    />

    <DeadPileModal
      :show="uiStore.isDeadPileOpen"
      :monsters="combatStore.deadMonsters"
      @close="uiStore.closeDeadPile()"
    />

    <EndCombatModal
      :show="uiStore.isEndCombatModalOpen"
      :players="settingsStore.players"
      :roundRecords="combatStore.buildRoundRecords()"
      :deadCount="combatStore.deadMonsters.length"
      :sessionId="combatStore.sessionId"
      @close="uiStore.closeEndCombat()"
      @confirmed="onEndCombat()"
    />

    <ShortcutsModal
      :show="uiStore.isShortcutsModalOpen"
      @close="uiStore.closeShortcuts()"
    />

    <PlayerManagerModal
      :show="uiStore.isPlayerManagerOpen"
      @close="uiStore.closePlayerManager()"
    />

    <DrawSteelSetupModal
      :show="uiStore.isDsSetupOpen"
      @submit="onDsSetup"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCombatStore } from './stores/combat'
import { useSettingsStore } from './stores/settings'
import { useUiStore } from './stores/ui'
import AppHeader from './components/layout/AppHeader.vue'
import DrawSteelHeroBar from './components/layout/DrawSteelHeroBar.vue'
import CombatCanvas from './components/canvas/CombatCanvas.vue'
import SettingsModal from './components/modals/SettingsModal.vue'
import AddMonsterModal from './components/modals/AddMonsterModal.vue'
import DeadPileModal from './components/modals/DeadPileModal.vue'
import EndCombatModal from './components/modals/EndCombatModal.vue'
import ShortcutsModal from './components/modals/ShortcutsModal.vue'
import PlayerManagerModal from './components/modals/PlayerManagerModal.vue'
import DrawSteelSetupModal from './components/modals/DrawSteelSetupModal.vue'

const combatStore = useCombatStore()
const settingsStore = useSettingsStore()
const uiStore = useUiStore()

// Holds monster data while we wait for DS setup to complete
const pendingMonsterData = ref<Record<string, any> | null>(null)

function onKeyDown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey
  const anyModalOpen = uiStore.isSettingsModalOpen || uiStore.isAddMonsterModalOpen
    || uiStore.isDeadPileOpen || uiStore.isEndCombatModalOpen || uiStore.isShortcutsModalOpen
    || uiStore.isDsSetupOpen || !settingsStore.isConfigured

  if (meta && e.key === 'n') {
    e.preventDefault()
    if (!anyModalOpen) uiStore.openAddMonster('basic')
    return
  }
  if (meta && e.key === 'e') {
    e.preventDefault()
    if (!anyModalOpen) uiStore.openAddMonster('elite')
    return
  }
  if (meta && e.key === 'd') {
    e.preventDefault()
    if (!anyModalOpen && uiStore.selectedMonsterIds.length > 0) {
      uiStore.selectedMonsterIds.forEach(id => combatStore.duplicateMonster(id))
      uiStore.clearMonsterSelection()
    }
    return
  }

  if (anyModalOpen) return
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  const isDS = settingsStore.activeRulesetId === 'drawsteel'
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (isDS) combatStore.retreatRoundDirectly()
    else combatStore.retreatTurn()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (isDS) combatStore.advanceRound()
    else combatStore.advanceTurn()
  } else if (e.key === 'Escape') {
    uiStore.clearMonsterSelection()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

function onAddMonster(data: Record<string, any>) {
  const isDS = settingsStore.activeRulesetId === 'drawsteel'

  // If DS ruleset and setup not done yet, show setup modal first
  if (isDS && !combatStore.dsSetupDone) {
    pendingMonsterData.value = data
    uiStore.openDsSetup()
    return
  }

  addMonsterWithData(data)
}

function onDsSetup(heroCount: number, avgVictories: number) {
  combatStore.initDrawSteelCombat(heroCount, avgVictories)
  uiStore.closeDsSetup()
  if (pendingMonsterData.value) {
    addMonsterWithData(pendingMonsterData.value)
    pendingMonsterData.value = null
  }
}

function addMonsterWithData(data: Record<string, any>) {
  const count = typeof data.duplicateCount === 'number' && data.duplicateCount > 1
    ? data.duplicateCount : 0
  if (count > 0) {
    const baseName = data.name
    for (let i = 1; i <= count; i++) {
      combatStore.addMonster({ ...data, name: `${baseName} ${i}`, duplicateCount: undefined })
    }
  } else {
    combatStore.addMonster(data)
  }
}

function onEndCombat() {
  uiStore.closeEndCombat()
  combatStore.resetCombat()
}
</script>

<style scoped>
#app-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg);
}
</style>
