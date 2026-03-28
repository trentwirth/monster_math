<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
        <Transition name="modal">
          <div class="modal" v-if="show" :class="modalClass">
            <div class="modal-header">
              <div class="modal-header__title">
                <span v-if="badgeText" class="badge label" :class="badgeClass">{{ badgeText }}</span>
                <h2>{{ modalTitle }}</h2>
              </div>
              <IconButton variant="ghost" @click="$emit('close')" title="Close">✕</IconButton>
            </div>

            <div class="modal-body">
              <div class="field">
                <label class="label field__label">Name *</label>
                <input
                  ref="nameInput"
                  type="text"
                  class="text-input"
                  :placeholder="isDS ? 'e.g. Goblin Sniper' : 'e.g. Ancient Red Dragon'"
                  v-model="name"
                  @keydown.enter="submit"
                  maxlength="60"
                />
              </div>

              <!-- 5e basic / elite fields -->
              <template v-if="!isDS">
                <div class="field">
                  <label class="label field__label">Hit Points (HP) *</label>
                  <input type="number" class="text-input text-input--lg" placeholder="e.g. 546"
                    v-model.number="maxHp" min="1" @keydown.enter="submit" />
                </div>

                <template v-if="type === 'elite'">
                  <div class="field-row">
                    <div class="field">
                      <label class="label field__label">Leg. Resistances</label>
                      <input type="number" class="text-input" v-model.number="legendaryResistances" min="0" max="10" />
                    </div>
                    <div class="field">
                      <label class="label field__label">Leg. Action Points</label>
                      <input type="number" class="text-input" v-model.number="legendaryActionPoints" min="0" max="10" />
                    </div>
                  </div>

                  <div class="field">
                    <label class="label field__label">Lair Actions</label>
                    <div class="lair-toggle">
                      <label class="toggle-label">
                        <input type="checkbox" v-model="hasLairActions" />
                        <span>Has Lair Actions</span>
                      </label>
                      <input v-if="hasLairActions" type="number" class="text-input"
                        placeholder="# of lair actions" v-model.number="lairActionCount"
                        min="1" max="20" style="margin-top: var(--space-2);" />
                    </div>
                  </div>
                </template>
              </template>

              <!-- Draw Steel basic: just stamina -->
              <template v-else-if="type === 'basic'">
                <div class="field">
                  <label class="label field__label">Stamina *</label>
                  <input type="number" class="text-input text-input--lg" placeholder="e.g. 60"
                    v-model.number="maxHp" min="1" @keydown.enter="submit" />
                </div>
              </template>

              <!-- Draw Steel squad: stamina per minion + squad size -->
              <template v-else>
                <div class="field-row">
                  <div class="field">
                    <label class="label field__label">Squad Size *</label>
                    <input type="number" class="text-input text-input--lg"
                      v-model.number="squadSize" min="1" max="20" placeholder="e.g. 6" />
                  </div>
                  <div class="field">
                    <label class="label field__label">Stamina / Minion *</label>
                    <input type="number" class="text-input text-input--lg"
                      v-model.number="minionStamina" min="1" placeholder="e.g. 20" />
                  </div>
                </div>
                <div class="squad-preview" v-if="squadSize && minionStamina">
                  Total stamina: <strong>{{ squadSize * minionStamina }}</strong>
                  &nbsp;·&nbsp; {{ squadSize }} circles
                </div>
              </template>

              <!-- Villain flag (DS only) -->
              <div class="field" v-if="isDS">
                <label class="toggle-label">
                  <input type="checkbox" v-model="isVillain" />
                  <span>Villain? <span class="villain-hint">(adds villain action checkbox to card)</span></span>
                </label>
              </div>

              <!-- Duplicate (not for DS squad) -->
              <div class="field duplicate-field" v-if="!(isDS && type === 'elite')">
                <label class="toggle-label">
                  <input type="checkbox" v-model="isDuplicate" />
                  <span>Duplicate?</span>
                </label>
                <input type="number" class="text-input duplicate-count"
                  :class="{ 'duplicate-count--disabled': !isDuplicate }"
                  placeholder="How many? (e.g. 5)"
                  v-model.number="duplicateCount" :disabled="!isDuplicate" min="2" max="20" />
              </div>

              <p v-if="error" class="error-msg">{{ error }}</p>
            </div>

            <div class="modal-footer">
              <button class="btn-ghost" @click="$emit('close')">Cancel</button>
              <button class="btn-primary" @click="submit">Add</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import IconButton from '../shared/IconButton.vue'
import { useSettingsStore } from '../../stores/settings'

const props = defineProps<{
  show: boolean
  type: 'basic' | 'elite'
}>()

const emit = defineEmits<{
  close: []
  submit: [data: Record<string, any>]
}>()

const settingsStore = useSettingsStore()
const isDS = computed(() => settingsStore.activeRulesetId === 'drawsteel')

const nameInput = ref<HTMLInputElement | null>(null)
const name = ref('')
const maxHp = ref<number | null>(null)
const legendaryResistances = ref(3)
const legendaryActionPoints = ref(3)
const hasLairActions = ref(false)
const lairActionCount = ref<number | null>(null)
const squadSize = ref<number | null>(null)
const minionStamina = ref<number | null>(null)
const error = ref('')
const isDuplicate = ref(false)
const duplicateCount = ref<number | null>(null)
const isVillain = ref(false)

