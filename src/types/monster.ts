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

// Draw Steel shared fields
export interface DrawSteelMonster extends BaseMonster {
  rulesetId: 'drawsteel'
  activated: boolean
  activationTime: number   // timestamp — orders activated cards at end of list
  isVillain: boolean       // whether this creature has villain actions
  villainActionUsed: boolean
}

export interface DrawSteelBasicMonster extends DrawSteelMonster {
  type: 'ds-basic'
}

export interface DrawSteelSquadMonster extends DrawSteelMonster {
  type: 'ds-squad'
  squadSize: number
  minionStamina: number   // HP per minion; maxHp = squadSize * minionStamina
}

export type Monster = BasicMonster | EliteMonster | DrawSteelBasicMonster | DrawSteelSquadMonster

// Type guards
export function isDrawSteel(m: Monster): m is DrawSteelBasicMonster | DrawSteelSquadMonster {
  return m.rulesetId === 'drawsteel'
}
export function isSquad(m: Monster): m is DrawSteelSquadMonster {
  return m.type === 'ds-squad'
}

export interface DamageEvent {
  monsterId: string
  playerId: string
  amount: number
  round: number
}
