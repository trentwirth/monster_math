import type { Monster } from './monster'

export interface TurnOrder {
  playerIds: string[]
  currentIndex: number
}

export interface RoundRecord {
  round: number
  damageByPlayer: Record<string, number>
}

export interface CombatSession {
  id: string
  rulesetId: string
  startedAt: string
  endedAt: string | null
  rounds: RoundRecord[]
  currentRound: number
  turnOrder: TurnOrder
  monsters: Monster[]
}
