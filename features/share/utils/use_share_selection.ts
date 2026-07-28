import { computed, type Ref, ref } from 'vue'

type ShareSelectable = { id: number }

export function useShareSelection(items: Ref<ShareSelectable[] | undefined>) {
  const selected = ref<Record<number, boolean>>({})

  const itemList = computed(() => items.value ?? [])

  const selectedIds = computed(() =>
    Object.entries(selected.value)
      .filter(([, on]) => on)
      .map(([id]) => Number(id))
  )

  const isAllSelected = computed(() => {
    const list = itemList.value
    if (list.length === 0) return false
    return list.every((item) => selected.value[item.id])
  })

  const isIndeterminate = computed(() => {
    const list = itemList.value
    if (list.length === 0) return false
    const count = selectedIds.value.length
    return count > 0 && count < list.length
  })

  function isSelected(id: number): boolean {
    return Boolean(selected.value[id])
  }

  function toggle(id: number): void {
    selected.value = {
      ...selected.value,
      [id]: !selected.value[id],
    }
  }

  function selectAll(): void {
    const next: Record<number, boolean> = {}
    for (const item of itemList.value) {
      next[item.id] = true
    }
    selected.value = next
  }

  function deselectAll(): void {
    selected.value = {}
  }

  function toggleAll(): void {
    if (isAllSelected.value) deselectAll()
    else selectAll()
  }

  function clear(): void {
    deselectAll()
  }

  function getSelectedItems<
    T extends ShareSelectable = ShareSelectable,
  >(): T[] {
    const ids = new Set(selectedIds.value)
    return itemList.value.filter((item) => ids.has(item.id)) as T[]
  }

  return {
    selected,
    isAllSelected,
    isIndeterminate,
    isSelected,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    clear,
    getSelectedItems,
  }
}
