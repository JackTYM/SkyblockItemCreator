<script setup lang="ts">
import type { TextureItem } from '~/types'
import { MINECRAFT_COLORS, MINECRAFT_COLOR_NAMES } from '~/types'
import TexturePicker from '../item/TexturePicker.vue'
import MilestoneGrid from './MilestoneGrid.vue'
import MilestoneTooltip from './MilestoneTooltip.vue'
import MinecraftButton from '../ui/MinecraftButton.vue'

const { exportAsPng, copyToClipboard } = useExport()

interface Target {
  name: string
  progress: number
  requirement: number
}

interface Milestone {
  status: 'completed' | 'in-progress' | 'locked'
  targets: Target[]
  rewards: string[]
  claimed: boolean
}

// Refs
const combinedPreviewRef = ref<HTMLElement>()
const tooltipsContainerRef = ref<HTMLElement>()
const rewardTextareaRefs = ref<(HTMLTextAreaElement | null)[]>([])

// Editor state
const milestoneTitle = ref('Frozen Corpse')
const milestoneTexture = ref<string>('')
const tooltipsPerRow = ref(3)
const milestones = ref<Milestone[]>([
  {
    status: 'completed',
    targets: [{ name: 'Lapis', progress: 323, requirement: 10 }],
    rewards: ['§fOrgan Donor Talisman', '§a+10,000 Glacite Powder', '§b+1,000 Frozen Corpse RNG Meter XP', '§6+5 SkyBlock XP'],
    claimed: true,
  },
  {
    status: 'completed',
    targets: [{ name: 'Lapis', progress: 50, requirement: 25 }],
    rewards: ['§a+15,000 Glacite Powder', '§6+10 SkyBlock XP'],
    claimed: true,
  },
  {
    status: 'in-progress',
    targets: [{ name: 'Lapis', progress: 45, requirement: 50 }],
    rewards: ['§a+20,000 Glacite Powder', '§6+15 SkyBlock XP'],
    claimed: false,
  },
  {
    status: 'locked',
    targets: [{ name: 'Lapis', progress: 0, requirement: 100 }],
    rewards: ['§a+30,000 Glacite Powder', '§6+20 SkyBlock XP'],
    claimed: false,
  },
])

// Tooltip size synchronization and scaling
const tooltipScale = ref(1)

function syncTooltipSizes() {
  nextTick(() => {
    if (!tooltipsContainerRef.value) return
    const tooltips = tooltipsContainerRef.value.querySelectorAll('.mc-tooltip')
    let maxWidth = 0
    let maxHeight = 0

    // Reset scale first
    tooltipScale.value = 1

    // First pass: reset and measure all tooltips
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

      // Second pass: apply max dimensions to all
      tooltips.forEach((tooltip) => {
        const el = tooltip as HTMLElement
        el.style.minWidth = `${maxWidth}px`
        el.style.minHeight = `${maxHeight}px`
      })

      // Calculate scale based on tooltips per row (scale down if more than 3)
      const perRow = tooltipsPerRow.value
      if (perRow > 3) {
        tooltipScale.value = Math.max(0.6, 3 / perRow)
      }
    })
  })
}

watch([milestones, tooltipsPerRow], syncTooltipSizes, { deep: true })
onMounted(syncTooltipSizes)

// UI state
const showTexturePicker = ref(false)
const selectedMilestoneIndex = ref(0)

// Current milestone being edited
const currentMilestone = computed(() => milestones.value[selectedMilestoneIndex.value])

function handleTextureSelect(item: TextureItem) {
  milestoneTexture.value = item.texture
}

// Milestone functions
function addMilestone() {
  milestones.value.push({
    status: 'locked',
    targets: [{ name: 'Target', progress: 0, requirement: 100 }],
    rewards: ['§a+1,000 Reward'],
    claimed: false,
  })
  selectedMilestoneIndex.value = milestones.value.length - 1
}

function removeMilestone(index: number) {
  if (milestones.value.length > 1) {
    milestones.value.splice(index, 1)
    if (selectedMilestoneIndex.value >= milestones.value.length) {
      selectedMilestoneIndex.value = milestones.value.length - 1
    }
  }
}

// Target functions
function addTarget() {
  currentMilestone.value?.targets.push({ name: 'Target', progress: 0, requirement: 100 })
}

function removeTarget(index: number) {
  if (currentMilestone.value && currentMilestone.value.targets.length > 1) {
    currentMilestone.value.targets.splice(index, 1)
  }
}

// Reward functions
function addReward() {
  currentMilestone.value?.rewards.push('§a+1,000 Reward')
}

function removeReward(index: number) {
  currentMilestone.value?.rewards.splice(index, 1)
}

function insertIntoReward(index: number, text: string) {
  const textarea = rewardTextareaRefs.value[index]
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const current = currentMilestone.value.rewards[index]
  const before = current.slice(0, start)
  const after = current.slice(end)

  currentMilestone.value.rewards[index] = before + text + after

  nextTick(() => {
    textarea.setSelectionRange(start + text.length, start + text.length)
    textarea.focus()
  })
}

// Export functions
async function handleExportPng() {
  if (combinedPreviewRef.value) {
    await exportAsPng(combinedPreviewRef.value, `milestone-${Date.now()}`)
  }
}

