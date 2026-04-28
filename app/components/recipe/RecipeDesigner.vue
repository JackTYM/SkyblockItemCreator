<script setup lang="ts">
import type { CraftingSlot, TextureItem } from '~/types'
import VanillaCraftingGrid from './VanillaCraftingGrid.vue'
import SkyblockCraftingGrid from './SkyblockCraftingGrid.vue'
import TexturePicker from '../item/TexturePicker.vue'
import MinecraftButton from '../ui/MinecraftButton.vue'

// Recipe state
const recipeType = ref<'vanilla' | 'skyblock'>('skyblock')

const recipe = ref({
  grid: Array(3).fill(null).map(() =>
    Array(3).fill(null).map(() => ({ texture: null, name: null, count: 1 } as CraftingSlot))
  ),
  result: { texture: null, name: null, count: 1 } as CraftingSlot,
})

// Slot editing state
const showTexturePicker = ref(false)
const editingSlot = ref<{ type: 'grid' | 'result'; row?: number; col?: number } | null>(null)

const gridRef = ref<{ menuRef: HTMLElement }>()

function handleSlotClick(row: number, col: number) {
  editingSlot.value = { type: 'grid', row, col }
  showTexturePicker.value = true
}

function handleResultClick() {
  editingSlot.value = { type: 'result' }
  showTexturePicker.value = true
}

function handleTextureSelect(item: TextureItem, count: number = 1) {
  if (!editingSlot.value) return

  if (editingSlot.value.type === 'grid') {
    const { row, col } = editingSlot.value
    if (row !== undefined && col !== undefined && recipe.value.grid[row]) {
      recipe.value.grid[row][col] = {
        texture: item.texture,
        name: item.name,
        count: Math.min(64, Math.max(1, count)),
        leatherColor: item.leatherColor,
      }
    }
  } else {
    recipe.value.result = {
      texture: item.texture,
      name: item.name,
      count: Math.min(64, Math.max(1, count)),
      leatherColor: item.leatherColor,
    }
  }

  editingSlot.value = null
}

// Export functions
const { exportAsPng, exportRecipeAsJson, copyToClipboard } = useExport()

async function handleExportPng() {
  if (gridRef.value?.menuRef) {
    // Use light grey background for Skyblock menu, transparent for vanilla
    const bgColor = recipeType.value === 'skyblock' ? '#c6c6c6' : '#c6c6c6'
    await exportAsPng(gridRef.value.menuRef, `${recipeType.value}-recipe-${Date.now()}`, bgColor)
  }
}

function handleExportJson() {
  exportRecipeAsJson({
    type: recipeType.value,
    grid: recipe.value.grid,
    result: recipe.value.result,
  }, `recipe-${Date.now()}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Mode selector -->
    <div class="flex items-center justify-center gap-2">
      <button
        class="mc-btn px-6 py-2 font-minecraft text-sm"
        :class="recipeType === 'vanilla' ? 'bg-[#3d7a37]' : ''"
        @click="recipeType = 'vanilla'"
      >
        Vanilla
      </button>
      <button
        class="mc-btn px-6 py-2 font-minecraft text-sm"
        :class="recipeType === 'skyblock' ? 'bg-[#3d7a37]' : ''"
        @click="recipeType = 'skyblock'"
      >
        Skyblock
      </button>
    </div>

    <!-- Recipe grid -->
    <div class="flex justify-center">
      <VanillaCraftingGrid
        v-if="recipeType === 'vanilla'"
        ref="gridRef"
        v-model="recipe"
        @slot-click="handleSlotClick"
        @result-click="handleResultClick"
      />
      <SkyblockCraftingGrid
        v-else
        ref="gridRef"
        v-model="recipe"
        @slot-click="handleSlotClick"
        @result-click="handleResultClick"
      />
    </div>

    <!-- Instructions -->
    <div class="text-center">
      <p class="font-minecraft text-xs text-[#AAAAAA]">
        Click any slot to add an item
      </p>
    </div>

    <!-- Export buttons -->
    <div class="flex flex-wrap justify-center gap-2">
      <MinecraftButton
        variant="primary"
        size="sm"
        @click="handleExportPng"
      >
        <span class="icon icon-emoji">📥</span> Export PNG
      </MinecraftButton>
      <MinecraftButton
        size="sm"
        @click="handleExportJson"
      >
        <span class="icon icon-emoji">📋</span> Export JSON
      </MinecraftButton>
    </div>

    <!-- Texture picker modal -->
    <TexturePicker
      :show="showTexturePicker"
      @close="showTexturePicker = false; editingSlot = null"
      @select="handleTextureSelect"
    />
  </div>
</template>
