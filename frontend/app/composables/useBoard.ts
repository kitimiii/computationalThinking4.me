import { BoardObject } from '~/utils/board-object'
import type { Point, Variant } from '~/utils/variants'

export type Corner = 'nw' | 'ne' | 'sw' | 'se'
export type Mode = 'move' | Corner

interface Interaction {
  id: string
  mode: Mode
  startX: number
  startY: number
  start: BoardObject
}

const MIN_SIZE = GRID_SIZE * 3

// Resizing from a north or west corner moves the object so the opposite corner stays put.
function nextRect(mode: Mode, start: BoardObject, dx: number, dy: number): Partial<BoardObject> {
  if (mode === 'move') return { x: snapToGrid(start.x + dx), y: snapToGrid(start.y + dy) }
  const width = Math.max(MIN_SIZE, snapToGrid(start.width + (mode.endsWith('e') ? dx : -dx)))
  const height = Math.max(MIN_SIZE, snapToGrid(start.height + (mode.startsWith('s') ? dy : -dy)))
  return {
    width,
    height,
    x: mode.endsWith('w') ? start.x + start.width - width : start.x,
    y: mode.startsWith('n') ? start.y + start.height - height : start.y,
  }
}

// The single source of truth for everything on the board. Components only read it and call its actions.
export function useBoard() {
  // Spread into a plain object, because Nuxt can only send plain objects from the server to the browser.
  const objects = useState<BoardObject[]>('board-objects', () => [
    { ...new BoardObject({ kind: 'note', x: 120, y: 120, width: 192, height: 192, color: 'bg-yellow-200', fontSize: 'text-lg', bold: false, border: false, text: 'Hello, board!' }) },
  ])
  const selectedId = useState<string | null>('board-selected', () => null)
  const editingId = useState<string | null>('board-editing', () => null)
  const interaction = useState<Interaction | null>('board-interaction', () => null)
  const selectedObject = computed(() => objects.value.find((object) => object.id === selectedId.value) ?? null)

  function updateObject(id: string, patch: Partial<BoardObject>) {
    objects.value = objects.value.map((object) => (object.id === id ? { ...object, ...patch } : object))
  }

  function deleteObject(id: string) {
    objects.value = objects.value.filter((object) => object.id !== id)
    if (selectedId.value === id) selectedId.value = null
  }

  function addObject(variant: Variant, center: Point) {
    const object = variant.create(center)
    objects.value = [...objects.value, object]
    selectedId.value = object.id
  }

  function select(id: string | null) {
    selectedId.value = id
  }

  function startEditing(id: string) {
    editingId.value = id
  }

  function stopEditing() {
    editingId.value = null
  }

  function startInteraction(id: string, mode: Mode, startX: number, startY: number) {
    const start = objects.value.find((object) => object.id === id)
    if (start) interaction.value = { id, mode, startX, startY, start: { ...start } }
  }

  function moveInteraction(clientX: number, clientY: number, scale: number) {
    const current = interaction.value
    if (!current) return
    const dx = (clientX - current.startX) / scale
    const dy = (clientY - current.startY) / scale
    updateObject(current.id, nextRect(current.mode, current.start, dx, dy))
  }

  function endInteraction() {
    interaction.value = null
  }

  return {
    objects: readonly(objects),
    selectedId: readonly(selectedId),
    editingId: readonly(editingId),
    selectedObject,
    MIN_SIZE,
    updateObject,
    deleteObject,
    addObject,
    select,
    startEditing,
    stopEditing,
    startInteraction,
    moveInteraction,
    endInteraction,
  }
}
