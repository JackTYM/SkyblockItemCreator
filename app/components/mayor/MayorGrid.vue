<script setup lang="ts">
import MinecraftText from '../item/MinecraftText.vue'

interface Perk {
  name: string
  description: string
}

interface Props {
  mayorName: string
  mayorTexture: string | null
  isMinister: boolean
  color: string
  perks: Perk[]
}

const props = withDefaults(defineProps<Props>(), {
  color: 'e',
  perks: () => [],
})

const emit = defineEmits<{
  headClick: []
}>()

const menuRef = ref<HTMLElement>()
defineExpose({ menuRef })

// Minecraft textures
const grayPane = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block/black_stained_glass.png'
const jukebox = 'https://hypixelskyblock.minecraft.wiki/images/thumb/Jukebox.png/64px-Jukebox.png'
const barrier = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/barrier.png'

// Grid layout: 9 columns x 4 rows
// Mayor head: (3,2), Jukebox: (8,2), Barrier: (5,4)
type SlotType = 'gray' | 'head' | 'jukebox' | 'barrier'

interface GridSlot {
  type: SlotType
}

const gridLayout = computed<GridSlot[][]>(() => {
  const grid: GridSlot[][] = []

  for (let y = 1; y <= 4; y++) {
    const row: GridSlot[] = []
    for (let x = 1; x <= 9; x++) {
      if (x === 3 && y === 2) {
        row.push({ type: 'head' })
      } else if (x === 8 && y === 2) {
        row.push({ type: 'jukebox' })
      } else if (x === 5 && y === 4) {
        row.push({ type: 'barrier' })
      } else {
        row.push({ type: 'gray' })
      }
    }
    grid.push(row)
  }

  return grid
})

const titleText = computed(() => {
  const prefix = props.isMinister ? 'Minister' : 'Mayor'
  return `${prefix} ${props.mayorName || 'Name'}`
})

// Tooltip computed
const tooltipTitle = computed(() => {
  const prefix = props.isMinister ? 'Minister' : 'Mayor'
  return `§${props.color}§l${prefix} ${props.mayorName || 'Name'}`
})

const dashedLine = computed(() => {
  return '§8§m' + '─'.repeat(28)
})
</script>

<template>
  <div class="flex items-start gap-2" ref="menuRef">
    <!-- Menu grid -->
    <div class="mayor-menu">
      <div class="title-bar mc-font">{{ titleText }}</div>

      <div class="menu-grid">
        <template v-for="(row, rowIdx) in gridLayout" :key="`row-${rowIdx}`">
          <template v-for="(slot, colIdx) in row" :key="`slot-${rowIdx}-${colIdx}`">
            <!-- Gray filler -->
            <div v-if="slot.type === 'gray'" class="slot slot-gray">
              <img :src="grayPane" alt="" class="pane-img">
            </div>

            <!-- Mayor head slot -->
            <div
              v-else-if="slot.type === 'head'"
              class="slot slot-empty head-slot group"
              @click="emit('headClick')"
            >
              <img
                v-if="mayorTexture"
                :src="mayorTexture"
                class="item-img"
              >
              <span v-else class="text-[#555] text-lg">?</span>
            </div>

            <!-- Jukebox slot -->
            <div v-else-if="slot.type === 'jukebox'" class="slot slot-gray">
              <img :src="jukebox" alt="" class="item-img">
            </div>

            <!-- Barrier slot -->
            <div v-else-if="slot.type === 'barrier'" class="slot slot-gray">
              <img :src="barrier" alt="" class="item-img">
            </div>
          </template>
        </template>
      </div>
    </div>

    <!-- Tooltip (always visible, next to grid) -->
    <div class="mc-tooltip p-3 min-w-[280px]">
      <MinecraftText
        :text="tooltipTitle"
        class="text-sm block"
      />
      <MinecraftText
        text="§7Perks List"
        class="text-xs block"
      />
      <MinecraftText
        :text="dashedLine"
        class="text-xs block mt-1"
      />
      <div class="h-1.5" />

      <template v-if="perks && perks.length > 0">
        <template v-for="(perk, pIndex) in perks" :key="'perk-' + pIndex">
          <MinecraftText
            :text="`§${color}${perk.name}`"
            class="text-xs block"
          />
          <MinecraftText
            v-for="(line, lIndex) in perk.description.split('\n')"
            :key="'perk-' + pIndex + '-line-' + lIndex"
            :text="line.startsWith('§') ? line : `§7${line}`"
            class="text-xs block"
          />
          <div class="h-1.5" />
        </template>
      </template>

      <MinecraftText
        text="§7The listed perks are available to"
        class="text-xs block"
      />
      <MinecraftText
        text="§7all players until the closing of"
        class="text-xs block"
      />
      <MinecraftText
        text="§7the next elections."
        class="text-xs block"
      />
    </div>
  </div>
</template>

<style scoped>
.mayor-menu {
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
  grid-template-rows: repeat(4, 36px);
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

.slot-gray {
  background: #8b8b8b;
}

.slot-empty {
  background: #8b8b8b;
}

.pane-img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
  opacity: 0.7;
}

.head-slot {
  cursor: pointer;
}

.head-slot:hover {
  background: #a0a0a0;
}

.item-img {
  width: 28px;
  height: 28px;
  image-rendering: pixelated;
}

.mc-tooltip {
  background: #100010;
  border: 2px solid #28007d;
  box-shadow:
    inset 0 0 0 1px #28007d,
    0 0 0 1px #100010,
    4px 4px 0 rgba(0, 0, 0, 0.3);
}
</style>
