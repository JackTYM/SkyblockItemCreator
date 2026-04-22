<script setup lang="ts">
import type { CraftingSlot } from '~/types'

interface Props {
  modelValue: {
    grid: CraftingSlot[][]
    result: CraftingSlot
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

function getSlot(row: number, col: number): CraftingSlot {
  return props.modelValue.grid[row]?.[col] ?? { texture: null, name: null, count: 1 }
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

// Minecraft textures from InventivetalentDev/minecraft-assets
const blackPane = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/black_stained_glass.png'
const redPane = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/red_stained_glass.png'
const greenPane = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/lime_stained_glass.png'
const lightGrayPane = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/light_gray_stained_glass.png'
const barrier = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/barrier.png'
const arrow = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/arrow.png'

// Check if result slot has an item
const hasResult = computed(() => !!props.modelValue.result.texture)

// Grid layout: 9 columns x 6 rows
// Positions use (x,y) starting at (1,1) top-left
// Craft slots: (2,2)-(4,4)
// Barrier/result: (6,3)
// Light gray: (8,2), (8,3), (8,4)
// Bottom row: all red with arrow at (5,6)

type SlotType = 'gray' | 'light-gray' | 'red' | 'craft' | 'result' | 'arrow' | 'empty'

interface GridSlot {
  type: SlotType
  craftRow?: number
  craftCol?: number
}

// Build the 9x6 grid
const gridLayout = computed<GridSlot[][]>(() => {
  const grid: GridSlot[][] = []

  for (let y = 1; y <= 6; y++) {
    const row: GridSlot[] = []
    for (let x = 1; x <= 9; x++) {
      // Row 6: all red except middle (5) is arrow
      if (y === 6) {
        if (x === 5) {
          row.push({ type: 'arrow' })
        } else {
          row.push({ type: 'red' })
        }
      }
      // Craft slots: columns 2-4, rows 2-4
      else if (x >= 2 && x <= 4 && y >= 2 && y <= 4) {
        row.push({ type: 'craft', craftRow: y - 2, craftCol: x - 2 })
      }
      // Result/barrier at (6,3)
      else if (x === 6 && y === 3) {
        row.push({ type: 'result' })
      }
      // Light gray at (8,2), (8,3), (8,4)
      else if (x === 8 && y >= 2 && y <= 4) {
        row.push({ type: 'light-gray' })
      }
      // Everything else is gray
      else {
        row.push({ type: 'gray' })
      }
    }
    grid.push(row)
  }

  return grid
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="skyblock-menu" ref="menuRef">
      <div class="title-bar mc-font">Craft Item</div>

      <div class="menu-grid">
        <template v-for="(row, rowIdx) in gridLayout" :key="`row-${rowIdx}`">
          <template v-for="(slot, colIdx) in row" :key="`slot-${rowIdx}-${colIdx}`">
            <!-- Gray filler -->
            <div v-if="slot.type === 'gray'" class="slot slot-gray">
              <img :src="blackPane" alt="" class="pane-img">
            </div>

            <!-- Light gray filler -->
            <div v-else-if="slot.type === 'light-gray'" class="slot slot-light-gray">
              <img :src="lightGrayPane" alt="" class="pane-img">
            </div>

            <!-- Red/Green filler (green when result has item) -->
            <div v-else-if="slot.type === 'red'" class="slot slot-red">
              <img :src="hasResult ? greenPane : redPane" alt="" class="pane-img">
            </div>

            <!-- Craft slot -->
            <div
              v-else-if="slot.type === 'craft'"
              class="slot slot-empty craft-slot"
              @click="emit('slotClick', slot.craftRow!, slot.craftCol!)"
            >
              <img
                v-if="getSlot(slot.craftRow!, slot.craftCol!).texture"
                :src="getSlot(slot.craftRow!, slot.craftCol!).texture!"
                class="item-img"
              >
              <span
                v-if="getSlot(slot.craftRow!, slot.craftCol!).count > 1"
                class="count"
              >
                {{ getSlot(slot.craftRow!, slot.craftCol!).count }}
              </span>
            </div>

            <!-- Result slot -->
            <div
              v-else-if="slot.type === 'result'"
              class="slot slot-empty result-slot"
              @click="emit('resultClick')"
            >
              <template v-if="modelValue.result.texture">
                <img :src="modelValue.result.texture" class="item-img">
                <span v-if="modelValue.result.count > 1" class="count">
                  {{ modelValue.result.count }}
                </span>
              </template>
              <img v-else :src="barrier" class="item-img">
            </div>

            <!-- Arrow slot -->
            <div v-else-if="slot.type === 'arrow'" class="slot slot-red">
              <img :src="arrow" alt="" class="item-img">
            </div>
          </template>
        </template>
      </div>
    </div>

    <button class="mt-3 mc-font text-xs text-[#FF5555] hover:text-[#FF7777]" @click="clearAll">
      Clear All
    </button>
  </div>
</template>

<style scoped>
.skyblock-menu {
  background: #d8d8d8;
  border: 2px solid #000;
  box-shadow:
    inset -3px -3px 0 0 #555555,
    inset 3px 3px 0 0 #ffffff;
}

.title-bar {
  padding: 4px 6px;
  color: #404040;
  font-size: 14px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(9, 36px);
  grid-template-rows: repeat(6, 36px);
  gap: 0;
  padding: 3px;
}

.slot {
  width: 36px;
  height: 36px;
  box-shadow:
    inset 2px 2px 0 0 #373737,
    inset -2px -2px 0 0 #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Gray pane slot */
.slot-gray {
  background: #8b8b8b;
}

/* Light gray pane slot */
.slot-light-gray {
  background: #8b8b8b;
}

/* Red pane slot */
.slot-red {
  background: #8b8b8b;
}

/* Empty slot (for craft/result) */
.slot-empty {
  background: #8b8b8b;
}

.pane-img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}

.craft-slot {
  cursor: pointer;
}

.craft-slot:hover {
  background: #a0a0a0;
}

.result-slot {
  cursor: pointer;
}

.result-slot:hover {
  background: #a0a0a0;
}

.item-img {
  width: 28px;
  height: 28px;
  image-rendering: pixelated;
}

.count {
  position: absolute;
  bottom: 1px;
  right: 3px;
  font-family: 'Monocraft', monospace;
  font-size: 12px;
  color: white;
  text-shadow: 1px 1px 0 #3f3f3f;
  pointer-events: none;
}

</style>
