import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isDeadPileOpen = ref(false)
  const isAddMonsterModalOpen = ref(false)
  const addMonsterModalType = ref<'basic' | 'elite' | null>(null)
  const isSettingsModalOpen = ref(false)
  const isEndCombatModalOpen = ref(false)
  const isShortcutsModalOpen = ref(false)
  const isPlayerManagerOpen = ref(false)
  const isDsSetupOpen = ref(false)

  const selectedMonsterIds = ref<string[]>([])
  const lastClickedMonsterId = ref<string | null>(null)

  function openDeadPile() { isDeadPileOpen.value = true }
  function closeDeadPile() { isDeadPileOpen.value = false }

  function openAddMonster(type: 'basic' | 'elite') {
    addMonsterModalType.value = type
    isAddMonsterModalOpen.value = true
  }
  function closeAddMonster() {
    isAddMonsterModalOpen.value = false
    addMonsterModalType.value = null
  }

  function openSettings() { isSettingsModalOpen.value = true }
  function closeSettings() { isSettingsModalOpen.value = false }

  function openEndCombat() { isEndCombatModalOpen.value = true }
  function closeEndCombat() { isEndCombatModalOpen.value = false }

  function openShortcuts() { isShortcutsModalOpen.value = true }
  function closeShortcuts() { isShortcutsModalOpen.value = false }

  function openPlayerManager() { isPlayerManagerOpen.value = true }
  function closePlayerManager() { isPlayerManagerOpen.value = false }

  function openDsSetup() { isDsSetupOpen.value = true }
  function closeDsSetup() { isDsSetupOpen.value = false }

  function toggleMonsterSelection(id: string) {
    const idx = selectedMonsterIds.value.indexOf(id)
    if (idx === -1) {
      selectedMonsterIds.value.push(id)
    } else {
      selectedMonsterIds.value.splice(idx, 1)
    }
    lastClickedMonsterId.value = id
  }

  function rangeSelectMonsters(toId: string, allIds: string[]) {
    const anchor = lastClickedMonsterId.value ?? toId
    const fromIdx = allIds.indexOf(anchor)
    const toIdx = allIds.indexOf(toId)
    if (fromIdx === -1 || toIdx === -1) {
      toggleMonsterSelection(toId)
      return
    }
    const [start, end] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx]
    for (let i = start; i <= end; i++) {
      if (!selectedMonsterIds.value.includes(allIds[i])) {
        selectedMonsterIds.value.push(allIds[i])
      }
    }
  }

  function clearMonsterSelection() {
    selectedMonsterIds.value = []
    lastClickedMonsterId.value = null
  }

  return {
    isDeadPileOpen,
    isAddMonsterModalOpen,
    addMonsterModalType,
    isSettingsModalOpen,
    isEndCombatModalOpen,
    isShortcutsModalOpen,
    isPlayerManagerOpen,
    isDsSetupOpen,
    selectedMonsterIds,
    lastClickedMonsterId,
    openDeadPile,
    closeDeadPile,
    openAddMonster,
    closeAddMonster,
    openSettings,
    closeSettings,
    openEndCombat,
    closeEndCombat,
    openShortcuts,
    closeShortcuts,
    openPlayerManager,
    closePlayerManager,
    openDsSetup,
    closeDsSetup,
    toggleMonsterSelection,
    rangeSelectMonsters,
    clearMonsterSelection,
  }
})
