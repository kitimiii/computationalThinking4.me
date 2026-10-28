<script setup lang="ts">
import type { BoardObject } from '~/utils/board-object'

const SIZES = [
  { label: 'S', fontSize: 'text-base' },
  { label: 'M', fontSize: 'text-lg' },
  { label: 'L', fontSize: 'text-2xl' },
  { label: 'XL', fontSize: 'text-3xl' },
]

defineProps<{ object: BoardObject }>()
const { updateObject } = useBoard()
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="size in SIZES"
      :key="size.fontSize"
      title="Schriftgröße"
      class="h-9 min-w-9 rounded-lg px-2 text-sm font-medium hover:bg-muted"
      :class="{ 'bg-muted': object.fontSize === size.fontSize }"
      @click="updateObject(object.id, { fontSize: size.fontSize })"
    >
      {{ size.label }}
    </button>
  </div>
</template>
