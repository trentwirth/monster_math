<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
        <Transition name="modal">
          <div class="modal" v-if="show">
            <div class="modal-header">
              <h2>Player Sets</h2>
              <IconButton variant="ghost" @click="$emit('close')" title="Close">✕</IconButton>
            </div>

            <div class="modal-body">
              <p class="hint text-muted text-sm">
                Save your current player list as a named set, then load it anytime to replace the active roster.
              </p>

              <!-- Save as set -->
              <div class="save-row" v-if="!isSavingSet">
                <button
                  class="save-btn"
                  :disabled="settingsStore.turnOrder.length === 0"
                  @click="startSavingSet"
                >+ Save Current List as Set</button>
              </div>
              <div class="save-row save-row--input" v-else>
                <input
                  ref="setNameInputRef"
                  type="text"
                  class="set-name-input"
                  placeholder="Set name…"
                  v-model="newSetName"
                  @keydown.enter="commitSaveSet"
                  @keydown.escape="cancelSavingSet"
                  maxlength="24"
                />
                <button class="confirm-btn" :disabled="!newSetName.trim()" @click="commitSaveSet">✓</button>
                <button class="cancel-btn" @click="cancelSavingSet">✕</button>
              </div>

              <!-- Saved sets list -->
              <div class="sets-list" v-if="settingsStore.playerSets.length > 0">
                <div
                  v-for="set in settingsStore.playerSets"
                  :key="set.id"
                  class="set-row"
                >
                  <div class="set-row__info">
                    <span class="set-row__name">{{ set.name }}</span>
                    <span class="set-row__members text-muted text-sm">{{ set.playerNames.join(' · ') }}</span>
                  </div>
                  <div class="set-row__actions">
                    <button class="load-btn" @click="loadSet(set.id)">Load</button>
                    <IconButton variant="danger" small title="Delete set" @click="settingsStore.deletePlayerSet(set.id)">✕</IconButton>
                  </div>
                </div>
              </div>
              <p v-else class="empty text-muted text-sm">No saved sets yet.</p>
            </div>

            <div class="modal-footer">
              <button class="btn-primary" @click="$emit('close')">Done</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import IconButton from '../shared/IconButton.vue'

defineProps<{ show: boolean }>()
defineEmits(['close'])

const settingsStore = useSettingsStore()

const isSavingSet = ref(false)
const newSetName = ref('')
const setNameInputRef = ref<HTMLInputElement | null>(null)

async function startSavingSet() {
  isSavingSet.value = true
  newSetName.value = ''
  await nextTick()
  setNameInputRef.value?.focus()
}
function cancelSavingSet() {
  isSavingSet.value = false
  newSetName.value = ''
}
function commitSaveSet() {
  if (!newSetName.value.trim() || settingsStore.turnOrder.length === 0) return
  settingsStore.savePlayerSet(newSetName.value.trim(), settingsStore.turnOrder)
  cancelSavingSet()
}
function loadSet(setId: string) {
  settingsStore.loadPlayerSet(setId)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
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
  width: 420px;
  max-width: 95vw;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.modal-header h2 { font-size: var(--text-xl); }
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
.hint { line-height: 1.5; }

/* Save row */
.save-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.save-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface-alt);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-accent);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}
.save-btn:hover:not(:disabled) {
  background: var(--color-surface-hover);
  border-color: var(--color-accent);
}
.save-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.save-row--input { gap: var(--space-2); }
.set-name-input {
  flex: 1;
  background: var(--color-bg);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  outline: none;
}
.confirm-btn, .cancel-btn {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  flex-shrink: 0;
  transition: background-color var(--transition-fast);
}
.confirm-btn { background: var(--color-accent); color: #fff; }
.confirm-btn:hover:not(:disabled) { background: var(--color-accent-hover); }
.confirm-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.cancel-btn { background: var(--color-surface-alt); color: var(--color-text-secondary); }
.cancel-btn:hover { background: var(--color-surface-hover); }

/* Sets list */
.sets-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.set-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  transition: border-color var(--transition-fast);
}
.set-row:hover { border-color: var(--color-border-strong); }
.set-row__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.set-row__name {
  font-weight: 700;
  font-size: var(--text-base);
}
.set-row__members {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.set-row__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.load-btn {
  padding: var(--space-1) var(--space-3);
  background: transparent;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-family: inherit;
  font-size: var(--text-xs);
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.load-btn:hover { background: var(--color-accent); color: #fff; }

.empty { padding: var(--space-2) 0; }

.btn-primary {
  padding: var(--space-2) var(--space-6);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}
.btn-primary:hover { background: var(--color-accent-hover); }

.modal-overlay-enter-active, .modal-overlay-leave-active { transition: opacity 0.18s ease; }
.modal-overlay-enter-from, .modal-overlay-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97) translateY(-6px); }
</style>
