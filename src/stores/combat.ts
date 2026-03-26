import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import type { Monster, DamageEvent } from '../types/monster'
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

  // Getters
  const liveMonsters = computed(() => monsters.value.filter(m => !m.isDead))
  const deadMonsters = computed(() => monsters.value.filter(m => m.isDead))

  const hasEliteWithLair = computed(() =>
    monsters.value.some(m => m.type === 'elite' && m.lairActionCount !== null && !m.isDead)
  )

  const lairActionTotal = computed(() => {
    return monsters.value
      .filter(m => m.type === 'elite' && !m.isDead && m.lairActionCount !== null)
      .reduce((sum, m) => sum + (m.type === 'elite' ? (m.lairActionCount ?? 0) : 0), 0)
  })

  const currentPlayer = computed(() => {
    const settings = useSettingsStore()
    const pid = settings.turnOrder[currentTurnIndex.value]
    return settings.getPlayerById(pid) ?? null
  })

  function addMonster(data: Partial<Monster> & { type: 'basic' | 'elite' }) {
    const settings = useSettingsStore()
    const ruleset = getRuleSet(settings.activeRulesetId)
    let monster: Monster
    if (data.type === 'elite') {
      monster = ruleset.createEliteMonster(data as any)
    } else {
      monster = ruleset.createBasicMonster(data as any)
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
    monsters.value[idx] = {
      ...monster,
      currentHp: newHp,
      isDead: newHp <= 0,
    }

    // Only log positive damage (not healing) for DPR tracking
    if (amount > 0) {
      damageLog.value.push({
        monsterId,
        playerId,
        amount,
        round: currentRound.value,
      })
    }
  }

  function toggleLegendaryResistance(monsterId: string) {
    const idx = monsters.value.findIndex(m => m.id === monsterId)
    if (idx === -1) return
    const monster = monsters.value[idx]
    if (monster.type !== 'elite') return
    const used = monster.legendaryResistancesUsed
    const total = monster.legendaryResistances
    monsters.value[idx] = {
      ...monster,
      legendaryResistancesUsed: used >= total ? 0 : used + 1,
    }
  }

  function toggleLegendaryAction(monsterId: string) {
    const idx = monsters.value.findIndex(m => m.id === monsterId)
    if (idx === -1) return
    const monster = monsters.value[idx]
    if (monster.type !== 'elite') return
    const used = monster.legendaryActionsUsed
    const total = monster.legendaryActionPoints
    monsters.value[idx] = {
      ...monster,
      legendaryActionsUsed: used >= total ? 0 : used + 1,
    }
  }

  function toggleLairAction(monsterId: string) {
    const idx = monsters.value.findIndex(m => m.id === monsterId)
    if (idx === -1) return
    const monster = monsters.value[idx]
    if (monster.type !== 'elite' || monster.lairActionCount === null) return
    const used = monster.lairActionsUsed
    const total = monster.lairActionCount
    monsters.value[idx] = {
      ...monster,
      lairActionsUsed: used >= total ? 0 : used + 1,
    }
  }

  function advanceTurn() {
    const settings = useSettingsStore()
    const total = settings.turnOrder.length
    if (total === 0) return

    if (currentTurnIndex.value >= total - 1) {
      // Wrap: end of round
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

  function advanceRound() {
    const settings = useSettingsStore()
    // Capture round record
    const roundDamage: Record<string, number> = {}
    for (const pid of settings.turnOrder) {
      roundDamage[pid] = damageLog.value
        .filter(e => e.round === currentRound.value && e.playerId === pid && e.amount > 0)
        .reduce((sum, e) => sum + e.amount, 0)
    }
    completedRounds.value.push({
      round: currentRound.value,
      damageByPlayer: roundDamage,
    })

    // Apply ruleset round-end logic to all live monsters
    const rs = getRuleSet(settings.activeRulesetId)
    monsters.value = monsters.value.map(m => !m.isDead ? rs.onRoundEnd(m) : m)

    currentRound.value++
    currentTurnIndex.value = 0
  }

  function buildRoundRecords(): RoundRecord[] {
    const settings = useSettingsStore()
    // Include current (in-progress) round
    const inProgressDamage: Record<string, number> = {}
    for (const pid of settings.turnOrder) {
      inProgressDamage[pid] = damageLog.value
        .filter(e => e.round === currentRound.value && e.playerId === pid && e.amount > 0)
        .reduce((sum, e) => sum + e.amount, 0)
    }
    return [
      ...completedRounds.value,
      { round: currentRound.value, damageByPlayer: inProgressDamage },
    ]
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

  function resetCombat() {
    monsters.value = []
    currentRound.value = 1
    currentTurnIndex.value = 0
    damageLog.value = []
    completedRounds.value = []
    isActive.value = false
    sessionId.value = nanoid()
    startedAt.value = null
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
    liveMonsters,
    deadMonsters,
    hasEliteWithLair,
    lairActionTotal,
    currentPlayer,
    addMonster,
    removeMonster,
    applyDamage,
    toggleLegendaryResistance,
    toggleLegendaryAction,
    toggleLairAction,
    advanceTurn,
    retreatTurn,
    advanceRound,
    buildRoundRecords,
    reorderMonsters,
    resetCombat,
  }
})
