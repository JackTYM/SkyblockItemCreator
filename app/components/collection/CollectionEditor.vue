<script setup lang="ts">
import type { TextureItem } from '~/types'
import { MINECRAFT_COLORS } from '~/types'
import TexturePicker from '../item/TexturePicker.vue'
import CollectionGrid from './CollectionGrid.vue'
import CollectionTooltip from './CollectionTooltip.vue'
import MinecraftButton from '../ui/MinecraftButton.vue'

const { exportAsPng, copyToClipboard } = useExport()

interface CollectionTier {
  requirement: number
  rewards: string[]
  unlocked: boolean
}

interface Collection {
  name: string
  texture: string
  currentAmount: number
  tiers: CollectionTier[]
}

const combinedPreviewRef = ref<HTMLElement>()
const tooltipsContainerRef = ref<HTMLElement>()
const rewardTextareaRefs = ref<(HTMLTextAreaElement | null)[]>([])

const collection = ref<Collection>({
  name: 'Wheat',
  texture: '',
  currentAmount: 5000,
  tiers: [
    { requirement: 50, rewards: ['§aWheat Minion Recipes'], unlocked: true },
    { requirement: 100, rewards: ['§aFarm Suit Helmet Recipe', '§6+4 SkyBlock XP'], unlocked: true },
    { requirement: 250, rewards: ['§aFarm Suit Chestplate Recipe', '§6+4 SkyBlock XP'], unlocked: true },
    { requirement: 500, rewards: ['§aFarm Suit Leggings Recipe', '§6+4 SkyBlock XP'], unlocked: true },
    { requirement: 1000, rewards: ['§aFarm Suit Boots Recipe', '§6+4 SkyBlock XP'], unlocked: true },
    { requirement: 2500, rewards: ['§aFarm Crystal Recipe', '§6+4 SkyBlock XP'], unlocked: true },
    { requirement: 5000, rewards: ['§aHarvesting VI Book', '§6+4 SkyBlock XP'], unlocked: true },
    { requirement: 10000, rewards: ['§9Farmer Orb Recipe', '§6+4 SkyBlock XP'], unlocked: false },
    { requirement: 25000, rewards: ['§aHay Bale Minion Skin', '§6+4 SkyBlock XP'], unlocked: false },
  ],
})

const tooltipsPerRow = ref(3)
const tooltipScale = ref(1)
const showTexturePicker = ref(false)
const selectedTierIndex = ref(0)


const currentTier = computed(() => collection.value.tiers[selectedTierIndex.value])

const currentCollectionProgress = computed(() => {
  const amount = collection.value.currentAmount
  let tierNum = 0
  for (const tier of collection.value.tiers) {
    if (amount >= tier.requirement) {
      tierNum++
    } else {
      break
    }
  }
  return tierNum
})

function handleTextureSelect(item: TextureItem) {
  collection.value.texture = item.texture
}

function syncTooltipSizes() {
  nextTick(() => {
    if (!tooltipsContainerRef.value) return
    const tooltips = tooltipsContainerRef.value.querySelectorAll('.mc-tooltip')
    let maxWidth = 0
    let maxHeight = 0

    tooltipScale.value = 1

    tooltips.forEach((tooltip) => {
      const el = tooltip as HTMLElement
      el.style.minWidth = ''
      el.style.minHeight = ''
    })

    nextTick(() => {
      tooltips.forEach((tooltip) => {
        const el = tooltip as HTMLElement
        maxWidth = Math.max(maxWidth, el.offsetWidth)
        maxHeight = Math.max(maxHeight, el.offsetHeight)
      })

      tooltips.forEach((tooltip) => {
        const el = tooltip as HTMLElement
        el.style.minWidth = `${maxWidth}px`
        el.style.minHeight = `${maxHeight}px`
      })

      const perRow = tooltipsPerRow.value
      if (perRow > 3) {
        tooltipScale.value = Math.max(0.6, 3 / perRow)
      }
    })
  })
}

watch([collection, tooltipsPerRow], syncTooltipSizes, { deep: true })
onMounted(syncTooltipSizes)

function addTier() {
  const lastTier = collection.value.tiers[collection.value.tiers.length - 1]
  collection.value.tiers.push({
    requirement: lastTier ? lastTier.requirement * 2 : 100,
    rewards: ['§a+1,000 Reward'],
    unlocked: false,
  })
  selectedTierIndex.value = collection.value.tiers.length - 1
}

