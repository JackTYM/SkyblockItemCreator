<script setup lang="ts">
import type { CraftingSlot as CraftingSlotType } from '~/types'
import CraftingSlotComponent from './CraftingSlot.vue'

interface Props {
  modelValue: {
    grid: CraftingSlotType[][]
    result: CraftingSlotType
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Props['modelValue']]
  slotClick: [row: number, col: number]
  resultClick: []
}>()

const menuRef = ref<HTMLElement>()
defineExpose({ menuRef })

function clearSlot(row: number, col: number) {
  const newGrid = props.modelValue.grid.map((r, ri) =>
    r.map((c, ci) =>
      ri === row && ci === col ? { texture: null, name: null, count: 1 } : c
    )
  )
  emit('update:modelValue', { ...props.modelValue, grid: newGrid })
}

function clearResult() {
  emit('update:modelValue', {
    ...props.modelValue,
    result: { texture: null, name: null, count: 1 },
  })
}

function clearAll() {
  const emptyGrid = Array(3).fill(null).map(() =>
    Array(3).fill(null).map(() => ({ texture: null, name: null, count: 1 }))
  )
  emit('update:modelValue', {
    grid: emptyGrid,
    result: { texture: null, name: null, count: 1 },
  })
}
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Crafting table UI -->
    <div ref="menuRef" class="mc-panel p-3">
      <div class="flex items-center gap-4">
        <!-- 3x3 Grid -->
        <div class="grid grid-cols-3 gap-0.5 bg-[#555555] p-0.5">
          <template
            v-for="(row, rowIndex) in modelValue.grid"
            :key="rowIndex"
          >
            <CraftingSlotComponent
              v-for="(slot, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              :slot="slot"
              variant="light"
              size="lg"
              @click="emit('slotClick', rowIndex, colIndex)"
              @clear="clearSlot(rowIndex, colIndex)"
            />
          </template>
        </div>

        <!-- Arrow -->
        <div class="flex flex-col items-center gap-1">
          <div class="craft-arrow transform scale-150" />
        </div>

        <!-- Result slot -->
        <div class="bg-[#555555] p-0.5">
          <CraftingSlotComponent
            :slot="modelValue.result"
            variant="light"
            size="lg"
            @click="emit('resultClick')"
            @clear="clearResult"
          />
        </div>
      </div>
    </div>

    <!-- Clear button -->
    <button
      class="mt-3 text-xs text-[#FF5555] hover:text-[#FF7777] transition-colors"
      @click="clearAll"
    >
      Clear All
    </button>
  </div>
</template>
