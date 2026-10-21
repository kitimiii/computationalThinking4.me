<script setup lang="ts">
import type { Note } from './StickyNote.vue'

const GRID = 20
const MIN_ZOOM = 0.2
const MAX_ZOOM = 4

const camera = reactive({ x: 0, y: 0, zoom: 1 })
const notes = ref<Note[]>([{ id: 1, x: 100, y: 100, width: 200, height: 200, text: 'Doppelklick zum Bearbeiten' }])
let nextId = 2

// New note goes directly to the right of the source note, one grid cell apart.
function addNote(source: Note) {
  notes.value.push({ id: nextId++, x: source.x + source.width + GRID, y: source.y, width: 200, height: 200, text: '' })
}

function deleteNote(id: number) {
  notes.value = notes.value.filter(note => note.id !== id)
}

let panStart: { x: number, y: number, camX: number, camY: number } | null = null

function onPointerDown(e: PointerEvent) {
  if (e.target !== e.currentTarget) return
  panStart = { x: e.clientX, y: e.clientY, camX: camera.x, camY: camera.y }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!panStart) return
  camera.x = panStart.camX + e.clientX - panStart.x
  camera.y = panStart.camY + e.clientY - panStart.y
}

function onPointerUp() {
  panStart = null
}

// Zoom toward the cursor: the board point under the mouse stays in place.
function onWheel(e: WheelEvent) {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * Math.exp(-e.deltaY * 0.001)))
  const ratio = zoom / camera.zoom
  camera.x = e.clientX - (e.clientX - camera.x) * ratio
  camera.y = e.clientY - (e.clientY - camera.y) * ratio
  camera.zoom = zoom
}

const gridStyle = computed(() => {
  const size = GRID * camera.zoom
  return {
    backgroundImage: 'radial-gradient(circle, #d4d4d4 1px, transparent 1px)',
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `${camera.x - size / 2}px ${camera.y - size / 2}px`,
  }
})
</script>

<template>
  <div
    class="fixed inset-0 touch-none overflow-hidden bg-neutral-50 select-none"
    :style="gridStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @wheel.prevent="onWheel"
  >
    <div
      class="absolute top-0 left-0 origin-top-left"
      :style="{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }"
    >
      <StickyNote
        v-for="(note, i) in notes"
        :key="note.id"
        :model-value="note"
        :zoom="camera.zoom"
        :grid="GRID"
        @update:model-value="notes[i] = $event"
        @add="addNote(note)"
        @delete="deleteNote(note.id)"
      />
    </div>
  </div>
</template>
