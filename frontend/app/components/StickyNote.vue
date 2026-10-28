<script setup lang="ts">
import type { BoardObject, BoardObjectKind } from '~/utils/board-object'
import type { Corner, Mode } from '~/composables/useBoard'

const HANDLE_CLASSES: Record<Corner, string> = {
  nw: 'left-0 top-0 cursor-nwse-resize',
  ne: 'left-full top-0 cursor-nesw-resize',
  sw: 'left-0 top-full cursor-nesw-resize',
  se: 'left-full top-full cursor-nwse-resize',
}
const SHAPE_CLASSES: Record<BoardObjectKind, string> = {
  note: 'shadow-md',
  text: '',
  circle: 'rounded-full shadow-md',
}

// Stateless: shows the object it gets and reports every user action to the central board state.
const props = defineProps<{ object: BoardObject }>()
const board = useBoard()

const scale = inject<Ref<number>>('canvasScale')
const selected = computed(() => board.selectedId.value === props.object.id)
const editing = computed(() => board.editingId.value === props.object.id)
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const content = useTemplateRef<HTMLElement>('content')

function startInteraction(event: PointerEvent, mode: Mode) {
  event.stopPropagation()
  board.select(props.object.id)
  if (editing.value) return
  board.startInteraction(props.object.id, mode, event.clientX, event.clientY)
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  board.moveInteraction(event.clientX, event.clientY, scale?.value ?? 1)
}

function updateText(event: Event) {
  board.updateObject(props.object.id, { text: (event.target as HTMLTextAreaElement).value })
}

async function focusTextarea(isEditing: boolean) {
  if (!isEditing) return
  await nextTick()
  textarea.value?.focus()
  textarea.value?.select()
}

// Grows the object to the next grid line when its text no longer fits. Circles keep their size to stay round.
async function fitToContent() {
  if (props.object.kind === 'circle') return
  await nextTick()
  const element = textarea.value ?? content.value
  if (!element) return
  const needed = Math.max(board.MIN_SIZE, Math.ceil(element.scrollHeight / GRID_SIZE) * GRID_SIZE)
  if (needed > props.object.height) board.updateObject(props.object.id, { height: needed })
}

watch(editing, focusTextarea)
watch(() => [props.object.text, props.object.width, props.object.height, editing.value], fitToContent)
onMounted(fitToContent)
</script>

<template>
  <div
    class="absolute touch-none"
    :class="[
      object.color,
      object.fontSize,
      SHAPE_CLASSES[object.kind],
      { 'text-center': object.kind === 'circle', 'font-bold': object.bold, 'border-4 border-black/30': object.border },
      selected ? 'ring-2 ring-blue-300' : '',
      editing ? 'cursor-text' : 'cursor-move',
    ]"
    :style="{ left: `${object.x}px`, top: `${object.y}px`, width: `${object.width}px`, height: `${object.height}px` }"
    @pointerdown="startInteraction($event, 'move')"
    @pointermove="onPointerMove"
    @pointerup="board.endInteraction()"
    @dblclick="board.startEditing(object.id)"
  >
    <textarea
      v-if="editing"
      ref="textarea"
      class="size-full p-4 bg-transparent resize-none outline-none"
      :value="object.text"
      @input="updateText"
      @blur="board.stopEditing()"
      @keydown.escape="board.stopEditing()"
    />
    <div
      v-else
      ref="content"
      class="size-full p-4 overflow-hidden whitespace-pre-wrap break-words select-none"
      :class="{ 'flex items-center justify-center': object.kind === 'circle' }"
    >
      {{ object.text }}
    </div>

    <template v-if="selected && !editing">
      <div
        v-for="(classes, corner) in HANDLE_CLASSES"
        :key="corner"
        class="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-blue-500 bg-background"
        :class="classes"
        @pointerdown="startInteraction($event, corner)"
      />
    </template>
  </div>
</template>
