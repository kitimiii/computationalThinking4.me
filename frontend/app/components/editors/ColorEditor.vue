<script setup lang="ts">
import type { BoardObject } from '~/utils/board-object'

const COLORS = ['bg-yellow-200', 'bg-pink-200', 'bg-sky-200', 'bg-green-200', 'bg-red-300', 'bg-orange-300', 'bg-violet-300', 'bg-teal-300']

defineProps<{ object: BoardObject }>()
const { updateObject } = useBoard()
</script>

<template>
  <div class="flex items-center gap-1.5 px-1">
    <button
      v-for="color in COLORS"
      :key="color"
      title="Farbe"
      class="size-7 rounded-full"
      :class="[color, object.color === color ? 'ring-2 ring-blue-500 ring-offset-2' : '']"
      @click="updateObject(object.id, { color })"
    />
  </div>
</template>
