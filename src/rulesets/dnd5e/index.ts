import { nanoid } from 'nanoid'
import { registerRuleSet } from '../index'
import type { RuleSet } from '../../types/ruleset'
import type { BasicMonster, EliteMonster, Monster } from '../../types/monster'

const dnd5e: RuleSet = {
  id: 'dnd5e',
  displayName: 'D&D 5th Edition',
  version: '1.0.0',

  createBasicMonster(partial: Partial<BasicMonster>): BasicMonster {
    const maxHp = partial.maxHp ?? 10
    return {
      id: nanoid(),
      name: partial.name ?? 'Unknown Monster',
      maxHp,
      currentHp: partial.currentHp ?? maxHp,
      isDead: false,
      rulesetId: 'dnd5e',
      type: 'basic',
    }
  },

  createEliteMonster(partial: Partial<EliteMonster>): EliteMonster {
    const maxHp = partial.maxHp ?? 10
    return {
      id: nanoid(),
      name: partial.name ?? 'Unknown Elite',
      maxHp,
      currentHp: partial.currentHp ?? maxHp,
      isDead: false,
      rulesetId: 'dnd5e',
      type: 'elite',
      legendaryResistances: partial.legendaryResistances ?? 3,
      legendaryResistancesUsed: 0,
      legendaryActionPoints: partial.legendaryActionPoints ?? 3,
      legendaryActionsUsed: 0,
      lairActionCount: partial.lairActionCount ?? null,
      lairActionsUsed: 0,
    }
  },

  onRoundEnd(monster: Monster): Monster {
    if (monster.type === 'elite') {
      return { ...monster, legendaryActionsUsed: 0, lairActionsUsed: 0 }
    }
    return monster
  },

  validateHp(monster: Monster, newHp: number): string | null {
    if (newHp < 0) return null // We clamp to 0 in the store
    if (newHp > monster.maxHp) return `HP cannot exceed maximum (${monster.maxHp})`
    return null
  },
}

registerRuleSet(dnd5e)
export default dnd5e
