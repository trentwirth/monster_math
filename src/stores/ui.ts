import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isDeadPileOpen = ref(false)
  const isAddMonsterModalOpen = ref(false)
  const addMonsterModalType = ref<'basic' | 'elite' | null>(null)
  const isSettingsModalOpen = ref(false)
  const isEndCombatModalOpen = ref(false)

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

  return {
    isDeadPileOpen,
    isAddMonsterModalOpen,
    addMonsterModalType,
    isSettingsModalOpen,
    isEndCombatModalOpen,
    openDeadPile,
    closeDeadPile,
    openAddMonster,
    closeAddMonster,
    openSettings,
    closeSettings,
    openEndCombat,
    closeEndCombat,
  }
})
