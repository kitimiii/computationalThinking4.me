<script setup lang="ts">
import type { Variant } from '~/utils/variants'

defineEmits<{ add: [variant: Variant] }>()
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl border bg-background p-3 shadow-lg">
    <template v-for="(group, index) in VARIANT_GROUPS" :key="index">
      <div v-if="index > 0" class="mx-2 h-10 w-px bg-border" />
      <button
        v-for="variant in group"
        :key="variant.label"
        :title="`${variant.label} (${variantKey(variant)})`"
        class="flex size-14 items-center justify-center rounded-xl hover:bg-muted"
        @click="$emit('add', variant)"
      >
        <!-- Colored icons drop their outline; text icons keep it, since they have no fill. -->
        <component :is="variant.icon" class="size-9" :class="[variant.iconClass, { 'stroke-none': variant.iconClass }]" />
      </button>
    </template>
  </div>
</template>
