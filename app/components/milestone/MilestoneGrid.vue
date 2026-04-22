<script setup lang="ts">
interface Milestone {
  status: 'completed' | 'in-progress' | 'locked'
}

interface Props {
  title: string
  milestones: Milestone[]
  milestoneTexture: string | null
}

const props = defineProps<Props>()

const menuRef = ref<HTMLElement>()
defineExpose({ menuRef })

// Textures
const blackGlass = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/black_stained_glass.png'
const greenGlass = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/green_stained_glass.png'
const yellowGlass = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/yellow_stained_glass.png'
const redGlass = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/red_stained_glass.png'
const filledMap = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/filled_map.png'
const mapMarkings = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/filled_map_markings.png'
const barrier = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/barrier.png'

// Calculate grid dimensions
const rowCount = computed(() => {
  const milestoneRows = Math.ceil(props.milestones.length / 7)
  return Math.max(6, 4 + milestoneRows) // min 6 rows, or 4 + milestone rows
})

// Grid layout
type SlotType = 'cyan' | 'map' | 'milestone' | 'barrier' | 'texture'

interface GridSlot {
  type: SlotType
  milestoneIndex?: number
}

const gridLayout = computed<GridSlot[][]>(() => {
  const grid: GridSlot[][] = []
  const rows = rowCount.value
  const lastRow = rows

  for (let y = 1; y <= rows; y++) {
    const row: GridSlot[] = []
    for (let x = 1; x <= 9; x++) {
      // Map at (5,1)
      if (x === 5 && y === 1) {
        row.push({ type: 'map' })
      }
      // Barrier at (5, lastRow)
      else if (x === 5 && y === lastRow) {
        row.push({ type: 'barrier' })
      }
      // Milestone texture at (6, lastRow)
      else if (x === 6 && y === lastRow) {
        row.push({ type: 'texture' })
      }
      // Milestone slots starting at row 3
      else if (y >= 3 && y < lastRow) {
        const milestoneRow = y - 3
        const milestoneCol = x - 2 // milestones at columns 2-8 (indices 0-6)
        if (milestoneCol >= 0 && milestoneCol < 7) {
          const milestoneIndex = milestoneRow * 7 + milestoneCol
          if (milestoneIndex < props.milestones.length) {
            row.push({ type: 'milestone', milestoneIndex })
          } else {
            row.push({ type: 'cyan' })
          }
        } else {
          row.push({ type: 'cyan' })
        }
      }
      // Everything else is cyan pane
      else {
        row.push({ type: 'cyan' })
      }
    }
    grid.push(row)
  }

  return grid
})

function getMilestoneTexture(milestone: Milestone): string {
  switch (milestone.status) {
    case 'completed':
      return greenGlass
    case 'in-progress':
      return yellowGlass
    case 'locked':
      return redGlass
    default:
      return blackGlass
  }
}

function getMilestoneClass(milestone: Milestone): string {
  switch (milestone.status) {
    case 'completed':
      return 'milestone-completed'
    case 'in-progress':
      return 'milestone-progress'
    case 'locked':
      return 'milestone-locked'
    default:
      return ''
  }
}
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="milestone-menu" ref="menuRef">
      <div class="title-bar mc-font">{{ title }} Milestones</div>

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

            <!-- Map slot -->
            <div v-else-if="slot.type === 'map'" class="slot slot-black">
              <img :src="blackGlass" alt="" class="pane-img">
              <img :src="filledMap" alt="" class="item-img item-overlay">
              <img :src="mapMarkings" alt="" class="item-img item-overlay map-markings-black">
            </div>

            <!-- Milestone slot -->
            <div
              v-else-if="slot.type === 'milestone'"
              class="slot milestone-slot"
              :class="getMilestoneClass(milestones[slot.milestoneIndex!])"
            >
              <img :src="getMilestoneTexture(milestones[slot.milestoneIndex!])" alt="" class="pane-img milestone-bg">
              <span v-if="slot.milestoneIndex! > 0" class="milestone-number mc-font">{{ slot.milestoneIndex! + 1 }}</span>
            </div>

            <!-- Barrier slot -->
            <div v-else-if="slot.type === 'barrier'" class="slot slot-black">
              <img :src="blackGlass" alt="" class="pane-img">
              <img :src="barrier" alt="" class="item-img item-overlay">
            </div>

            <!-- Milestone texture slot -->
            <div v-else-if="slot.type === 'texture'" class="slot slot-black">
              <img :src="blackGlass" alt="" class="pane-img">
              <img
                v-if="milestoneTexture"
                :src="milestoneTexture"
                alt=""
                class="item-img item-overlay"
              >
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.milestone-menu {
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

.milestone-slot {
  cursor: pointer;
}

.milestone-bg {
  position: absolute;
}

.milestone-number {
  position: absolute;
  bottom: 2px;
  right: 4px;
  font-size: 12px;
  color: #FFFFFF;
  text-shadow: 1px 1px 0 #3f3f3f;
  z-index: 1;
}

.map-markings-black {
  filter: brightness(0);
}
</style>
