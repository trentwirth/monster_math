<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div class="modal-overlay" v-if="show" @click.self="onClose">
        <Transition name="modal">
          <div class="modal" v-if="show">
            <div class="modal-header">
              <h2>Settings</h2>
              <IconButton variant="ghost" @click="onClose" title="Close">✕</IconButton>
            </div>

            <div class="modal-body">
              <!-- Players section -->
              <section class="settings-section">
                <h3 class="settings-section__title">Players & Turn Order</h3>
                <p class="settings-section__hint text-muted text-sm">Add players in initiative order. Use ▲▼ to reorder.</p>

                <div class="player-list" v-if="settingsStore.players.length > 0">
                  <div
                    v-for="(pid, idx) in localOrder"
                    :key="pid"
                    class="player-row"
                  >
                    <span class="player-row__turn-badge">{{ idx + 1 }}</span>
                    <span class="player-row__name">{{ getPlayerName(pid) }}</span>
                    <div class="player-row__actions">
                      <IconButton variant="ghost" small title="Move up" :disabled="idx === 0" @click="movePlayer(idx, -1)">▲</IconButton>
                      <IconButton variant="ghost" small title="Move down" :disabled="idx === localOrder.length - 1" @click="movePlayer(idx, 1)">▼</IconButton>
                      <IconButton variant="danger" small title="Remove player" @click="removePlayer(pid)">✕</IconButton>
                    </div>
                  </div>
                </div>
                <p v-else class="text-muted text-sm" style="padding: var(--space-3) 0;">No players yet.</p>

                <div class="add-player-row">
                  <input
                    type="text"
                    class="add-player-input"
                    placeholder="Player name..."
                    v-model="newPlayerName"
                    @keydown.enter="addPlayer"
                    maxlength="30"
                  />
                  <button class="add-player-btn" @click="addPlayer" :disabled="!newPlayerName.trim()">Add</button>
                </div>
              </section>

              <!-- Ruleset section -->
              <section class="settings-section">
                <h3 class="settings-section__title">Rule Set</h3>
                <div class="ruleset-list">
                  <label
                    v-for="rs in ruleSets"
                    :key="rs.id"
                    class="ruleset-option"
                    :class="{ 'ruleset-option--active': settingsStore.activeRulesetId === rs.id }"
                  >
                    <input type="radio" :value="rs.id" v-model="selectedRuleset" />
                    <div class="ruleset-option__info">
                      <span class="ruleset-option__name">{{ rs.displayName }}</span>
                      <span class="ruleset-option__version text-muted text-xs">v{{ rs.version }}</span>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <div class="modal-footer">
              <button class="btn-primary" @click="save" :disabled="settingsStore.players.length === 0">
                {{ isFirstLaunch ? 'Start Combat →' : 'Save Settings' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import { listRuleSets } from '../../rulesets/index'
import IconButton from '../shared/IconButton.vue'

const props = defineProps<{ show: boolean; isFirstLaunch?: boolean }>()
const emit = defineEmits(['close'])

const settingsStore = useSettingsStore()
const ruleSets = listRuleSets()
const selectedRuleset = ref(settingsStore.activeRulesetId)
const newPlayerName = ref('')
const localOrder = ref([...settingsStore.turnOrder])

watch(() => settingsStore.turnOrder, (order) => {
  localOrder.value = [...order]
}, { deep: true })

function getPlayerName(pid: string) {
  return settingsStore.getPlayerName(pid)
}

function addPlayer() {
  const name = newPlayerName.value.trim()
  if (!name) return
  settingsStore.addPlayer(name)
  localOrder.value = [...settingsStore.turnOrder]
  newPlayerName.value = ''
}

function removePlayer(pid: string) {
  settingsStore.removePlayer(pid)
  localOrder.value = [...settingsStore.turnOrder]
}

function movePlayer(idx: number, direction: -1 | 1) {
  const toIdx = idx + direction
  if (toIdx < 0 || toIdx >= localOrder.value.length) return
  const arr = [...localOrder.value]
  ;[arr[idx], arr[toIdx]] = [arr[toIdx], arr[idx]]
  localOrder.value = arr
}

function save() {
  settingsStore.reorderTurns(localOrder.value)
  settingsStore.setRuleset(selectedRuleset.value)
  settingsStore.markConfigured()
  emit('close')
}

function onClose() {
  if (!props.isFirstLaunch) emit('close')
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
  width: 480px;
  max-width: 95vw;
  max-height: 85vh;
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
.modal-header h2 {
  font-size: var(--text-xl);
}
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
.settings-section__title {
  font-size: var(--text-md);
  font-weight: 700;
  margin-bottom: var(--space-2);
}
.settings-section__hint {
  margin-bottom: var(--space-3);
}
.player-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.player-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}
.player-row__turn-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-border-strong);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.player-row__name { flex: 1; font-weight: 600; }
.player-row__actions { display: flex; gap: var(--space-1); }
.add-player-row {
  display: flex;
  gap: var(--space-2);
}
.add-player-input {
  flex: 1;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  transition: border-color var(--transition-fast);
}
.add-player-input:focus {
  border-color: var(--color-accent);
  outline: none;
}
.add-player-input::placeholder { color: var(--color-text-muted); }
.add-player-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}
.add-player-btn:hover:not(:disabled) {
  background: var(--color-surface-hover);
  border-color: var(--color-border-strong);
}
.add-player-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ruleset-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.ruleset-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}
.ruleset-option--active { border-color: var(--color-accent-gold); }
.ruleset-option input[type="radio"] { accent-color: var(--color-accent-gold); }
.ruleset-option__info { display: flex; flex-direction: column; gap: 2px; }
.ruleset-option__name { font-weight: 600; }
.btn-primary {
  padding: var(--space-3) var(--space-6);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}
.btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
