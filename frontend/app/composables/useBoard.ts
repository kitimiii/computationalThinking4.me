import type { BoardObject, ObjectTemplate, Rect, StyleChanges, TextObject } from '~/types/canvas-object'

const TEXT_DEFAULTS = { text: '', fontSize: FONT_SIZES.M, bold: false }

// Starting attributes of a new object, per variant. Only variants with text get text attributes.
const DEFAULTS: Record<BoardObject['type'], Rect & Partial<TextObject>> = {
  'sticky-note': { x: 0, y: 0, width: GRID_SIZE * 8, height: GRID_SIZE * 8, ...TEXT_DEFAULTS },
  'text': { x: 0, y: 0, width: GRID_SIZE * 10, height: GRID_SIZE * 3, ...TEXT_DEFAULTS },
  'circle': { x: 0, y: 0, width: GRID_SIZE * 6, height: GRID_SIZE * 6 },
}

const API = 'http://localhost:3001'
const PATCH_DELAY_MS = 300

// Changes waiting for their PATCH, and the timers that will send them (per object id).
const pending = new Map<string, object>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

// The board state is the single source of truth for which objects exist and what they look like.
// Components only read it; every change goes through one of the functions below.
export function useBoard() {
  const objects = useState<BoardObject[]>('objects', () => [])
  const loaded = useState('objects-loaded', () => false)

  // Every change is applied locally first, then reported to the backend.
  function send(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: object) {
    $fetch(`${API}${path}`, { method, body }).catch(console.error)
  }

  if (import.meta.client && !loaded.value) {
    loaded.value = true
    $fetch<BoardObject[]>(`${API}/objects`).then(list => (objects.value = list)).catch(console.error)
  }

  function addObject(template: ObjectTemplate, centerX: number, centerY: number) {
    const defaults = DEFAULTS[template.type]
    const id = crypto.randomUUID()
    const x = snapToGrid(centerX - defaults.width / 2)
    const y = snapToGrid(centerY - defaults.height / 2)
    const object = { ...defaults, ...template, id, x, y } as BoardObject
    objects.value = [...objects.value, object]
    send('/objects', 'POST', object)
    return id
  }

  // Works for every variant: the copy keeps all attributes except the id.
  function addCopy(source: BoardObject) {
    const id = crypto.randomUUID()
    const object = { ...source, id }
    objects.value = [...objects.value, object]
    send('/objects', 'POST', object)
    return id
  }

  function removeObject(id: string) {
    objects.value = objects.value.filter(object => object.id !== id)
    clearTimeout(timers.get(id))
    timers.delete(id)
    pending.delete(id)
    send(`/objects/${id}`, 'DELETE')
  }

  // Local state changes on every call; the backend gets one PATCH with the merged changes after a pause.
  function updateObject(id: string, changes: Partial<Rect> & StyleChanges & { text?: string }) {
    objects.value = objects.value.map(object => (object.id === id ? ({ ...object, ...changes } as BoardObject) : object))
    pending.set(id, { ...pending.get(id), ...changes })
    clearTimeout(timers.get(id))
    timers.set(id, setTimeout(() => {
      send(`/objects/${id}`, 'PATCH', pending.get(id))
      timers.delete(id)
      pending.delete(id)
    }, PATCH_DELAY_MS))
  }

  function moveObject(id: string, x: number, y: number) {
    updateObject(id, { x, y })
  }

  function resizeObject(id: string, rect: Rect) {
    updateObject(id, rect)
  }

  function updateText(id: string, text: string) {
    updateObject(id, { text })
  }

  function updateStyle(id: string, changes: StyleChanges) {
    updateObject(id, changes)
  }

  return { objects: readonly(objects), addObject, addCopy, removeObject, moveObject, resizeObject, updateText, updateStyle }
}
