<script setup lang="ts">
import { CircleDashed } from '@lucide/vue'
import type { BoardObject } from '~/utils/board-object'

defineProps<{ object: BoardObject }>()
const { updateObject } = useBoard()
</script>

<template>
  <button
    title="Rand"
    class="flex size-9 items-center justify-center rounded-lg hover:bg-muted"
    :class="{ 'bg-muted': object.border }"
    @click="updateObject(object.id, { border: !object.border })"
  >
    <CircleDashed class="size-5" />
  </button>
</template>
