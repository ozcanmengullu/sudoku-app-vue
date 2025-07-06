<template>
  <div class="sudoku-board">
    <div
      class="sudoku-row"
      v-for="(row, rowIndex) in board"
      :key="rowIndex"
      :class="{ 'row-complete': isRowComplete(rowIndex) }"
    >
      <SudokuCell
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        :row="rowIndex"
        :col="colIndex"
        :value="cell.value"
        :editable="cell.editable"
        :error="cell.error"
        :class="{ 'wave-animate': isCellAnimated(rowIndex, colIndex) }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import SudokuCell from './SudokuCell.vue'
import '../styles/SudokuBoard.css'

const { board } = useSudokuStore()

const animatedCells = ref<{ row: number; col: number }[]>([])

const completedRows = ref(new Set<number>())
const completedCols = ref(new Set<number>())
const completedBoxes = ref(new Set<string>())

function triggerWave(cells: { row: number; col: number }[]) {
  cells.forEach((cell, idx) => {
    setTimeout(() => {
      animatedCells.value.push(cell)
      setTimeout(() => {
        animatedCells.value = animatedCells.value.filter(
          (c) => !(c.row === cell.row && c.col === cell.col),
        )
      }, 500)
    }, idx * 60)
  })
}

watch(
  () => board.map((row) => row.map((cell) => cell.value)),
  () => {
    for (let r = 0; r < 9; r++) {
      if (isRowComplete(r) && !completedRows.value.has(r)) {
        completedRows.value.add(r)
        triggerWave(Array.from({ length: 9 }, (_, c) => ({ row: r, col: c })))
      }
    }
    for (let c = 0; c < 9; c++) {
      let complete = true
      for (let r = 0; r < 9; r++) {
        if (board[r][c].value === null || board[r][c].error) complete = false
      }
      if (complete && !completedCols.value.has(c)) {
        completedCols.value.add(c)
        triggerWave(Array.from({ length: 9 }, (_, r) => ({ row: r, col: c })))
      }
    }
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const coords = []
        const seen = new Set<number>()
        let complete = true
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const r = boxRow * 3 + i
            const c = boxCol * 3 + j
            coords.push({ row: r, col: c })
            const val = board[r][c].value
            if (!val || seen.has(val) || board[r][c].error) complete = false
            if (val !== null) seen.add(val)
          }
        }
        const boxKey = `${boxRow},${boxCol}`
        if (complete && !completedBoxes.value.has(boxKey)) {
          completedBoxes.value.add(boxKey)
          triggerWave(coords)
        }
      }
    }
  },
  { deep: true },
)

function isRowComplete(rowIndex: number) {
  return board[rowIndex].every((cell) => cell.value !== null && !cell.error)
}

function isCellAnimated(row: number, col: number) {
  return animatedCells.value.some((c) => c.row === row && c.col === col)
}
</script>
