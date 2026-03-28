<template>
  <div class="malice-tracker">
    <div class="malice-tracker__top">
      <span class="malice-tracker__label label">Malice</span>
      <div class="malice-tracker__controls">
        <button class="malice-btn" @click="combatStore.adjustDsMalice(-1)" title="Spend malice">−</button>

        <!-- Click number to edit inline -->
        <span
          v-if="!editing"
          class="malice-tracker__value"
          title="Click to set malice"
          @click="startEdit"
        >{{ combatStore.dsMalice }}</span>
        <input
          v-else
          ref="inputEl"
          class="malice-input"
          type="number"
          min="0"
          :value="combatStore.dsMalice"
          @blur="commitEdit"
          @keydown.enter.prevent="commitEdit"
          @keydown.escape.prevent="editing = false"
        />

        <button class="malice-btn" @click="combatStore.adjustDsMalice(1)" title="Add malice">+</button>
      </div>
    </div>

    <div class="malice-tracker__bottom">
      <div class="heroes-row">
        <span class="heroes-label">Heroes</span>
        <button class="mini-btn" @click="combatStore.setDsLivingHeroes(combatStore.dsLivingHeroes - 1)">−</button>
        <span class="heroes-value">{{ combatStore.dsLivingHeroes }}</span>
        <button class="mini-btn" @click="combatStore.setDsLivingHeroes(combatStore.dsLivingHeroes + 1)">+</button>
      </div>
      <span class="next-round-gain">+{{ combatStore.dsNextRoundGain }} next round</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useCombatStore } from '../../stores/combat'

const combatStore = useCombatStore()
const editing = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)

async function startEdit() {
  editing.value = true
  await nextTick()
  inputEl.value?.select()
}

function commitEdit() {
  const val = parseInt(inputEl.value?.value ?? '', 10)
  if (!isNaN(val) && val >= 0) combatStore.dsMalice = val
  editing.value = false
}
</script>

<style scoped>
.malice-tracker {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  background: var(--color-surface);
  border: 2px solid rgba(192, 112, 16, 0.4);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-4);
  min-width: 140px;
}
.malice-tracker__top {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.malice-tracker__label {
  color: var(--color-accent-gold);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
}
.malice-tracker__controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.malice-tracker__value {
  font-size: var(--text-round);
  font-weight: 800;
  line-height: 1;
  color: var(--color-accent-gold);
  min-width: 2ch;
  text-align: center;
  letter-spacing: -0.02em;
  cursor: text;
  border-bottom: 1px dashed rgba(192, 112, 16, 0.4);
  transition: border-color var(--transition-fast);
}
.malice-tracker__value:hover { border-bottom-color: var(--color-accent-gold); }
.malice-input {
  width: 3ch;
  font-size: var(--text-round);
  font-weight: 800;
  line-height: 1;
  color: var(--color-accent-gold);
  background: var(--color-bg);
  border: 1px solid var(--color-accent-gold);
  border-radius: var(--radius-sm);
  text-align: center;
  font-family: inherit;
  padding: 0 2px;
}
.malice-input:focus { outline: none; }
.malice-btn {
  width: 22px; height: 22px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt); border: 1px solid var(--color-border);
  color: var(--color-text-secondary); font-size: var(--text-base);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  line-height: 1; transition: background-color var(--transition-fast), color var(--transition-fast);
}
.malice-btn:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
.malice-tracker__bottom {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-1);
  border-top: 1px solid var(--color-border); padding-top: var(--space-1);
}
.heroes-row { display: flex; align-items: center; gap: var(--space-2); }
.heroes-label { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.heroes-value { font-size: var(--text-sm); font-weight: 700; color: var(--color-accent-gold); min-width: 1.5ch; text-align: center; }
.mini-btn {
  width: 16px; height: 16px; border-radius: 3px;
  background: var(--color-surface-alt); border: 1px solid var(--color-border);
  color: var(--color-text-muted); font-size: 0.7rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background-color var(--transition-fast);
}
.mini-btn:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
.next-round-gain { font-size: var(--text-xs); color: var(--color-text-muted); }
</style>
