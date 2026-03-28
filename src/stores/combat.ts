import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import type { Monster, DrawSteelBasicMonster, DrawSteelSquadMonster } from '../types/monster'
import { isDrawSteel } from '../types/monster'
import type { RoundRecord } from '../types/combat'
import { getRuleSet } from '../rulesets/index'
import { useSettingsStore } from './settings'

export const useCombatStore = defineStore('combat', () => {
  const monsters = ref<Monster[]>([])
  const currentRound = ref(1)
  const currentTurnIndex = ref(0)
  const damageLog = ref<DamageEvent[]>([])
  const completedRounds = ref<RoundRecord[]>([])
  const isActive = ref(false)
  const sessionId = ref(nanoid())
  const startedAt = ref<string | null>(null)

  // Draw Steel specific state
  const dsSetupDone = ref(false)
  const dsMalice = ref(0)
  const dsLivingHeroes = ref(0)
  const dsVictories = ref(0)
  const dsActiveHeroId = ref<string | null>(null)
  const dsHeroTurnDone = ref<Record<string, boolean>>({})

  // Getters
  const liveMonsters = computed(() => {
    const live = monsters.value.filter(m => !m.isDead)
    const settings = useSettingsStore()
    if (settings.activeRulesetId !== 'drawsteel') return live

    // DS: unactivated cards in array order, activated at end sorted by activation time
    const unactivated = live.filter(m => !isDrawSteel(m) || !m.activated)
    const activated = (live.filter(m => isDrawSteel(m) && m.activated) as (DrawSteelBasicMonster | DrawSteelSquadMonster)[])
      .sort((a, b) => a.activationTime - b.activationTime)
    return [...unactivated, ...activated]
  })

  const deadMonsters = computed(() => monsters.value.filter(m => m.isDead))

  const hasEliteWithLair = computed(() =>
    monsters.value.some(m => m.type === 'elite' && m.lairActionCount !== null && !m.isDead)
  )

  const lairActionTotal = computed(() =>
    monsters.value
      .filter(m => m.type === 'elite' && !m.isDead && m.lairActionCount !== null)
      .reduce((sum, m) => sum + (m.type === 'elite' ? (m.lairActionCount ?? 0) : 0), 0)
  )

  const currentPlayer = computed(() => {
    const settings = useSettingsStore()
    if (settings.activeRulesetId === 'drawsteel') {
      return dsActiveHeroId.value ? settings.getPlayerById(dsActiveHeroId.value) ?? null : null
    }
    const pid = settings.turnOrder[currentTurnIndex.value]
    return settings.getPlayerById(pid) ?? null
  })

  // How much malice will be gained at start of next round
  const dsNextRoundGain = computed(() => dsLivingHeroes.value + (currentRound.value + 1))

  // ── Draw Steel setup ─────────────────────────────────────────────────────────

  function initDrawSteelCombat(heroCount: number, avgVictories: number) {
    dsLivingHeroes.value = heroCount
    dsVictories.value = avgVictories
    // Initial malice: avg victories + heroes + round 1
    dsMalice.value = Math.round(avgVictories) + heroCount + 1
    dsSetupDone.value = true
  }

  function adjustDsMalice(delta: number) {
    dsMalice.value = Math.max(0, dsMalice.value + delta)
  }

  function setDsLivingHeroes(count: number) {
    dsLivingHeroes.value = Math.max(0, count)
  }

  function setDsActiveHero(playerId: string | null) {
    dsActiveHeroId.value = playerId
  }

  function toggleHeroTurnDone(playerId: string) {
    dsHeroTurnDone.value = {
      ...dsHeroTurnDone.value,
      [playerId]: !dsHeroTurnDone.value[playerId],
    }
  }

  // ── Monster activation (DS) ──────────────────────────────────────────────────

  function setMonsterActivated(id: string, activated: boolean) {
    const idx = monsters.value.findIndex(m => m.id === id)
    if (idx === -1) return
    const m = monsters.value[idx]
    if (!isDrawSteel(m)) return
    monsters.value[idx] = {
      ...m,
      activated,
      activationTime: activated ? Date.now() : 0,
    }
  }

  function toggleVillainAction(id: string) {
    const idx = monsters.value.findIndex(m => m.id === id)
    if (idx === -1) return
    const m = monsters.value[idx]
    if (!isDrawSteel(m)) return
    monsters.value[idx] = { ...m, villainActionUsed: !m.villainActionUsed }
  }

  // ── Core combat ──────────────────────────────────────────────────────────────

  function addMonster(data: Record<string, any>) {
    const settings = useSettingsStore()
    const ruleset = getRuleSet(settings.activeRulesetId)
    let monster: Monster
    if (data.type === 'elite' || data.type === 'ds-squad') {
      monster = ruleset.createEliteMonster(data)
    } else {
      monster = ruleset.createBasicMonster(data)
    }
    monsters.value.push(monster)
    if (!isActive.value) {
      isActive.value = true
      startedAt.value = new Date().toISOString()
    }
  }

  function removeMonster(id: string) {
    monsters.value = monsters.value.filter(m => m.id !== id)
  }

  function applyDamage(monsterId: string, amount: number, playerId: string) {
    const idx = monsters.value.findIndex(m => m.id === monsterId)
    if (idx === -1) return
    const monster = monsters.value[idx]
    const newHp = Math.max(0, Math.min(monster.maxHp, monster.currentHp - amount))
    monsters.value[idx] = { ...monster, currentHp: newHp, isDead: newHp <= 0 }
    if (amount > 0) {
      damageLog.value.push({ monsterId, playerId, amount, round: currentRound.value })
    }
  }

  function toggleLegendaryResistance(monsterId: string) {
    const idx = monsters.value.findIndex(m => m.id === monsterId)
    if (idx === -1) return
    const monster = monsters.value[idx]
    if (monster.type !== 'elite') return
    const used = monster.legendaryResistancesUsed
    const total = monster.legendaryResistances
    monsters.value[idx] = { ...monster, legendaryResistancesUsed: used >= total ? 0 : used + 1 }
  }

  function toggleLegendaryAction(monsterId: string) {
    const idx = monsters.value.findIndex(m => m.id === monsterId)
    if (idx === -1) return
    const monster = monsters.value[idx]
    if (monster.type !== 'elite') return
    const used = monster.legendaryActionsUsed
    const total = monster.legendaryActionPoints
    monsters.value[idx] = { ...monster, legendaryActionsUsed: used >= total ? 0 : used + 1 }
  }

  function toggleLairAction(monsterId: string) {
    const idx = monsters.value.findIndex(m => m.id === monsterId)
    if (idx === -1) return
    const monster = monsters.value[idx]
    if (monster.type !== 'elite' || monster.lairActionCount === null) return
    const used = monster.lairActionsUsed
    const total = monster.lairActionCount
    monsters.value[idx] = { ...monster, lairActionsUsed: used >= total ? 0 : used + 1 }
  }

  function advanceTurn() {
    const settings = useSettingsStore()
    const total = settings.turnOrder.length
    if (total === 0) return
    if (currentTurnIndex.value >= total - 1) {
      advanceRound()
    } else {
      currentTurnIndex.value++
    }
  }

  function retreatTurn() {
    const settings = useSettingsStore()
    const total = settings.turnOrder.length
    if (total === 0) return
    if (currentTurnIndex.value <= 0) {
      if (currentRound.value > 1) {
        currentRound.value--
        currentTurnIndex.value = total - 1
      }
    } else {
      currentTurnIndex.value--
    }
  }

  // For DS: advance/retreat round directly (no turn stepping)
  function retreatRoundDirectly() {
    if (currentRound.value > 1) currentRound.value--
  }

  function advanceRound() {
    const settings = useSettingsStore()
    const isDS = settings.activeRulesetId === 'drawsteel'

    // Capture round record
    const playerIds = isDS ? settings.players.map(p => p.id) : settings.turnOrder
    const roundDamage: Record<string, number> = {}
    for (const pid of playerIds) {
      roundDamage[pid] = damageLog.value
        .filter(e => e.round === currentRound.value && e.playerId === pid && e.amount > 0)
        .reduce((sum, e) => sum + e.amount, 0)
    }
    completedRounds.value.push({ round: currentRound.value, damageByPlayer: roundDamage })

    const newRound = currentRound.value + 1

    // DS: gain malice at start of new round, reset activations and hero turns
    if (isDS && dsSetupDone.value) {
      dsMalice.value += dsLivingHeroes.value + newRound
      dsHeroTurnDone.value = {}
      monsters.value = monsters.value.map(m =>
        isDrawSteel(m)
          ? { ...m, activated: false, activationTime: 0, villainActionUsed: false }
          : m
      )
    }

    // Apply ruleset round-end logic (5e resets legendary actions, etc.)
    const rs = getRuleSet(settings.activeRulesetId)
    monsters.value = monsters.value.map(m => !m.isDead ? rs.onRoundEnd(m) : m)

    currentRound.value = newRound
    currentTurnIndex.value = 0
  }

  function buildRoundRecords(): RoundRecord[] {
    const settings = useSettingsStore()
    const isDS = settings.activeRulesetId === 'drawsteel'
    const playerIds = isDS ? settings.players.map(p => p.id) : settings.turnOrder

    const inProgressDamage: Record<string, number> = {}
    for (const pid of playerIds) {
      inProgressDamage[pid] = damageLog.value
        .filter(e => e.round === currentRound.value && e.playerId === pid && e.amount > 0)
        .reduce((sum, e) => sum + e.amount, 0)
    }
    return [
      ...completedRounds.value,
      { round: currentRound.value, damageByPlayer: inProgressDamage },
    ]
  }

  function duplicateMonster(id: string) {
    const original = monsters.value.find(m => m.id === id)
    if (!original) return

    const baseName = original.name.replace(/ \d+$/, '').trim()
    const escapedBase = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const family = monsters.value.filter(m =>
      m.name === baseName || m.name.match(new RegExp(`^${escapedBase} \\d+$`))
    )

    if (!/ \d+$/.test(original.name)) {
      const origIdx = monsters.value.findIndex(m => m.id === id)
      monsters.value[origIdx] = { ...monsters.value[origIdx], name: `${baseName} 1` }
    }

    const maxNum = family.reduce((max, m) => {
      const match = m.name.match(/ (\d+)$/)
      return match ? Math.max(max, parseInt(match[1])) : Math.max(max, 1)
    }, 1)

    const src = monsters.value.find(m => m.id === id)!
    const base: any = {
      ...src,
      id: nanoid(),
      name: `${baseName} ${maxNum + 1}`,
      currentHp: src.maxHp,
      isDead: false,
    }
    // Reset DS activation state on clone
    if (isDrawSteel(src)) {
      base.activated = false
      base.activationTime = 0
      base.villainActionUsed = false
    }
    if (src.type === 'elite') {
      base.legendaryResistancesUsed = 0
      base.legendaryActionsUsed = 0
      base.lairActionsUsed = 0
    }
    monsters.value.push(base as Monster)
  }

  function reorderMonsters(fromId: string, toId: string) {
    const fromIdx = monsters.value.findIndex(m => m.id === fromId)
    const toIdx = monsters.value.findIndex(m => m.id === toId)
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return
    const arr = [...monsters.value]
    const [item] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, item)
    monsters.value = arr
  }

  // ── Save / Load ───────────────────────────────────────────────────────────

  function exportState(): string {
    const settings = useSettingsStore()
    const snapshot = {
      version: 1,
      savedAt: new Date().toISOString(),
      rulesetId: settings.activeRulesetId,
      combat: {
        monsters: monsters.value,
        currentRound: currentRound.value,
        currentTurnIndex: currentTurnIndex.value,
        damageLog: damageLog.value,
        completedRounds: completedRounds.value,
        isActive: isActive.value,
        sessionId: sessionId.value,
        startedAt: startedAt.value,
        dsSetupDone: dsSetupDone.value,
        dsMalice: dsMalice.value,
        dsLivingHeroes: dsLivingHeroes.value,
        dsVictories: dsVictories.value,
        dsActiveHeroId: dsActiveHeroId.value,
        dsHeroTurnDone: dsHeroTurnDone.value,
      },
      settings: {
        players: settings.players,
        turnOrder: settings.turnOrder,
        activeRulesetId: settings.activeRulesetId,
      },
    }
    return JSON.stringify(snapshot, null, 2)
  }

  function importState(json: string): { ok: boolean; error?: string } {
    let data: any
    try {
      data = JSON.parse(json)
    } catch {
      return { ok: false, error: 'Invalid JSON file.' }
    }
    if (!data?.version || !data?.combat) {
      return { ok: false, error: 'Not a valid Monster Math save file.' }
    }

    const c = data.combat
    const s = data.settings

    // Restore settings first so ruleset is correct before computed refs run
    const settings = useSettingsStore()
    if (s) {
      if (s.players) settings.players = s.players
      if (s.turnOrder) settings.turnOrder = s.turnOrder
      if (s.activeRulesetId) settings.activeRulesetId = s.activeRulesetId
      settings.persist()
    }

    // Restore combat state
    monsters.value = c.monsters ?? []
    currentRound.value = c.currentRound ?? 1
    currentTurnIndex.value = c.currentTurnIndex ?? 0
    damageLog.value = c.damageLog ?? []
    completedRounds.value = c.completedRounds ?? []
    isActive.value = c.isActive ?? false
    sessionId.value = c.sessionId ?? nanoid()
    startedAt.value = c.startedAt ?? null
    dsSetupDone.value = c.dsSetupDone ?? false
    dsMalice.value = c.dsMalice ?? 0
    dsLivingHeroes.value = c.dsLivingHeroes ?? 0
    dsVictories.value = c.dsVictories ?? 0
    dsActiveHeroId.value = c.dsActiveHeroId ?? null
    dsHeroTurnDone.value = c.dsHeroTurnDone ?? {}

    return { ok: true }
  }

  function resetCombat() {
    monsters.value = []
    currentRound.value = 1
    currentTurnIndex.value = 0
    damageLog.value = []
    completedRounds.value = []
    isActive.value = false
    sessionId.value = nanoid()
    startedAt.value = null
    dsSetupDone.value = false
    dsMalice.value = 0
    dsLivingHeroes.value = 0
    dsVictories.value = 0
    dsActiveHeroId.value = null
    dsHeroTurnDone.value = {}
  }

  return {
    monsters,
    currentRound,
    currentTurnIndex,
    damageLog,
    completedRounds,
    isActive,
    sessionId,
    startedAt,
    // DS state
    dsSetupDone,
    dsMalice,
    dsLivingHeroes,
    dsVictories,
    dsActiveHeroId,
    dsHeroTurnDone,
    dsNextRoundGain,
    // Getters
    liveMonsters,
    deadMonsters,
    hasEliteWithLair,
    lairActionTotal,
    currentPlayer,
    // Actions
    initDrawSteelCombat,
    adjustDsMalice,
    setDsLivingHeroes,
    setDsActiveHero,
    toggleHeroTurnDone,
    setMonsterActivated,
    toggleVillainAction,
    addMonster,
    removeMonster,
    applyDamage,
    toggleLegendaryResistance,
    toggleLegendaryAction,
    toggleLairAction,
    advanceTurn,
    retreatTurn,
    retreatRoundDirectly,
    advanceRound,
    buildRoundRecords,
    duplicateMonster,
    reorderMonsters,
    resetCombat,
    exportState,
    importState,
  }
})

// Re-export for convenience
import type { DamageEvent } from '../types/monster'
