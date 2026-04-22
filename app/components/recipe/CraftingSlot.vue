<script setup lang="ts">
import type { CraftingSlot } from '~/types'

interface Props {
  slot: CraftingSlot
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'light',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{
  click: []
  clear: []
}>()

const sizes = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
}

const slotClass = computed(() => {
  const base = props.variant === 'dark' ? 'mc-slot-dark' : 'mc-slot'
  const hover = props.disabled ? '' : (props.variant === 'dark' ? 'mc-slot-dark-hover' : 'mc-slot-hover')
  return [base, hover, sizes[props.size]]
})
</script>

<template>
  <div
    :class="slotClass"
    class="relative group cursor-pointer"
    @click="emit('click')"
  >
    <!-- Item texture -->
    <img
      v-if="slot.texture"
      :src="slot.texture"
      :alt="slot.name || 'Item'"
      class="w-4/5 h-4/5 object-contain pixelated"
    >

    <!-- Count badge -->
    <span
      v-if="slot.count > 1"
      class="absolute bottom-0 right-0.5 mc-font text-xs text-white mc-text-shadow"
    >
      {{ slot.count }}
    </span>

    <!-- Clear button -->
    <button
      v-if="slot.texture && !disabled"
      class="absolute -top-1 -right-1 w-4 h-4 bg-[#AA0000] text-white text-[8px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
      @click.stop="emit('clear')"
    >
      ✕
    </button>

    <!-- Tooltip -->
    <div
      v-if="slot.name"
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#100010] border border-[#28007d] mc-font text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
    >
      {{ slot.name }}
    </div>
  </div>
</template>

<style scoped>
.mc-text-shadow {
  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
}

.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
