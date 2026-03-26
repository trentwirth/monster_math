<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
        <Transition name="modal">
          <div class="modal" v-if="show">
            <div class="modal-header">
              <h2>Fallen Monsters <span class="count">({{ monsters.length }})</span></h2>
              <IconButton variant="ghost" @click="$emit('close')" title="Close">✕</IconButton>
            </div>
            <div class="modal-body">
              <div v-if="monsters.length === 0" class="empty">
                <p class="text-muted text-sm">No fallen monsters yet.</p>
              </div>
              <div v-else class="dead-grid">
                <DeadMonsterCard v-for="m in monsters" :key="m.id" :monster="m" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-ghost" @click="$emit('close')">Back to Combat</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Monster } from '../../types/monster'
import DeadMonsterCard from '../cards/DeadMonsterCard.vue'
import IconButton from '../shared/IconButton.vue'

defineProps<{ show: boolean; monsters: Monster[] }>()
defineEmits(['close'])
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
  width: 640px;
  max-width: 95vw;
  max-height: 80vh;
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
.count { color: var(--color-text-muted); font-weight: 400; }
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5) var(--space-6);
}
.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
.empty { display: flex; align-items: center; justify-content: center; padding: var(--space-8); }
.dead-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-3);
}
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
