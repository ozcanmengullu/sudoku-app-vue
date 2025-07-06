<template>
  <div class="records-table">
    <div class="records-header">
      <svg
        class="trophy-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="#f0c419"
        viewBox="0 0 24 24"
        width="24"
        height="24"
      >
        <path
          d="M21 3h-3V2a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1H3a1 1 0 0 0-1 1v2a5 5 0 0 0 5 5v2a5.002 5.002 0 0 0 4 4.9V20H8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-2.1A5.002 5.002 0 0 0 17 13v-2a5 5 0 0 0 5-5V4a1 1 0 0 0-1-1zM4 6V5h2v3.92A3.001 3.001 0 0 1 4 6zm16 0a3.001 3.001 0 0 1-2 2.92V5h2v1z"
        />
      </svg>
      <h3 class="leaderboard-title">Leaderboard</h3>
    </div>
    <div v-for="rank in ranks" :key="rank">
      <h4>{{ rank.charAt(0).toUpperCase() + rank.slice(1) }}</h4>
      <ol>
        <li v-for="entry in sudokuStore.records[rank]" :key="entry.date + entry.score">
          {{ entry.name }} — {{ entry.score }} pts ({{ entry.time }}s)
        </li>
        <li v-if="!sudokuStore.records[rank] || sudokuStore.records[rank].length === 0">
          No records yet.
        </li>
      </ol>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import '../styles/RecordsTable.css'
const sudokuStore = useSudokuStore()
const ranks = ['beginner', 'intermediate', 'hard', 'expert']

onMounted(() => {})
</script>
