<script setup lang="ts">
// A small label below an icon button that appears on hover or keyboard focus.
// align="end" keeps the label inside the screen for buttons at the right edge.
const { text, align = 'center' } = defineProps<{ text: string; align?: 'center' | 'end' }>()
</script>

<template>
  <span>
    <span class="group/label relative inline-flex">
      <slot />
      <span
        role="tooltip"
        class="pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded-lg border bg-white px-2.5 py-1 text-xs font-medium shadow-md opacity-0 transition-opacity group-hover/label:opacity-100 group-focus-within/label:opacity-100"
        :class="align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2'"
      >
        {{ text }}
      </span>
    </span>
  </span>
</template>