async function handleCopyJson() {
  const data = {
    title: milestoneTitle.value,
    texture: milestoneTexture.value,
    milestones: milestones.value,
  }
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
        <span>🏆</span>
        <span>Milestone Editor</span>
      </h2>

      <div class="space-y-4">
        <!-- Milestone Title -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Milestone Title</label>
          <input
            v-model="milestoneTitle"
            type="text"
            class="mc-input"
            placeholder="Enter milestone title..."
          >
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

        <!-- Milestone Texture -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Milestone Texture</label>
          <button
            class="mc-slot mc-slot-hover w-full h-14 flex items-center justify-center gap-3"
            @click="showTexturePicker = true"
          >
            <div class="w-10 h-10 flex items-center justify-center">
              <img
                v-if="milestoneTexture"
                :src="milestoneTexture"
                alt="Texture"
                class="w-8 h-8 object-contain"
              >
              <span v-else class="text-xl text-[#555555]">+</span>
            </div>
            <span class="font-minecraft text-xs text-[#555555]">
              {{ milestoneTexture ? 'Change' : 'Select' }}
            </span>
          </button>
        </div>

        <!-- Milestone selector -->
        <div class="border-t border-[#373737] pt-4">
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-2 block">Milestones</label>
          <div class="flex flex-wrap gap-1 mb-3">
            <button
              v-for="(m, idx) in milestones"
              :key="idx"
              class="w-8 h-8 text-xs font-minecraft rounded flex items-center justify-center"
              :class="{
                'bg-[#55AA55] text-white': m.status === 'completed',
                'bg-[#AAAA00] text-white': m.status === 'in-progress',
                'bg-[#663333] text-[#999]': m.status === 'locked',
                'ring-2 ring-white': selectedMilestoneIndex === idx,
              }"
              @click="selectedMilestoneIndex = idx"
            >
              {{ idx + 1 }}
            </button>
            <button
              class="w-8 h-8 text-xs font-minecraft rounded bg-[#2d2d2d] text-[#55FF55] hover:bg-[#3d3d3d]"
              @click="addMilestone"
            >
              +
            </button>
          </div>

          <!-- Current milestone editor -->
          <div class="p-3 bg-[#1a1a1a] border border-[#333] rounded space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-minecraft text-xs text-[#FFAA00]">Milestone {{ selectedMilestoneIndex + 1 }}</span>
              <button
                v-if="milestones.length > 1"
                class="text-xs text-[#FF5555] hover:text-[#FF7777]"
                @click="removeMilestone(selectedMilestoneIndex)"
              >
                Delete
              </button>
            </div>

            <!-- Status -->
            <div>
              <label class="font-minecraft text-[10px] text-[#888] block mb-1">Status</label>
              <select v-model="currentMilestone.status" class="mc-select text-xs w-full">
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="locked">Locked</option>
              </select>
            </div>

            <!-- Claimed -->
            <div class="flex items-center gap-2">
              <input
                id="claimed"
                v-model="currentMilestone.claimed"
                type="checkbox"
                class="w-4 h-4 accent-[#55FF55]"
              >
              <label for="claimed" class="font-minecraft text-xs text-[#55FF55] cursor-pointer">
                Claimed
              </label>
            </div>

            <!-- Targets -->
            <div>
              <label class="font-minecraft text-[10px] text-[#888] block mb-1">Targets</label>
              <div class="space-y-2">
                <div
                  v-for="(target, tIdx) in currentMilestone.targets"
                  :key="tIdx"
                  class="flex items-center gap-2 p-2 bg-black/30 rounded"
                >
                  <input
                    v-model="target.name"
                    type="text"
                    class="mc-input text-xs py-1 w-24"
                    placeholder="Name"
                  >
                  <input
                    v-model.number="target.progress"
                    type="number"
                    class="mc-input text-xs py-1 w-20"
                    placeholder="Progress"
                  >
                  <span class="text-[#555]">/</span>
                  <input
                    v-model.number="target.requirement"
                    type="number"
                    class="mc-input text-xs py-1 w-20"
                    placeholder="Required"
                  >
                  <button
                    v-if="currentMilestone.targets.length > 1"
                    class="text-[#FF5555] hover:text-[#FF7777]"
                    @click="removeTarget(tIdx)"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <button
                class="mt-2 text-xs text-[#55FF55] hover:text-[#77FF77]"
                @click="addTarget"
              >
                + Add Target
              </button>
            </div>

            <!-- Rewards -->
            <div>
              <label class="font-minecraft text-[10px] text-[#888] block mb-1">Rewards</label>
              <div class="space-y-2">
                <div
                  v-for="(reward, rIdx) in currentMilestone.rewards"
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
                      v-model="currentMilestone.rewards[rIdx]"
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
          <MilestoneGrid
            :title="milestoneTitle"
            :milestones="milestones"
            :milestone-texture="milestoneTexture"
          />

          <!-- Tooltips -->
          <div
            class="tooltip-scale-wrapper"
            :style="{ transform: `scale(${tooltipScale})`, transformOrigin: 'top center' }"
          >
            <div
              ref="tooltipsContainerRef"
              class="inline-grid"
              :style="{ gridTemplateColumns: `repeat(${tooltipsPerRow}, auto)` }"
            >
              <MilestoneTooltip
                v-for="(milestone, mIdx) in milestones"
                :key="mIdx"
                :milestone-number="mIdx + 1"
                :targets="milestone.targets"
                :rewards="milestone.rewards"
                :claimed="milestone.claimed"
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
      :current-texture="milestoneTexture"
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
