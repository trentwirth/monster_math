import type { Monster } from './monster'

export interface RuleSet {
  id: string
  displayName: string
  version: string
  createBasicMonster(partial: Record<string, any>): Monster
  createEliteMonster(partial: Record<string, any>): Monster
  onRoundEnd(monster: Monster): Monster
  validateHp(monster: Monster, newHp: number): string | null
}
