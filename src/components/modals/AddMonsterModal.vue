<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
        <Transition name="modal">
          <div class="modal" v-if="show" :class="{ 'modal--elite': type === 'elite' }">
            <div class="modal-header">
              <div class="modal-header__title">
                <span v-if="type === 'elite'" class="elite-badge label">ELITE</span>
                <h2>{{ type === 'elite' ? 'Add Elite Monster' : 'Add Basic Monster' }}</h2>
              </div>
              <IconButton variant="ghost" @click="$emit('close')" title="Close">✕</IconButton>
            </div>

            <div class="modal-body">
              <div class="field">
                <label class="label field__label">Monster Name *</label>
                <input
                  ref="nameInput"
                  type="text"
                  class="text-input"
                  placeholder="e.g. Ancient Red Dragon"
                  v-model="name"
                  @keydown.enter="submit"
                  maxlength="60"
                />
              </div>

              <div class="field">
                <label class="label field__label">Hit Points (HP) *</label>
                <input
                  type="number"
                  class="text-input text-input--lg"
                  placeholder="e.g. 546"
                  v-model.number="maxHp"
                  min="1"
                  @keydown.enter="submit"
                />
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
                    <input
                      v-if="hasLairActions"
                      type="number"
                      class="text-input"
                      placeholder="# of lair actions"
                      v-model.number="lairActionCount"
                      min="1"
                      max="20"
                      style="margin-top: var(--space-2);"
                    />
                  </div>
                </div>
              </template>

              <!-- Duplicate section -->
              <div class="field duplicate-field">
                <label class="toggle-label">
                  <input type="checkbox" v-model="isDuplicate" />
                  <span>Duplicate?</span>
                </label>
                <input
                  type="number"
                  class="text-input duplicate-count"
                  :class="{ 'duplicate-count--disabled': !isDuplicate }"
                  placeholder="How many? (e.g. 5)"
                  v-model.number="duplicateCount"
                  :disabled="!isDuplicate"
                  min="2"
                  max="20"
                />
              </div>

              <p v-if="error" class="error-msg">{{ error }}</p>
            </div>

            <div class="modal-footer">
              <button class="btn-ghost" @click="$emit('close')">Cancel</button>
              <button class="btn-primary" @click="submit">Add Monster</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import IconButton from '../shared/IconButton.vue'

const props = defineProps<{
  show: boolean
  type: 'basic' | 'elite'
}>()

const emit = defineEmits<{
  close: []
  submit: [data: Record<string, any>]
}>()

const nameInput = ref<HTMLInputElement | null>(null)
const name = ref('')
const maxHp = ref<number | null>(null)
const legendaryResistances = ref(3)
const legendaryActionPoints = ref(3)
const hasLairActions = ref(false)
const lairActionCount = ref<number | null>(null)
const error = ref('')
const isDuplicate = ref(false)
const duplicateCount = ref<number | null>(null)

watch(() => props.show, async (v) => {
  if (v) {
    name.value = ''
    maxHp.value = null
    legendaryResistances.value = 3
    legendaryActionPoints.value = 3
    hasLairActions.value = false
    lairActionCount.value = null
    error.value = ''
    isDuplicate.value = false
    duplicateCount.value = null
    await nextTick()
    nameInput.value?.focus()
  }
})

function submit() {
  error.value = ''
  if (!name.value.trim()) { error.value = 'Monster name is required.'; return }
  if (!maxHp.value || maxHp.value < 1) { error.value = 'HP must be at least 1.'; return }

  const data: Record<string, any> = {
    type: props.type,
    name: name.value.trim(),
    maxHp: maxHp.value,
  }

  if (props.type === 'elite') {
    data.legendaryResistances = legendaryResistances.value
    data.legendaryActionPoints = legendaryActionPoints.value
    data.lairActionCount = hasLairActions.value ? (lairActionCount.value ?? 1) : null
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
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  width: 420px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal--elite {
  border-top: 3px solid var(--color-accent-gold);
}
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}
.modal-header__title {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.elite-badge { color: var(--color-accent-gold); }
.modal-header h2 { font-size: var(--text-xl); }
.modal-body {
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
.field { display: flex; flex-direction: column; gap: var(--space-2); }
.field__label { color: var(--color-text-muted); }
.field-row { display: flex; gap: var(--space-4); }
.field-row .field { flex: 1; }
.text-input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  width: 100%;
  transition: border-color var(--transition-fast);
}
.text-input:focus { border-color: var(--color-accent); outline: none; }
.text-input::placeholder { color: var(--color-text-muted); }
.text-input--lg { font-size: var(--text-xl); text-align: center; font-weight: 700; padding: var(--space-3); }
.lair-toggle { display: flex; flex-direction: column; }
.toggle-label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-base); }
.toggle-label input[type="checkbox"] { accent-color: var(--color-accent-gold); width: 16px; height: 16px; }
.duplicate-field {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-4);
  gap: var(--space-3);
}
.duplicate-count {
  transition: opacity var(--transition-fast), border-color var(--transition-fast);
}
.duplicate-count--disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.error-msg { color: var(--color-accent); font-size: var(--text-sm); padding: var(--space-2); background: rgba(233,69,96,0.1); border-radius: var(--radius-sm); }
.btn-primary {
  padding: var(--space-2) var(--space-6);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}
.btn-primary:hover { background: var(--color-accent-hover); }
.btn-ghost {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-family: inherit;
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}
.btn-ghost:hover { border-color: var(--color-border-strong); color: var(--color-text-primary); }
</style>
