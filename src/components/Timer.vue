<template>
  <div class="timer">
    <span class="timer-label">Time:</span>
    <span class="timer-value">{{ formatTime(elapsedTime) }}</span>
    <span v-if="paused" class="paused-indicator">⏸️ PAUSED</span>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'SudokuTimer' })
import { ref, onMounted, onUnmounted } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import { storeToRefs } from 'pinia'
import '../styles/Timer.css'

const store = useSudokuStore()
const { paused } = storeToRefs(store)
const elapsedTime = ref(0)
let timerInterval: number | null = null

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function updateTimer() {
  if (!paused.value) {
    elapsedTime.value = store.getElapsedTime()
  }
}

onMounted(() => {
  timerInterval = window.setInterval(updateTimer, 1000)
  updateTimer()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>
