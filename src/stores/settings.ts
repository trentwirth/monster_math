import { defineStore } from 'pinia'
import { ref } from 'vue'
import { nanoid } from 'nanoid'
import type { Player } from '../types/player'

const STORAGE_KEY = 'monster-math-settings'

export interface PlayerSet {
  id: string
  name: string
  playerNames: string[]
}

export const useSettingsStore = defineStore('settings', () => {
  const players = ref<Player[]>([])
  const turnOrder = ref<string[]>([])
  const activeRulesetId = ref('dnd5e')
  const isConfigured = ref(false)
  const playerSets = ref<PlayerSet[]>([])
  const activePlayerSetName = ref('')

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        players.value = data.players ?? []
        turnOrder.value = data.turnOrder ?? []
        activeRulesetId.value = data.activeRulesetId ?? 'dnd5e'
        isConfigured.value = data.isConfigured ?? false
        playerSets.value = data.playerSets ?? []
        activePlayerSetName.value = data.activePlayerSetName ?? ''
      }
    } catch {
      // ignore corrupt data
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      players: players.value,
      turnOrder: turnOrder.value,
      activeRulesetId: activeRulesetId.value,
      isConfigured: isConfigured.value,
      playerSets: playerSets.value,
      activePlayerSetName: activePlayerSetName.value,
    }))
  }

  function addPlayer(name: string) {
    const id = nanoid()
    players.value.push({ id, name })
    turnOrder.value.push(id)
    activePlayerSetName.value = ''
    persist()
  }

  function removePlayer(id: string) {
    players.value = players.value.filter(p => p.id !== id)
    turnOrder.value = turnOrder.value.filter(pid => pid !== id)
    activePlayerSetName.value = ''
    persist()
  }

  function reorderTurns(newOrder: string[]) {
    turnOrder.value = newOrder
    persist()
  }

  function setRuleset(id: string) {
    activeRulesetId.value = id
    persist()
  }

  function markConfigured() {
    isConfigured.value = true
    persist()
  }

  function getPlayerById(id: string): Player | undefined {
    return players.value.find(p => p.id === id)
  }

  function getPlayerName(id: string): string {
    return players.value.find(p => p.id === id)?.name ?? 'Unknown'
  }

  // Player Sets -----------------------------------------------------------

  function savePlayerSet(setName: string, orderedIds: string[]) {
    const names = orderedIds
      .map(id => getPlayerName(id))
      .filter(n => n !== 'Unknown')
    if (names.length === 0) return
    playerSets.value.push({ id: nanoid(), name: setName.trim(), playerNames: names })
    persist()
  }

  function loadPlayerSet(setId: string) {
    const set = playerSets.value.find(s => s.id === setId)
    if (!set) return
    players.value = set.playerNames.map(name => ({ id: nanoid(), name }))
    turnOrder.value = players.value.map(p => p.id)
    activePlayerSetName.value = set.name
    persist()
  }

  function deletePlayerSet(setId: string) {
    playerSets.value = playerSets.value.filter(s => s.id !== setId)
    persist()
  }

  load()

  return {
    players,
    turnOrder,
    activeRulesetId,
    isConfigured,
    playerSets,
    activePlayerSetName,
    addPlayer,
    removePlayer,
    reorderTurns,
    setRuleset,
    markConfigured,
    getPlayerById,
    getPlayerName,
    savePlayerSet,
    loadPlayerSet,
    deletePlayerSet,
    persist,
  }
})