function removeTier(index: number) {
  if (collection.value.tiers.length > 1) {
    collection.value.tiers.splice(index, 1)
    if (selectedTierIndex.value >= collection.value.tiers.length) {
      selectedTierIndex.value = collection.value.tiers.length - 1
    }
  }
}

function addReward() {
  currentTier.value?.rewards.push('§a+1,000 Reward')
}

function removeReward(index: number) {
  currentTier.value?.rewards.splice(index, 1)
}

function insertIntoReward(index: number, text: string) {
  const textarea = rewardTextareaRefs.value[index]
  if (!textarea || !currentTier.value) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const current = currentTier.value.rewards[index]
  if (!current) return
  const before = current.slice(0, start)
  const after = current.slice(end)

  currentTier.value.rewards[index] = before + text + after

  nextTick(() => {
    textarea.setSelectionRange(start + text.length, start + text.length)
    textarea.focus()
  })
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toLocaleString()
}

async function handleExportPng() {
  if (combinedPreviewRef.value) {
    await exportAsPng(combinedPreviewRef.value, `collection-${collection.value.name}-${Date.now()}`)
  }
}

async function handleCopyJson() {
  const data = { ...collection.value }
  const success = await copyToClipboard(JSON.stringify(data, null, 2))
  if (success) {
    alert('JSON copied to clipboard!')
  }
}
</script>

