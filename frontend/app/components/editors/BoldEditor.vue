<script setup lang="ts">
import { Bold } from '@lucide/vue'
import type { BoardObject } from '~/utils/board-object'

defineProps<{ object: BoardObject }>()
const { updateObject } = useBoard()
</script>

<template>
  <button
    title="Fett (Strg+B)"
    class="flex size-9 items-center justify-center rounded-lg hover:bg-muted"
    :class="{ 'bg-muted': object.bold }"
    @click="updateObject(object.id, { bold: !object.bold })"
  >
    <Bold class="size-5" />
  </button>
</template>
