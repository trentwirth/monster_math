<template>
  <div id="app-root">
    <AppHeader />

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
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useCombatStore } from './stores/combat'
import { useSettingsStore } from './stores/settings'
import { useUiStore } from './stores/ui'
import AppHeader from './components/layout/AppHeader.vue'
import CombatCanvas from './components/canvas/CombatCanvas.vue'
import SettingsModal from './components/modals/SettingsModal.vue'
import AddMonsterModal from './components/modals/AddMonsterModal.vue'
import DeadPileModal from './components/modals/DeadPileModal.vue'
import EndCombatModal from './components/modals/EndCombatModal.vue'

const combatStore = useCombatStore()
const settingsStore = useSettingsStore()
const uiStore = useUiStore()

function onKeyDown(e: KeyboardEvent) {
  // Don't fire when any modal is open or focus is on a text input
  const anyModalOpen = uiStore.isSettingsModalOpen || uiStore.isAddMonsterModalOpen
    || uiStore.isDeadPileOpen || uiStore.isEndCombatModalOpen || !settingsStore.isConfigured
  if (anyModalOpen) return
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    combatStore.retreatTurn()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    combatStore.advanceTurn()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

function onAddMonster(data: Record<string, any>) {
  combatStore.addMonster(data as any)
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
