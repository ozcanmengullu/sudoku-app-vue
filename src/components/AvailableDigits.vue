<template>
  <span class="available-digits-label">Available Digits:</span>
  <div class="available-digits">
    <span v-for="digit in 9" :key="digit" :class="{ used: isDigitUsedUp(digit) }">
      {{ digit }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import '../styles/AvailableDigits.css'

const sudokuStore = useSudokuStore()

const digitCounts = computed(() => {
  const counts = Array(10).fill(0)
  for (const row of sudokuStore.board) {
    for (const cell of row) {
      if (cell.value !== null) counts[cell.value]++
    }
  }
  return counts
})

function isDigitUsedUp(digit: number) {
  return digitCounts.value[digit] >= 9
}
</script>
