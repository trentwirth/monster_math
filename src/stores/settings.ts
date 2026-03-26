import { defineStore } from 'pinia'
import { ref } from 'vue'
import { nanoid } from 'nanoid'
import type { Player } from '../types/player'

const STORAGE_KEY = 'monster-math-settings'

export const useSettingsStore = defineStore('settings', () => {
  const players = ref<Player[]>([])
  const turnOrder = ref<string[]>([])
  const activeRulesetId = ref('dnd5e')
  const isConfigured = ref(false)

  // Load from localStorage on init
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        players.value = data.players ?? []
        turnOrder.value = data.turnOrder ?? []
        activeRulesetId.value = data.activeRulesetId ?? 'dnd5e'
        isConfigured.value = data.isConfigured ?? false
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
    }))
  }

  function addPlayer(name: string) {
    const id = nanoid()
    players.value.push({ id, name })
    turnOrder.value.push(id)
    persist()
  }

  function removePlayer(id: string) {
    players.value = players.value.filter(p => p.id !== id)
    turnOrder.value = turnOrder.value.filter(pid => pid !== id)
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

  load()

  return {
    players,
    turnOrder,
    activeRulesetId,
    isConfigured,
    addPlayer,
    removePlayer,
    reorderTurns,
    setRuleset,
    markConfigured,
    getPlayerById,
    getPlayerName,
    persist,
  }
})
