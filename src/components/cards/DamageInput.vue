<template>
  <div class="damage-input">
    <div class="damage-input__row">
      <input
        ref="inputRef"
        type="number"
        class="damage-input__field"
        placeholder="Damage (- to heal)"
        v-model.number="amount"
        @keydown.enter="submit"
        @focus="inputFocused = true"
        @blur="inputFocused = false"
      />
      <button class="damage-input__btn" @click="submit" :disabled="amount === null || amount === undefined || isNaN(amount as number)">
        Apply
      </button>
    </div>
    <div class="damage-input__attr" v-if="players.length > 0">
      <span class="label">Attribution:</span>
      <select v-model="selectedPlayerId" class="damage-input__select">
        <option v-for="p in players" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Player } from '../../types/player'

const props = defineProps<{
  players: Player[]
  currentPlayerId?: string
}>()

const emit = defineEmits<{
  submit: [amount: number, playerId: string]
}>()

const amount = ref<number | null>(null)
const selectedPlayerId = ref(props.currentPlayerId ?? props.players[0]?.id ?? '')
const inputRef = ref<HTMLInputElement | null>(null)
const inputFocused = ref(false)

watch(() => props.currentPlayerId, (id) => {
  if (id) selectedPlayerId.value = id
})

watch(() => props.players, (list) => {
  if (list.length > 0 && !selectedPlayerId.value) {
    selectedPlayerId.value = list[0].id
  }
}, { immediate: true })

function submit() {
  if (amount.value === null || amount.value === undefined || isNaN(amount.value)) return
  emit('submit', amount.value, selectedPlayerId.value)
  amount.value = null
  inputRef.value?.focus()
}
</script>

<style scoped>
.damage-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.damage-input__row {
  display: flex;
  gap: var(--space-2);
}
.damage-input__field {
  flex: 1;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  font-family: inherit;
  transition: border-color var(--transition-fast);
  min-width: 0;
}
.damage-input__field:focus {
  border-color: var(--color-accent);
  outline: none;
}
.damage-input__field::placeholder {
  color: var(--color-text-muted);
}
.damage-input__btn {
  padding: var(--space-2) var(--space-4);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  font-family: inherit;
  transition: background-color var(--transition-fast);
  white-space: nowrap;
  cursor: pointer;
}
.damage-input__btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
}
.damage-input__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.damage-input__attr {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.damage-input__select {
  flex: 1;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--text-sm);
  cursor: pointer;
}
.damage-input__select:focus {
  border-color: var(--color-accent);
  outline: none;
}
</style>
