<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
        <Transition name="modal">
          <div class="modal" v-if="show">
            <div class="modal-header">
              <h2>Keyboard Shortcuts</h2>
              <IconButton variant="ghost" @click="$emit('close')" title="Close">✕</IconButton>
            </div>

            <div class="modal-body">
              <section class="shortcut-group">
                <h3 class="shortcut-group__title">Combat</h3>
                <div class="shortcut-row" v-for="s in combatShortcuts" :key="s.keys">
                  <div class="shortcut-keys">
                    <kbd v-for="k in s.keys.split('+')" :key="k">{{ k }}</kbd>
                  </div>
                  <span class="shortcut-desc">{{ s.desc }}</span>
                </div>
              </section>

              <section class="shortcut-group">
                <h3 class="shortcut-group__title">Monsters</h3>
                <div class="shortcut-row" v-for="s in monsterShortcuts" :key="s.keys">
                  <div class="shortcut-keys">
                    <kbd v-for="k in s.keys.split('+')" :key="k">{{ k }}</kbd>
                  </div>
                  <span class="shortcut-desc">{{ s.desc }}</span>
                </div>
              </section>

              <section class="shortcut-group">
                <h3 class="shortcut-group__title">Selection</h3>
                <div class="shortcut-row" v-for="s in selectionShortcuts" :key="s.keys">
                  <div class="shortcut-keys">
                    <kbd v-for="k in s.keys.split('+')" :key="k">{{ k }}</kbd>
                  </div>
                  <span class="shortcut-desc">{{ s.desc }}</span>
                </div>
              </section>
            </div>

            <div class="modal-footer">
              <button class="btn-primary" @click="$emit('close')">Close</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import IconButton from '../shared/IconButton.vue'

defineProps<{ show: boolean }>()
defineEmits(['close'])

const combatShortcuts = [
  { keys: '←', desc: 'Previous turn' },
  { keys: '→', desc: 'Next turn' },
]

const monsterShortcuts = [
  { keys: '⌘+N', desc: 'Add basic monster' },
  { keys: '⌘+E', desc: 'Add elite monster' },
  { keys: '⌘+D', desc: 'Duplicate selected card(s)' },
]

const selectionShortcuts = [
  { keys: '⌘+Click', desc: 'Toggle card in selection' },
  { keys: '⇧+Click', desc: 'Select range between last and clicked card' },
  { keys: 'Esc', desc: 'Clear selection' },
  { keys: 'Damage (any selected card)', desc: 'Applies to all selected cards' },
]
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-dead-overlay);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  width: min(480px, calc(100vw - 48px));
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 80px);
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

.shortcut-group__title {
  font-size: var(--text-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  margin-bottom: var(--space-3);
}
.shortcut-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}
.shortcut-row:last-child {
  border-bottom: none;
}
.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 140px;
  flex-shrink: 0;
}
kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 3px 7px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border-strong);
  border-bottom-width: 2px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.shortcut-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* Transitions (reuse global modal styles) */
.modal-overlay-enter-active, .modal-overlay-leave-active { transition: opacity 0.2s ease; }
.modal-overlay-enter-from, .modal-overlay-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96) translateY(-8px); }

.btn-primary {
  padding: var(--space-2) var(--space-5);
  background: var(--color-accent);
  border-radius: var(--radius-md);
  color: #fff;
  font-weight: 700;
  font-size: var(--text-base);
  font-family: inherit;
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}
.btn-primary:hover { background: var(--color-accent-hover); }
</style>