const modalTitle = computed(() => {
  if (isDS.value) return props.type === 'elite' ? 'Add Squad' : 'Add Creature'
  return props.type === 'elite' ? 'Add Elite Monster' : 'Add Basic Monster'
})
const badgeText = computed(() => {
  if (isDS.value) return props.type === 'elite' ? 'SQUAD' : null
  return props.type === 'elite' ? 'ELITE' : null
})
const badgeClass = computed(() => isDS.value ? 'badge--ds' : 'badge--elite')
const modalClass = computed(() => {
  if (props.type === 'elite') return isDS.value ? 'modal--ds-squad' : 'modal--elite'
  return ''
})

watch(() => props.show, async (v) => {
  if (v) {
    name.value = ''
    maxHp.value = null
    legendaryResistances.value = 3
    legendaryActionPoints.value = 3
    hasLairActions.value = false
    lairActionCount.value = null
    squadSize.value = null
    minionStamina.value = null
    error.value = ''
    isDuplicate.value = false
    duplicateCount.value = null
    isVillain.value = false
    await nextTick()
    nameInput.value?.focus()
  }
})

function submit() {
  error.value = ''
  if (!name.value.trim()) { error.value = 'Name is required.'; return }

  const data: Record<string, any> = { name: name.value.trim() }

  if (isDS.value) {
    if (props.type === 'elite') {
      // DS Squad
      if (!squadSize.value || squadSize.value < 1) { error.value = 'Squad size required.'; return }
      if (!minionStamina.value || minionStamina.value < 1) { error.value = 'Stamina per minion required.'; return }
      data.type = 'ds-squad'
      data.squadSize = squadSize.value
      data.minionStamina = minionStamina.value
      data.isVillain = isVillain.value
    } else {
      // DS Basic creature
      if (!maxHp.value || maxHp.value < 1) { error.value = 'Stamina must be at least 1.'; return }
      data.type = 'ds-basic'
      data.maxHp = maxHp.value
      data.isVillain = isVillain.value
    }
  } else {
    if (!maxHp.value || maxHp.value < 1) { error.value = 'HP must be at least 1.'; return }
    data.type = props.type
    data.maxHp = maxHp.value
    if (props.type === 'elite') {
      data.legendaryResistances = legendaryResistances.value
      data.legendaryActionPoints = legendaryActionPoints.value
      data.lairActionCount = hasLairActions.value ? (lairActionCount.value ?? 1) : null
    }
  }

  if (isDuplicate.value && duplicateCount.value && duplicateCount.value >= 2) {
    data.duplicateCount = duplicateCount.value
  }

  emit('submit', data)
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; backdrop-filter: blur(2px);
}
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  width: 420px; max-width: 95vw;
  display: flex; flex-direction: column; overflow: hidden;
}
.modal--elite { border-top: 3px solid var(--color-accent-gold); }
.modal--ds-squad { border-top: 3px solid var(--color-accent-gold); }
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--color-border);
}
.modal-header__title { display: flex; flex-direction: column; gap: var(--space-1); }
.badge { }
.badge--elite { color: var(--color-accent-gold); }
.badge--ds { color: var(--color-accent-gold); }
.modal-header h2 { font-size: var(--text-xl); }
.modal-body {
  padding: var(--space-5) var(--space-6);
  display: flex; flex-direction: column; gap: var(--space-4);
}
.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex; gap: var(--space-3); justify-content: flex-end;
}
.field { display: flex; flex-direction: column; gap: var(--space-2); }
.field__label { color: var(--color-text-muted); }
.field-row { display: flex; gap: var(--space-4); }
.field-row .field { flex: 1; }
.text-input {
  background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary); font-family: inherit; font-size: var(--text-base);
  width: 100%; transition: border-color var(--transition-fast);
}
.text-input:focus { border-color: var(--color-accent); outline: none; }
.text-input::placeholder { color: var(--color-text-muted); }
.text-input--lg { font-size: var(--text-xl); text-align: center; font-weight: 700; padding: var(--space-3); }
.lair-toggle { display: flex; flex-direction: column; }
.toggle-label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-base); }
.toggle-label input[type="checkbox"] { accent-color: var(--color-accent-gold); width: 16px; height: 16px; }
.squad-preview {
  font-size: var(--text-sm); color: var(--color-text-muted);
  padding: var(--space-2) var(--space-3);
  background: rgba(201, 168, 76, 0.06); border-radius: var(--radius-sm);
}
.squad-preview strong { color: var(--color-accent-gold); }
.duplicate-field { border-top: 1px solid var(--color-border); padding-top: var(--space-4); gap: var(--space-3); }
.duplicate-count { transition: opacity var(--transition-fast), border-color var(--transition-fast); }
.duplicate-count--disabled { opacity: 0.35; cursor: not-allowed; }
.villain-hint { font-size: var(--text-xs); color: var(--color-text-muted); }
.error-msg { color: var(--color-accent); font-size: var(--text-sm); padding: var(--space-2); background: rgba(233,69,96,0.1); border-radius: var(--radius-sm); }
.btn-primary {
  padding: var(--space-2) var(--space-6); background: var(--color-accent);
  color: white; border-radius: var(--radius-md);
  font-family: inherit; font-weight: 700; cursor: pointer;
  transition: background-color var(--transition-fast);
}
.btn-primary:hover { background: var(--color-accent-hover); }
.btn-ghost {
  padding: var(--space-2) var(--space-4); background: transparent;
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  color: var(--color-text-secondary); font-family: inherit; cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}
.btn-ghost:hover { border-color: var(--color-border-strong); color: var(--color-text-primary); }
</style>
