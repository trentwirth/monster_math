import type { BasicMonster, EliteMonster, Monster } from './monster'

export interface RuleSet {
  id: string
  displayName: string
  version: string
  createBasicMonster(partial: Partial<BasicMonster>): BasicMonster
  createEliteMonster(partial: Partial<EliteMonster>): EliteMonster
  onRoundEnd(monster: Monster): Monster
  validateHp(monster: Monster, newHp: number): string | null
}
