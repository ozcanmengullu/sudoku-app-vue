import { describe, it, expect } from 'vitest'
import { generateSudoku } from '../../src/composables/useSudokuGenerator'

function isFull(board: (number | null)[][]): boolean {
  return board.every((row) => row.every((cell) => cell !== null))
}

function isValid(board: number[][]): boolean {
  for (let i = 0; i < 9; i++) {
    const row = new Set()
    const col = new Set()
    const box = new Set()
    for (let j = 0; j < 9; j++) {
      const rowVal = board[i][j]
      if (rowVal && row.has(rowVal)) return false
      if (rowVal) row.add(rowVal)
      const colVal = board[j][i]
      if (colVal && col.has(colVal)) return false
      if (colVal) col.add(colVal)
      const boxRow = 3 * Math.floor(i / 3) + Math.floor(j / 3)
      const boxCol = 3 * (i % 3) + (j % 3)
      const boxVal = board[boxRow][boxCol]
      if (boxVal && box.has(boxVal)) return false
      if (boxVal) box.add(boxVal)
    }
  }
  return true
}

describe('generateSudoku', () => {
  it('should generate a valid full solution', () => {
    const { solution } = generateSudoku('beginner')
    expect(isValid(solution)).toBe(true)
    expect(isFull(solution)).toBe(true)
  })

  it('should generate a puzzle with correct number of visible cells for each difficulty', () => {
    const difficulties = {
      beginner: [36, 40],
      intermediate: [32, 36],
      hard: [28, 32],
      expert: [24, 28],
    }
    for (const [level, [min, max]] of Object.entries(difficulties)) {
      const typedLevel = level as 'beginner' | 'intermediate' | 'hard' | 'expert'
      const { puzzle } = generateSudoku(typedLevel)
      const visible = puzzle.flat().filter((x) => x !== null).length
      expect(visible).toBeGreaterThanOrEqual(min)
      expect(visible).toBeLessThanOrEqual(max)
    }
  })

  it('should not have any cell with value outside 1-9 in solution', () => {
    const { solution } = generateSudoku('hard')
    for (const row of solution) {
      for (const cell of row) {
        expect(cell).toBeGreaterThanOrEqual(1)
        expect(cell).toBeLessThanOrEqual(9)
      }
    }
  })
})
