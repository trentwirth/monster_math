import { nanoid } from 'nanoid'
import { registerRuleSet } from '../index'
import type { RuleSet } from '../../types/ruleset'
import type { Monster } from '../../types/monster'

const drawsteel: RuleSet = {
  id: 'drawsteel',
  displayName: 'Draw Steel',
  version: '1.0.0',

  createBasicMonster(partial: Record<string, any>): Monster {
    const maxHp = partial.maxHp ?? 10
    return {
      id: nanoid(),
      name: partial.name ?? 'Unknown Creature',
      maxHp,
      currentHp: maxHp,
      isDead: false,
      rulesetId: 'drawsteel',
      type: 'ds-basic',
      activated: false,
      activationTime: 0,
      isVillain: partial.isVillain ?? false,
      villainActionUsed: false,
    }
  },

  createEliteMonster(partial: Record<string, any>): Monster {
    const squadSize = partial.squadSize ?? 4
    const minionStamina = partial.minionStamina ?? 10
    const maxHp = squadSize * minionStamina
    return {
      id: nanoid(),
      name: partial.name ?? 'Unknown Squad',
      maxHp,
      currentHp: maxHp,
      isDead: false,
      rulesetId: 'drawsteel',
      type: 'ds-squad',
      squadSize,
      minionStamina,
      activated: false,
      activationTime: 0,
      isVillain: partial.isVillain ?? false,
      villainActionUsed: false,
    }
  },

  onRoundEnd(monster: Monster): Monster {
    return monster
  },

  validateHp(monster: Monster, newHp: number): string | null {
    if (newHp > monster.maxHp) return `Stamina cannot exceed maximum (${monster.maxHp})`
    return null
  },
}

registerRuleSet(drawsteel)
export default drawsteel
