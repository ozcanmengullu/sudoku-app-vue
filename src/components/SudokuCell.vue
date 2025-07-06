<template>
  <div
    class="sudoku-cell"
    :class="{
      'cell-error': error,
      'cell-prefilled': !editable,
      'cell-animate': animate,
      'draft-mode': draftMode,
    }"
    @animationend="animate = false"
    @click="focusInput"
  >
    <template v-if="editable">
      <input
        v-if="!draftMode"
        ref="cellInput"
        type="text"
        maxlength="1"
        v-model="inputValue"
        @input="onInput"
        @keydown="onKeyDown"
        @blur="onBlur"
      />

      <div v-else class="drafts">
        <span
          v-for="n in 9"
          :key="n"
          :class="{
            active: localDrafts.includes(n),
            'draft-number': true,
          }"
          @click.stop="toggleDraftNumber(n)"
        >
          {{ n }}
        </span>
      </div>
    </template>

    <span v-else class="prefilled-value">{{ value }}</span>

    <button
      class="toggle-draft-btn"
      v-if="editable"
      @click.stop="toggleDraftMode"
      :class="{ active: draftMode }"
      :title="draftMode ? 'Switch to normal mode' : 'Switch to draft mode'"
    >
      ✏️
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import '../styles/SudokuCell.css'

const props = defineProps<{
  row: number
  col: number
  value: number | null
  editable: boolean
  error: boolean
  drafts?: number[]
}>()

const store = useSudokuStore()
const cellInput = ref<HTMLInputElement>()
const inputValue = ref(props.value?.toString() ?? '')
const draftMode = ref(false)
const localDrafts = ref([...(props.drafts ?? [])])
const animate = ref(false)

watch(
  () => props.value,
  (newVal) => {
    inputValue.value = newVal?.toString() ?? ''
    if (newVal !== null) {
      animate.value = true
    }
  },
)

watch(
  () => props.drafts,
  (newDrafts) => {
    localDrafts.value = [...(newDrafts ?? [])]
  },
  { deep: true },
)

function onInput() {
  const val = parseInt(inputValue.value)
  if (!isNaN(val) && val >= 1 && val <= 9) {
    store.setCell(props.row, props.col, val)
    store.clearDrafts(props.row, props.col)
  } else if (inputValue.value === '') {
    store.setCell(props.row, props.col, null)
  } else {
    inputValue.value = ''
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'd' || event.key === 'D') {
    event.preventDefault()
    toggleDraftMode()
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    store.setCell(props.row, props.col, null)
    inputValue.value = ''
  } else if (!/[1-9]/.test(event.key) && !['Tab', 'Enter', 'Escape'].includes(event.key)) {
    event.preventDefault()
  }
}

function onBlur() {}

async function focusInput() {
  if (props.editable && !draftMode.value) {
    await nextTick()
    cellInput.value?.focus()
  }
}

function toggleDraftNumber(n: number) {
  store.toggleDraft(props.row, props.col, n)
  if (localDrafts.value.includes(n)) {
    localDrafts.value = localDrafts.value.filter((num) => num !== n)
  } else {
    localDrafts.value = [...localDrafts.value, n].sort()
  }
}

function toggleDraftMode() {
  draftMode.value = !draftMode.value

  if (!draftMode.value) {
    nextTick(() => {
      cellInput.value?.focus()
    })
  }
}
</script>
