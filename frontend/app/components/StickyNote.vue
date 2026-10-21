<script setup lang="ts">
import { Plus, X } from '@lucide/vue'

export interface Note {
  id: number
  x: number
  y: number
  width: number
  height: number
  text: string
}

const note = defineModel<Note>({ required: true })
const props = defineProps<{ zoom: number, grid: number }>()
const emit = defineEmits<{ add: [], delete: [] }>()

// dx/dy: which edges a corner moves (-1 = left/top, 1 = right/bottom).
const corners = [
  { dx: -1, dy: -1, class: '-top-1.5 -left-1.5 cursor-nwse-resize' },
  { dx: 1, dy: -1, class: '-top-1.5 -right-1.5 cursor-nesw-resize' },
  { dx: -1, dy: 1, class: '-bottom-1.5 -left-1.5 cursor-nesw-resize' },
  { dx: 1, dy: 1, class: '-bottom-1.5 -right-1.5 cursor-nwse-resize' },
] as const

const editing = ref(false)
const textarea = ref<HTMLTextAreaElement>()

const snap = (value: number) => Math.round(value / props.grid) * props.grid

// Follows the pointer and reports the movement in board units (screen pixels / zoom).
function track(e: PointerEvent, apply: (dx: number, dy: number) => void) {
  const startX = e.clientX
  const startY = e.clientY
  const move = (ev: PointerEvent) => apply((ev.clientX - startX) / props.zoom, (ev.clientY - startY) / props.zoom)
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

function startDrag(e: PointerEvent) {
  if (editing.value) return
  const { x, y } = note.value
  track(e, (dx, dy) => {
    note.value = { ...note.value, x: snap(x + dx), y: snap(y + dy) }
  })
}

// Moves one edge per axis; the opposite edge stays fixed.
function resizeAxis(start: number, size: number, delta: number, direction: number) {
  const min = props.grid * 4
  if (direction === 1) return { start, size: Math.max(min, snap(size + delta)) }
  const newStart = Math.min(start + size - min, snap(start + delta))
  return { start: newStart, size: start + size - newStart }
}

function startResize(e: PointerEvent, corner: typeof corners[number]) {
  const { x, y, width, height } = note.value
  track(e, (dx, dy) => {
    const h = resizeAxis(x, width, dx, corner.dx)
    const v = resizeAxis(y, height, dy, corner.dy)
    note.value = { ...note.value, x: h.start, width: h.size, y: v.start, height: v.size }
  })
}

async function startEditing() {
  editing.value = true
  await nextTick()
  textarea.value?.focus()
}

function updateText(e: Event) {
  note.value = { ...note.value, text: (e.target as HTMLTextAreaElement).value }
}
</script>

<template>
  <div
    class="group absolute flex rounded-sm bg-pink-300 p-3 shadow-md"
    :class="editing ? 'cursor-text' : 'cursor-grab active:cursor-grabbing'"
    :style="{ left: `${note.x}px`, top: `${note.y}px`, width: `${note.width}px`, height: `${note.height}px` }"
    @pointerdown="startDrag"
    @dblclick="startEditing"
  >
    <textarea
      ref="textarea"
      :value="note.text"
      :readonly="!editing"
      class="h-full w-full resize-none bg-transparent text-lg text-pink-950 outline-none"
      :class="{ 'pointer-events-none': !editing }"
      @input="updateText"
      @blur="editing = false"
      @keydown.esc="textarea?.blur()"
    />
    <button
      class="absolute top-2 right-2 rounded-sm p-0.5 text-pink-900 opacity-0 group-hover:opacity-100 hover:bg-pink-400"
      title="Post-it löschen"
      @pointerdown.stop
      @dblclick.stop
      @click="emit('delete')"
    >
      <X class="size-4" />
    </button>
    <button
      class="absolute right-2 bottom-2 rounded-sm p-0.5 text-pink-900 opacity-0 group-hover:opacity-100 hover:bg-pink-400"
      title="Post-it hinzufügen"
      @pointerdown.stop
      @dblclick.stop
      @click="emit('add')"
    >
      <Plus class="size-4" />
    </button>
    <div
      v-for="corner in corners"
      :key="corner.class"
      class="absolute size-3 rounded-full border border-pink-500 bg-white opacity-0 group-hover:opacity-100"
      :class="corner.class"
      @pointerdown.stop="startResize($event, corner)"
    />
  </div>
</template>
