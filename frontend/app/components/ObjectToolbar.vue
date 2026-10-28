<script setup lang="ts">
const GAP = 12

const { selectedObject } = useBoard()
const scale = inject<Ref<number>>('canvasScale')
</script>

<template>
  <!-- Sits just above the selected object and scales against the zoom, so it always looks the same size. -->
  <div
    v-if="selectedObject"
    class="absolute flex w-max items-center gap-1 rounded-xl border bg-background p-1.5 shadow-lg cursor-default"
    :style="{
      left: `${selectedObject.x}px`,
      top: `${selectedObject.y - GAP / (scale?.value ?? 1)}px`,
      transform: `translateY(-100%) scale(${1 / (scale?.value ?? 1)})`,
      transformOrigin: 'bottom left',
    }"
    @pointerdown.stop
  >
    <template v-for="(attribute, index) in KIND_ATTRIBUTES[selectedObject.kind]" :key="attribute">
      <div v-if="index > 0" class="mx-1 h-6 w-px bg-border" />
      <component :is="ATTRIBUTE_EDITORS[attribute]" :object="selectedObject" />
    </template>
  </div>
</template>
