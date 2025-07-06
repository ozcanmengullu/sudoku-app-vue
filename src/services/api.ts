const API_BASE = import.meta.env.VITE_API_URL || '/api'

export interface RecordEntry {
  name: string
  score: number
  time: number
  difficulty: 'beginner' | 'intermediate' | 'hard' | 'expert'
  date?: string
}

export async function fetchRecords() {
  const response = await fetch('/api/records')
  return response.json()
}

export async function saveRecord(record: RecordEntry) {
  const response = await fetch(`${API_BASE}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  })
  return response.json()
}
