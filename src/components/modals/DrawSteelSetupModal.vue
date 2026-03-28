<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div class="modal-overlay" v-if="show">
        <Transition name="modal">
          <div class="modal ds-setup-modal" v-if="show">
            <div class="modal-header">
              <div>
                <span class="ds-label label">DRAW STEEL</span>
                <h2>Combat Setup</h2>
              </div>
            </div>

            <div class="modal-body">
              <p class="hint text-muted text-sm">
                Starting Malice = avg. victories + heroes + 1. Malice gain per round = heroes + round number.
              </p>

              <div class="field">
                <label class="label field__label">Heroes in the party</label>
                <div class="counter-row">
                  <button class="counter-btn" @click="heroCount = Math.max(1, heroCount - 1)">−</button>
                  <span class="counter-value">{{ heroCount }}</span>
                  <button class="counter-btn" @click="heroCount++">+</button>
                </div>
              </div>

              <div class="field">
                <label class="label field__label">Average Victories per hero</label>
                <input
                  ref="victoriesInput"
                  type="number"
                  class="text-input text-input--lg"
                  v-model.number="avgVictories"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 3"
                />
              </div>

              <div class="malice-preview">
                <span class="malice-preview__label label">Starting Malice</span>
                <span class="malice-preview__value">{{ startingMalice }}</span>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-primary" @click="submit" :disabled="heroCount < 1">
                Begin Combat
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useSettingsStore } from '../../stores/settings'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ submit: [heroCount: number, avgVictories: number] }>()

const settingsStore = useSettingsStore()
const heroCount = ref(Math.max(1, settingsStore.players.length))
const avgVictories = ref<number>(0)
const victoriesInput = ref<HTMLInputElement | null>(null)

const startingMalice = computed(() =>
  Math.round(avgVictories.value ?? 0) + heroCount.value + 1
)

watch(() => props.show, async (v) => {
  if (v) {
    heroCount.value = Math.max(1, settingsStore.players.length)
    avgVictories.value = 0
    await nextTick()
    victoriesInput.value?.focus()
  }
})

function submit() {
  emit('submit', heroCount.value, avgVictories.value ?? 0)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(3px);
}
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  width: 380px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 3px solid var(--color-accent-gold);
}
.modal-header {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}
.ds-label { color: var(--color-accent-gold); display: block; margin-bottom: var(--space-1); }
.modal-header h2 { font-size: var(--text-xl); }
.modal-body {
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.hint { line-height: 1.5; }
.field { display: flex; flex-direction: column; gap: var(--space-2); }
.field__label { color: var(--color-text-muted); }
.counter-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.counter-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: var(--text-xl);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
}
.counter-btn:hover { background: var(--color-surface-hover); }
.counter-value {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-accent-gold);
  min-width: 2ch;
  text-align: center;
}
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
.text-input:focus { border-color: var(--color-accent-gold); outline: none; }
.text-input--lg { font-size: var(--text-xl); text-align: center; font-weight: 700; padding: var(--space-3); }
.malice-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: rgba(201, 168, 76, 0.08);
  border: 1px solid rgba(201, 168, 76, 0.2);
  border-radius: var(--radius-md);
}
.malice-preview__label { color: var(--color-accent-gold); font-size: var(--text-sm); }
.malice-preview__value {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-accent-gold);
}
.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
.btn-primary {
  padding: var(--space-2) var(--space-6);
  background: var(--color-accent-gold);
  color: var(--color-bg);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}
.btn-primary:hover { opacity: 0.85; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
