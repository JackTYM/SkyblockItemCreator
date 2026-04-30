<script setup lang="ts">
interface CollectionTier {
  requirement: number
  rewards: string[]
  unlocked: boolean
}

interface Props {
  name: string
  texture: string
  tiers: CollectionTier[]
  currentAmount: number
}

const props = defineProps<Props>()

const menuRef = ref<HTMLElement>()
defineExpose({ menuRef })

// Textures
const blackGlass = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/black_stained_glass.png'
const greenGlass = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/green_stained_glass.png'
const redGlass = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/red_stained_glass.png'
const barrier = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/barrier.png'
const arrow = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/arrow.png'

// Calculate grid dimensions
const rowCount = computed(() => {
  const tierRows = Math.ceil(props.tiers.length / 7)
  return Math.max(6, 4 + tierRows)
})

// Grid layout
type SlotType = 'cyan' | 'texture' | 'tier' | 'barrier' | 'arrow'

interface GridSlot {
  type: SlotType
  tierIndex?: number
}

const gridLayout = computed<GridSlot[][]>(() => {
  const grid: GridSlot[][] = []
  const rows = rowCount.value
  const lastRow = rows

  for (let y = 1; y <= rows; y++) {
    const row: GridSlot[] = []
    for (let x = 1; x <= 9; x++) {
      // Collection texture at (5,1) - where map was in milestone
      if (x === 5 && y === 1) {
        row.push({ type: 'texture' })
      }
      // Arrow at (4, lastRow) - to the left of barrier
      else if (x === 4 && y === lastRow) {
        row.push({ type: 'arrow' })
      }
      // Barrier at (5, lastRow)
      else if (x === 5 && y === lastRow) {
        row.push({ type: 'barrier' })
      }
      // Tier slots starting at row 3
      else if (y >= 3 && y < lastRow) {
        const tierRow = y - 3
        const tierCol = x - 2 // tiers at columns 2-8 (indices 0-6)
        if (tierCol >= 0 && tierCol < 7) {
          const tierIndex = tierRow * 7 + tierCol
          if (tierIndex < props.tiers.length) {
            row.push({ type: 'tier', tierIndex })
          } else {
            row.push({ type: 'cyan' })
          }
        } else {
          row.push({ type: 'cyan' })
        }
      }
      // Everything else is black glass pane
      else {
        row.push({ type: 'cyan' })
      }
    }
    grid.push(row)
  }

  return grid
})

function getTierTexture(tier: CollectionTier): string {
  return tier.unlocked ? greenGlass : redGlass
}

function getTierClass(tier: CollectionTier): string {
  return tier.unlocked ? 'tier-unlocked' : 'tier-locked'
}
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="collection-menu" ref="menuRef">
      <div class="title-bar mc-font">{{ name }} Collection</div>

      <div
        class="menu-grid"
        :style="{ gridTemplateRows: `repeat(${rowCount}, 36px)` }"
      >
        <template v-for="(row, rowIdx) in gridLayout" :key="`row-${rowIdx}`">
          <template v-for="(slot, colIdx) in row" :key="`slot-${rowIdx}-${colIdx}`">
            <!-- Black glass filler -->
            <div v-if="slot.type === 'cyan'" class="slot slot-black">
              <img :src="blackGlass" alt="" class="pane-img">
            </div>

            <!-- Collection texture slot (where map was) -->
            <div v-else-if="slot.type === 'texture'" class="slot slot-black">
              <img :src="blackGlass" alt="" class="pane-img">
              <img
                v-if="texture"
                :src="texture"
                alt=""
                class="item-img item-overlay"
              >
            </div>

            <!-- Tier slot -->
            <div
              v-else-if="slot.type === 'tier'"
              class="slot tier-slot"
              :class="getTierClass(tiers[slot.tierIndex!])"
            >
              <img :src="getTierTexture(tiers[slot.tierIndex!])" alt="" class="pane-img tier-bg">
              <span v-if="slot.tierIndex! > 0" class="tier-number mc-font">{{ slot.tierIndex! + 1 }}</span>
            </div>

            <!-- Arrow slot (to the left of barrier) -->
            <div v-else-if="slot.type === 'arrow'" class="slot slot-black">
              <img :src="blackGlass" alt="" class="pane-img">
              <img :src="arrow" alt="" class="item-img item-overlay">
            </div>

            <!-- Barrier slot -->
            <div v-else-if="slot.type === 'barrier'" class="slot slot-black">
              <img :src="blackGlass" alt="" class="pane-img">
              <img :src="barrier" alt="" class="item-img item-overlay">
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collection-menu {
  background: #c6c6c6;
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

.slot-black {
  background: #8b8b8b;
}

.pane-img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}

.item-img {
  width: 28px;
  height: 28px;
  image-rendering: pixelated;
}

.item-overlay {
  position: absolute;
}

.tier-slot {
  cursor: pointer;
}

.tier-bg {
  position: absolute;
}

.tier-number {
  position: absolute;
  bottom: 2px;
  right: 4px;
  font-size: 12px;
  color: #FFFFFF;
  text-shadow: 1px 1px 0 #3f3f3f;
  z-index: 1;
}
</style>
