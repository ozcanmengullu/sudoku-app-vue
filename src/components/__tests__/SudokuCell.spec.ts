import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SudokuCell from '../SudokuCell.vue'

vi.mock('../../stores/sudokuStore', () => ({
  useSudokuStore: () => ({
    setCell: vi.fn(),
    clearDrafts: vi.fn(),
    toggleDraft: vi.fn(),
  }),
}))

describe('SudokuCell.vue', () => {
  const baseProps = {
    row: 0,
    col: 0,
    value: 5,
    editable: true,
    error: false,
    drafts: [],
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders input when editable and not in draft mode', () => {
    const wrapper = mount(SudokuCell, { props: { ...baseProps } })
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('.prefilled-value').exists()).toBe(false)
  })

  it('renders prefilled value when not editable', () => {
    const wrapper = mount(SudokuCell, { props: { ...baseProps, editable: false, value: 7 } })
    expect(wrapper.find('.prefilled-value').exists()).toBe(true)
    expect(wrapper.text()).toContain('7')
  })

  it('applies error class when error is true', () => {
    const wrapper = mount(SudokuCell, { props: { ...baseProps, error: true } })
    expect(wrapper.classes()).toContain('cell-error')
  })

  it('shows draft numbers in draft mode', async () => {
    const wrapper = mount(SudokuCell, { props: { ...baseProps, drafts: [1, 3, 5] } })
    await wrapper.find('.toggle-draft-btn').trigger('click')
    expect(wrapper.find('.drafts').exists()).toBe(true)
    expect(wrapper.findAll('.draft-number.active').length).toBe(3)
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('5')
  })

  it('calls store.setCell when input is changed', async () => {
    const wrapper = mount(SudokuCell, { props: { ...baseProps } })
    const input = wrapper.find('input')
    await input.setValue('8')
    expect((input.element as HTMLInputElement).value).toBe('8')
  })

  it('toggles draft mode when button is clicked', async () => {
    const wrapper = mount(SudokuCell, { props: { ...baseProps } })
    const btn = wrapper.find('.toggle-draft-btn')
    expect(wrapper.find('.drafts').exists()).toBe(false)
    await btn.trigger('click')
    expect(wrapper.find('.drafts').exists()).toBe(true)
  })
})
