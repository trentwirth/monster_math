import type { RuleSet } from '../types/ruleset'

const registry = new Map<string, RuleSet>()

export function registerRuleSet(rs: RuleSet): void {
  registry.set(rs.id, rs)
}

export function getRuleSet(id: string): RuleSet {
  const rs = registry.get(id)
  if (!rs) throw new Error(`Unknown ruleset: ${id}`)
  return rs
}

export function listRuleSets(): RuleSet[] {
  return Array.from(registry.values())
}
