import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateSudoku } from '../composables/useSudokuGenerator'
import { fetchRecords, saveRecord } from '../services/api'

export type Cell = {
  value: number | null
  editable: boolean
  error: boolean
  drafts?: number[]
}

export const useSudokuStore = defineStore('sudoku', () => {
  const board = ref<Cell[][]>(
    Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => ({
        value: null,
        editable: true,
        error: false,
        drafts: [],
      })),
    ),
  )

  const hintsUsed = ref(0)
  const maxHints = 10
  const solution = ref<number[][] | null>(null)

  const score = ref(0)
  const errors = ref(0)
  const startTime = ref<number | null>(null)
  const endTime = ref<number | null>(null)

  const undoStack = ref<Cell[][][]>([])
  const redoStack = ref<Cell[][][]>([])

  const paused = ref(false)
  let pauseStart: number | null = null
  let totalPausedTime = 0

  const currentDifficulty = ref<'beginner' | 'intermediate' | 'hard' | 'expert'>('beginner')

  function cloneBoard(board: Cell[][]): Cell[][] {
    return board.map((row) =>
      row.map((cell) => ({
        value: cell.value,
        editable: cell.editable,
        error: cell.error,
        drafts: cell.drafts ? [...cell.drafts] : [],
      })),
    )
  }

  function pushUndo() {
    undoStack.value.push(cloneBoard(board.value))
    redoStack.value = []
  }

  function undo() {
    if (undoStack.value.length > 0) {
      redoStack.value.push(cloneBoard(board.value))

      const prev = undoStack.value.pop()
      if (prev) {
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            board.value[r][c].value = prev[r][c].value
            board.value[r][c].editable = prev[r][c].editable
            board.value[r][c].error = prev[r][c].error
            board.value[r][c].drafts = [...(prev[r][c].drafts ?? [])]
          }
        }
      }
    }
  }

  function redo() {
    if (redoStack.value.length > 0) {
      undoStack.value.push(cloneBoard(board.value))

      const next = redoStack.value.pop()
      if (next) {
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            board.value[r][c].value = next[r][c].value
            board.value[r][c].editable = next[r][c].editable
            board.value[r][c].error = next[r][c].error
            board.value[r][c].drafts = [...(next[r][c].drafts ?? [])]
          }
        }
      }
    }
  }

  function setCell(row: number, col: number, value: number | null) {
    const cell = board.value[row][col]
    if (!cell.editable) return

    pushUndo()

    const oldValue = cell.value
    cell.value = value

    if (value !== null) {
      clearDrafts(row, col)
      clearRelatedDrafts(row, col, value)
    }

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        board.value[r][c].error = false
      }
    }

    let hasError = false

    if (value !== null) {
      for (let i = 0; i < 9; i++) {
        if (i !== col && board.value[row][i].value === value) {
          board.value[row][i].error = true
          cell.error = true
          hasError = true
        }
        if (i !== row && board.value[i][col].value === value) {
          board.value[i][col].error = true
          cell.error = true
          hasError = true
        }
      }

      const boxRow = Math.floor(row / 3) * 3
      const boxCol = Math.floor(col / 3) * 3
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if ((r !== row || c !== col) && board.value[r][c].value === value) {
            board.value[r][c].error = true
            cell.error = true
            hasError = true
          }
        }
      }
    }

    if (value !== null && oldValue === null && !hasError) {
      addCorrectCell()
    } else if (hasError) {
      addError()
    }
  }

  function initializeBoard(puzzle: (number | null)[][]) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = puzzle[r][c]
        board.value[r][c].value = val
        board.value[r][c].editable = val === null
        board.value[r][c].error = false
      }
    }
  }

  function newGame(difficulty: 'beginner' | 'intermediate' | 'hard' | 'expert') {
    currentDifficulty.value = difficulty

    const { puzzle, solution: sol } = generateSudoku(difficulty)
    initializeBoard(puzzle)
    setSolution(sol)
    hintsUsed.value = 0

    undoStack.value = []
    redoStack.value = []

    resetScore()
    resetPause()
    startTimer()
  }

  function setSolution(sol: number[][]) {
    solution.value = sol
  }

  function giveHint() {
    if (!solution.value || hintsUsed.value >= maxHints) return

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = board.value[r][c]
        if (cell.editable && (cell.value === null || cell.value !== solution.value[r][c])) {
          pushUndo()
          cell.value = solution.value[r][c]
          hintsUsed.value++

          const penalty = 2 + hintsUsed.value
          score.value -= penalty

          return { row: r, col: c, value: solution.value[r][c] }
        }
      }
    }
    return null
  }

  function startTimer() {
    startTime.value = Date.now()
    endTime.value = null
  }

  function stopTimer() {
    endTime.value = Date.now()
  }

  function addCorrectCell() {
    score.value += 5
  }

  function addError() {
    score.value -= 1
    errors.value += 1
  }

  function finalizeScore() {
    if (startTime.value && endTime.value) {
      const elapsedSeconds = Math.floor((endTime.value - startTime.value) / 1000)
      score.value += 500 - elapsedSeconds
    }
  }

  function resetScore() {
    score.value = 0
    errors.value = 0
    startTime.value = null
    endTime.value = null
  }

  type RecordEntry = {
    name: string
    score: number
    time: number
    date: string
  }

  const records = ref<Record<string, RecordEntry[]>>({
    beginner: [],
    intermediate: [],
    hard: [],
    expert: [],
  })

  async function loadRecords() {
    try {
      const data = await fetchRecords()
      records.value = data
    } catch (error) {
      console.error('Kayıtlar yüklenemedi:', error)
    }
  }

  function saveRecords() {
    localStorage.setItem('sudoku-records', JSON.stringify(records.value))
  }

  async function addRecord(rank: string, entry: RecordEntry) {
    try {
      const recordData = {
        ...entry,
        difficulty: rank as 'beginner' | 'intermediate' | 'hard' | 'expert',
      }

      await saveRecord(recordData)

      await loadRecords()
    } catch (error) {
      console.error('APIye kayıt edilemedi, localStorage kullanılıyor:', error)
      if (!records.value[rank]) records.value[rank] = []
      records.value[rank].push(entry)
      records.value[rank] = records.value[rank].sort((a, b) => b.score - a.score).slice(0, 3)
      saveRecords()
    }
  }

  function isBoardComplete() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = board.value[r][c]
        if (cell.value === null || cell.error) return false
      }
    }
    return true
  }

  function toggleDraft(row: number, col: number, num: number) {
    const cell = board.value[row][col]
    if (!cell.editable) return
    if (!cell.drafts) cell.drafts = []
    if (cell.drafts.includes(num)) {
      cell.drafts = cell.drafts.filter((n) => n !== num)
    } else {
      cell.drafts.push(num)
      cell.drafts.sort()
    }
  }

  function clearDrafts(row: number, col: number) {
    const cell = board.value[row][col]
    if (cell.editable) {
      cell.drafts = []
    }
  }

  function clearRelatedDrafts(row: number, col: number, value: number) {
    for (let c = 0; c < 9; c++) {
      if (c !== col && board.value[row][c].editable) {
        const cell = board.value[row][c]
        if (cell.drafts) {
          cell.drafts = cell.drafts.filter((n) => n !== value)
        }
      }
    }

    for (let r = 0; r < 9; r++) {
      if (r !== row && board.value[r][col].editable) {
        const cell = board.value[r][col]
        if (cell.drafts) {
          cell.drafts = cell.drafts.filter((n) => n !== value)
        }
      }
    }

    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && board.value[r][c].editable) {
          const cell = board.value[r][c]
          if (cell.drafts) {
            cell.drafts = cell.drafts.filter((n) => n !== value)
          }
        }
      }
    }
  }

  function pauseGame() {
    if (!paused.value) {
      paused.value = true
      pauseStart = Date.now()
    }
  }

  function resumeGame() {
    if (paused.value && pauseStart) {
      paused.value = false
      totalPausedTime += Date.now() - pauseStart
      pauseStart = null
    }
  }

  function getElapsedTime() {
    if (!startTime.value) return 0
    const now = paused.value && pauseStart ? pauseStart : Date.now()
    return Math.floor((now - startTime.value - totalPausedTime) / 1000)
  }

  function resetPause() {
    paused.value = false
    pauseStart = null
    totalPausedTime = 0
  }

  loadRecords()

  return {
    board,
    setCell,
    initializeBoard,
    isBoardComplete,
    newGame,
    hintsUsed,
    maxHints,
    giveHint,
    setSolution,
    score,
    errors,
    startTimer,
    stopTimer,
    startTime,
    endTime,
    addCorrectCell,
    addError,
    finalizeScore,
    resetScore,
    records,
    addRecord,
    undo,
    redo,
    undoStack,
    redoStack,
    toggleDraft,
    paused,
    pauseGame,
    resumeGame,
    getElapsedTime,
    resetPause,
    currentDifficulty,
    clearDrafts,
    clearRelatedDrafts,
  }
})