<template>
  <div class="grid lg:grid-cols-2 gap-6">
    <!-- Editor Panel -->
    <div class="mc-panel-dark p-4 max-h-[80vh] overflow-y-auto">
      <h2 class="font-minecraft text-[#FFAA00] mb-4 mc-text-shadow flex items-center gap-2">
        <span>📚</span>
        <span>Collection Editor</span>
      </h2>

      <div class="space-y-4">
        <!-- Collection Name -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Collection Name</label>
          <input
            v-model="collection.name"
            type="text"
            class="mc-input"
            placeholder="Enter collection name..."
          >
        </div>

        <!-- Current Amount -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Current Amount</label>
          <input
            v-model.number="collection.currentAmount"
            type="number"
            min="0"
            class="mc-input"
            placeholder="0"
          >
          <p class="text-[10px] text-[#666] mt-1">
            Current tier: {{ currentCollectionProgress }} / {{ collection.tiers.length }}
          </p>
        </div>

        <!-- Tooltips per row -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Tooltips Per Row</label>
          <input
            v-model.number="tooltipsPerRow"
            type="number"
            min="1"
            max="5"
            class="mc-input w-24"
          >
        </div>

        <!-- Collection Texture -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Collection Icon</label>
          <button
            class="mc-slot mc-slot-hover w-full h-14 flex items-center justify-center gap-3"
            @click="showTexturePicker = true"
          >
            <div class="w-10 h-10 flex items-center justify-center">
              <img
                v-if="collection.texture"
                :src="collection.texture"
                alt="Texture"
                class="w-8 h-8 object-contain"
              >
              <span v-else class="text-xl text-[#555555]">+</span>
            </div>
            <span class="font-minecraft text-xs text-[#555555]">
              {{ collection.texture ? 'Change' : 'Select' }}
            </span>
          </button>
        </div>

        <!-- Tiers -->
        <div class="border-t border-[#373737] pt-4">
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-2 block">Collection Tiers</label>
          <div class="flex flex-wrap gap-1 mb-3">
            <button
              v-for="(tier, idx) in collection.tiers"
              :key="idx"
              class="w-8 h-8 text-xs font-minecraft rounded flex items-center justify-center"
              :class="{
                'bg-[#55AA55] text-white': tier.unlocked,
                'bg-[#663333] text-[#999]': !tier.unlocked,
                'ring-2 ring-white': selectedTierIndex === idx,
              }"
              @click="selectedTierIndex = idx"
            >
              {{ idx + 1 }}
            </button>
            <button
              class="w-8 h-8 text-xs font-minecraft rounded bg-[#2d2d2d] text-[#55FF55] hover:bg-[#3d3d3d]"
              @click="addTier"
            >
              +
            </button>
          </div>

          <!-- Current tier editor -->
          <div class="p-3 bg-[#1a1a1a] border border-[#333] rounded space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-minecraft text-xs text-[#FFAA00]">Tier {{ selectedTierIndex + 1 }}</span>
              <button
                v-if="collection.tiers.length > 1"
                class="text-xs text-[#FF5555] hover:text-[#FF7777]"
                @click="removeTier(selectedTierIndex)"
              >
                Delete
              </button>
            </div>

            <!-- Requirement -->
            <div>
              <label class="font-minecraft text-[10px] text-[#888] block mb-1">Required Amount</label>
              <input
                v-model.number="currentTier.requirement"
                type="number"
                min="1"
                class="mc-input text-sm w-full"
              >
            </div>

            <!-- Unlocked -->
            <div class="flex items-center gap-2">
              <input
                id="unlocked"
                v-model="currentTier.unlocked"
                type="checkbox"
                class="w-4 h-4 accent-[#55FF55]"
              >
              <label for="unlocked" class="font-minecraft text-xs text-[#55FF55] cursor-pointer">
                Unlocked
              </label>
            </div>

            <!-- Rewards -->
            <div>
              <label class="font-minecraft text-[10px] text-[#888] block mb-1">Rewards</label>
              <div class="space-y-2">
                <div
                  v-for="(reward, rIdx) in currentTier.rewards"
                  :key="rIdx"
                  class="space-y-1"
                >
                  <!-- Color toolbar -->
                  <div class="flex flex-wrap gap-0.5 p-1 bg-[#2d2d2d] rounded-t text-[8px]">
                    <button
                      v-for="code in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']"
                      :key="code"
                      class="w-4 h-4 font-minecraft hover:scale-110"
                      :style="{ color: MINECRAFT_COLORS[code] }"
                      @click="insertIntoReward(rIdx, `§${code}`)"
                    >
                      §
                    </button>
                  </div>
                  <div class="flex items-center gap-1">
                    <input
                      :ref="el => rewardTextareaRefs[rIdx] = el as HTMLTextAreaElement"
                      v-model="currentTier.rewards[rIdx]"
                      type="text"
                      class="mc-input text-xs py-1 flex-1 rounded-t-none"
                      placeholder="Reward"
                    >
                    <button
                      class="text-[#FF5555] hover:text-[#FF7777]"
                      @click="removeReward(rIdx)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
              <button
                class="mt-2 text-xs text-[#55FF55] hover:text-[#77FF77]"
                @click="addReward"
              >
                + Add Reward
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Panel -->
    <div class="mc-panel-dark p-4">
      <h2 class="font-minecraft text-[#FFAA00] mb-4 mc-text-shadow flex items-center gap-2">
        <span>👁</span>
        <span>Preview</span>
      </h2>

      <!-- Combined Preview -->
      <div class="bg-black/30 border border-[#373737] p-4 flex justify-center">
        <div ref="combinedPreviewRef" class="flex flex-col gap-4 p-2 bg-[#2b2b2b] items-center">
          <!-- Grid -->
          <CollectionGrid
            :name="collection.name"
            :texture="collection.texture"
            :tiers="collection.tiers"
            :current-amount="collection.currentAmount"
          />

          <!-- Tooltips -->
          <div
            class="tooltip-scale-wrapper"
            :style="{ transform: `scale(${tooltipScale})`, transformOrigin: 'top center' }"
          >
            <div
              ref="tooltipsContainerRef"
              class="grid"
              :style="{ gridTemplateColumns: `repeat(${tooltipsPerRow}, 1fr)` }"
            >
              <CollectionTooltip
                v-for="(tier, tIdx) in collection.tiers"
                :key="tIdx"
                :tier-number="tIdx + 1"
                :requirement="tier.requirement"
                :rewards="tier.rewards"
                :unlocked="tier.unlocked"
                :collection-name="collection.name"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center mt-4 gap-2">
        <MinecraftButton size="sm" @click="handleExportPng">
          <span class="icon icon-emoji">📥</span> Export PNG
        </MinecraftButton>
        <MinecraftButton size="sm" @click="handleCopyJson">
          <span class="icon icon-emoji">📋</span> Copy JSON
        </MinecraftButton>
      </div>
    </div>

    <!-- Texture Picker Modal -->
    <TexturePicker
      :show="showTexturePicker"
      :current-texture="collection.texture"
      @close="showTexturePicker = false"
      @select="handleTextureSelect"
    />
  </div>
</template>

<style scoped>
.mc-text-shadow {
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}
</style>
