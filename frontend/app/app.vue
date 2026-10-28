<script setup lang="ts">
import type { Variant } from '~/utils/variants'

const { objects, select, addObject } = useBoard()
const canvas = useTemplateRef('canvas')

function add(variant: Variant) {
  addObject(variant, canvas.value?.viewCenter() ?? { x: 0, y: 0 })
}

useShortcuts(add)
</script>

<template>
  <InfiniteCanvas ref="canvas" @pointerdown="select(null)">
    <StickyNote v-for="object in objects" :key="object.id" :object="object" />
    <ObjectToolbar />
  </InfiniteCanvas>
  <Toolbar @add="add" />
</template>
