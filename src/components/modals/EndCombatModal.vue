<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
        <Transition name="modal">
          <div class="modal" v-if="show">
            <div class="modal-header">
              <h2>End Combat</h2>
              <IconButton variant="ghost" @click="$emit('close')" title="Close">✕</IconButton>
            </div>

            <div class="modal-body">
              <div class="summary">
                <div class="summary-stat">
                  <span class="summary-stat__value">{{ totalRounds }}</span>
                  <span class="label summary-stat__label">Rounds</span>
                </div>
                <div class="summary-stat">
                  <span class="summary-stat__value">{{ totalDamage.toLocaleString() }}</span>
                  <span class="label summary-stat__label">Total Damage</span>
                </div>
                <div class="summary-stat">
                  <span class="summary-stat__value">{{ deadCount }}</span>
                  <span class="label summary-stat__label">Monsters Slain</span>
                </div>
              </div>

              <div class="dpr-preview" v-if="roundRecords.length > 0">
                <h3 class="dpr-preview__title">Damage Per Round</h3>
                <div class="dpr-table-wrap">
                  <table class="dpr-table">
                    <thead>
                      <tr>
                        <th>Round</th>
                        <th v-for="p in players" :key="p.id">{{ p.name }}</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="rec in roundRecords" :key="rec.round">
                        <td>{{ rec.round }}</td>
                        <td v-for="p in players" :key="p.id">{{ rec.damageByPlayer[p.id] ?? 0 }}</td>
                        <td class="total-cell">{{ rowTotal(rec) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p v-if="exportStatus" class="export-status" :class="{ 'export-status--error': exportError }">
                {{ exportStatus }}
              </p>
            </div>

            <div class="modal-footer">
              <button class="btn-ghost" @click="$emit('close')">Keep Fighting</button>
              <button class="btn-export" @click="exportCsv" :disabled="exporting">
                {{ exporting ? 'Saving...' : 'Export CSV & End' }}
              </button>
              <button class="btn-primary" @click="endWithoutExport">End Without Export</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { Player } from '../../types/player'
import type { RoundRecord } from '../../types/combat'
import IconButton from '../shared/IconButton.vue'

const props = defineProps<{
  show: boolean
  players: Player[]
  roundRecords: RoundRecord[]
  deadCount: number
  sessionId: string
}>()

const emit = defineEmits(['close', 'confirmed'])

const exporting = ref(false)
const exportStatus = ref('')
const exportError = ref(false)

const totalRounds = computed(() => props.roundRecords.length)
const totalDamage = computed(() =>
  props.roundRecords.reduce((sum, r) => sum + Object.values(r.damageByPlayer).reduce((s, v) => s + v, 0), 0)
)

function rowTotal(rec: RoundRecord): number {
  return Object.values(rec.damageByPlayer).reduce((s, v) => s + v, 0)
}

async function exportCsv() {
  exporting.value = true
  exportStatus.value = ''
  exportError.value = false
  try {
    const playerNames = props.players.map(p => p.name)
    const result = await invoke<string>('export_combat_csv', {
      sessionId: props.sessionId,
      playerIds: props.players.map(p => p.id),
      playerNames,
      roundRecords: props.roundRecords,
    })
    exportStatus.value = `Saved to: ${result}`
    setTimeout(() => { emit('confirmed') }, 1200)
  } catch (e: any) {
    exportStatus.value = `Export failed: ${e}`
    exportError.value = true
  } finally {
    exporting.value = false
  }
}

function endWithoutExport() {
  emit('confirmed')
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
  width: 600px;
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
}
.modal-header h2 { font-size: var(--text-xl); }
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
  gap: var(--space-3);
  justify-content: flex-end;
}
.summary {
  display: flex;
  gap: var(--space-6);
  justify-content: center;
}
.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}
.summary-stat__value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-accent-gold);
}
.summary-stat__label { color: var(--color-text-muted); }
.dpr-preview__title {
  font-size: var(--text-md);
  font-weight: 700;
  margin-bottom: var(--space-3);
}
.dpr-table-wrap { overflow-x: auto; }
.dpr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.dpr-table th, .dpr-table td {
  padding: var(--space-2) var(--space-3);
  text-align: right;
  border-bottom: 1px solid var(--color-border);
}
.dpr-table th:first-child, .dpr-table td:first-child { text-align: left; }
.dpr-table th {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.total-cell { font-weight: 700; color: var(--color-accent-gold); }
.export-status {
  font-size: var(--text-sm);
  color: var(--color-success);
  background: rgba(76, 175, 128, 0.1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
}
.export-status--error {
  color: var(--color-accent);
  background: rgba(233, 69, 96, 0.1);
}
.btn-primary {
  padding: var(--space-2) var(--space-5);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}
.btn-primary:hover { background: var(--color-accent-hover); }
.btn-export {
  padding: var(--space-2) var(--space-5);
  background: transparent;
  border: 1px solid var(--color-accent-gold);
  border-radius: var(--radius-md);
  color: var(--color-accent-gold);
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.btn-export:hover:not(:disabled) { background: rgba(201, 168, 76, 0.15); }
.btn-export:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-ghost {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-family: inherit;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}
.btn-ghost:hover { border-color: var(--color-border-strong); }
</style>
