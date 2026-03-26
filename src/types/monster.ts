export interface BaseMonster {
  id: string
  name: string
  maxHp: number
  currentHp: number
  isDead: boolean
  rulesetId: string
}

export interface BasicMonster extends BaseMonster {
  type: 'basic'
}

export interface EliteMonster extends BaseMonster {
  type: 'elite'
  legendaryResistances: number
  legendaryResistancesUsed: number
  legendaryActionPoints: number
  legendaryActionsUsed: number
  lairActionCount: number | null
  lairActionsUsed: number
}

export type Monster = BasicMonster | EliteMonster

export interface DamageEvent {
  monsterId: string
  playerId: string
  amount: number
  round: number
}
