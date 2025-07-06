<template>
  <div class="controls">
    <Timer />

    <label>
      Difficulty:
      <select v-model="difficulty">
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="hard">Hard</option>
        <option value="expert">Expert</option>
      </select>
    </label>
    <button @click="startNewGame" :disabled="loading">New Game</button>
    <button @click="giveHint" :disabled="sudokuStore.hintsUsed >= sudokuStore.maxHints">
      💡 Hint ({{ sudokuStore.hintsUsed }}/{{ sudokuStore.maxHints }})
    </button>
    <button @click="sudokuStore.undo" :disabled="!sudokuStore.undoStack.length">Undo</button>
    <button @click="sudokuStore.redo" :disabled="!sudokuStore.redoStack.length">Redo</button>
    <button @click="togglePause" :class="{ 'pause-active': sudokuStore.paused }">
      {{ sudokuStore.paused ? '▶️ Resume' : '⏸️ Pause' }}
    </button>
  </div>
  <div class="score">Score: {{ sudokuStore.score }}</div>
  <div v-if="loading" class="spinner-overlay">
    <div class="spinner"></div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'SudokuControls' })
import { ref } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import Timer from './Timer.vue'
import '../styles/Controls.css'

const difficulty = ref<'beginner' | 'intermediate' | 'hard' | 'expert'>('beginner')
const sudokuStore = useSudokuStore()
const loading = ref(false)

async function startNewGame() {
  loading.value = true
  await Promise.resolve(sudokuStore.newGame(difficulty.value))
  await new Promise((res) => setTimeout(res, 500))
  loading.value = false
}

function giveHint() {
  sudokuStore.giveHint()
}

function togglePause() {
  if (sudokuStore.paused) {
    sudokuStore.resumeGame()
  } else {
    sudokuStore.pauseGame()
  }
}

startNewGame()
</script>
