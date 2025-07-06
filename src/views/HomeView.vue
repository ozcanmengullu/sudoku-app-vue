<template>
  <div class="sudoku-app">
    <Controls />
    <div class="main-content">
      <div class="left-panel">
        <SudokuBoard />
        <AvailableDigits />
      </div>
      <div class="side-panel">
        <RecordsTable />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import Controls from '../components/Controls.vue'
import SudokuBoard from '../components/SudokuBoard.vue'
import AvailableDigits from '../components/AvailableDigits.vue'
import RecordsTable from '../components/RecordsTable.vue'

const sudokuStore = useSudokuStore()

function handleVisibilityChange() {
  if (document.hidden) {
    if (!sudokuStore.paused) {
      sudokuStore.pauseGame()
    }
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

watch(
  () =>
    sudokuStore.board
      .map((row) => row.map((cell) => cell.value + (cell.error ? 'e' : '')).join(','))
      .join(';'),
  () => {
    if (sudokuStore.isBoardComplete()) {
      sudokuStore.stopTimer()
      sudokuStore.finalizeScore()

      const name = prompt('Congratulations! Enter your name for the records table:') || 'Anonymous'

      const time = Math.floor(
        ((sudokuStore.endTime ?? Date.now()) - (sudokuStore.startTime ?? Date.now())) / 1000,
      )

      sudokuStore.addRecord(sudokuStore.currentDifficulty, {
        name,
        score: sudokuStore.score,
        time,
        date: new Date().toISOString(),
      })
    }
  },
)
</script>

<style scoped>
.sudoku-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  box-sizing: border-box;
}

.main-content {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}
.left-panel,
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    align-items: center;
  }

  .side-panel {
    width: 100%;
    align-items: center;
  }
}
</style>
