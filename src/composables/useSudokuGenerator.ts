export function generateSudoku(difficulty: 'beginner' | 'intermediate' | 'hard' | 'expert'): {
  puzzle: (number | null)[][]
  solution: number[][]
} {
  function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  function fillBoard(board: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
          for (const num of nums) {
            if (isSafe(board, row, col, num)) {
              board[row][col] = num
              if (fillBoard(board)) return true
              board[row][col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  function isSafe(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false
    }
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (board[r][c] === num) return false
      }
    }
    return true
  }

  const visibleCellsByDifficulty = {
    beginner: [36, 40],
    intermediate: [32, 36],
    hard: [28, 32],
    expert: [24, 28],
  }
  const [minVisible, maxVisible] = visibleCellsByDifficulty[difficulty]
  const visibleCells = Math.floor(Math.random() * (maxVisible - minVisible + 1)) + minVisible

  const solution: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0))
  fillBoard(solution)

  const puzzle: (number | null)[][] = solution.map((row) => row.slice())
  let cellsToRemove = 81 - visibleCells
  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null
      cellsToRemove--
    }
  }

  return { puzzle, solution }
}
