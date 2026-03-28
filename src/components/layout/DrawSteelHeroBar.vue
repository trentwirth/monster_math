<template>
  <div class="hero-bar" v-if="settingsStore.players.length > 0">
    <div
      v-for="player in settingsStore.players"
      :key="player.id"
      class="hero-chip"
      :class="{
        'hero-chip--active': combatStore.dsActiveHeroId === player.id,
        'hero-chip--done': combatStore.dsHeroTurnDone[player.id],
      }"
      @click="toggleActive(player.id)"
    >
      <span class="hero-chip__name">{{ player.name }}</span>
      <label class="hero-chip__check" @click.stop title="Mark turn done">
        <input
          type="checkbox"
          :checked="combatStore.dsHeroTurnDone[player.id]"
          @change="combatStore.toggleHeroTurnDone(player.id)"
        />
        <span class="hero-chip__check-box" :class="{ 'hero-chip__check-box--done': combatStore.dsHeroTurnDone[player.id] }"></span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCombatStore } from '../../stores/combat'
import { useSettingsStore } from '../../stores/settings'

const combatStore = useCombatStore()
const settingsStore = useSettingsStore()

function toggleActive(playerId: string) {
  // Click active hero to deselect; click another to select
  combatStore.setDsActiveHero(
    combatStore.dsActiveHeroId === playerId ? null : playerId
  )
}
</script>

<style scoped>
.hero-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-6);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.hero-chip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    opacity var(--transition-fast);
  user-select: none;
}
.hero-chip:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-strong);
}

/* Active — selected hero */
.hero-chip--active {
  background: rgba(192, 112, 16, 0.15);
  border-color: var(--color-accent-gold);
}
.hero-chip--active .hero-chip__name {
  color: var(--color-accent-gold);
  font-weight: 700;
}

/* Done — turn is over */
.hero-chip--done {
  opacity: 0.5;
}
.hero-chip--done .hero-chip__name {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.hero-chip__name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
  white-space: nowrap;
}

/* Custom checkbox inside chip */
.hero-chip__check {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.hero-chip__check input { display: none; }
.hero-chip__check-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1.5px solid var(--color-border-strong);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}
.hero-chip__check-box--done {
  background: var(--color-accent-gold);
  border-color: var(--color-accent-gold);
}
</style>
