<script setup lang="ts">
import type { TextureItem, GemstoneSlot } from '~/types'
import RaritySelector from './RaritySelector.vue'
import SkyblockStatEditor from './SkyblockStatEditor.vue'
import MarkdownToolbar from './MarkdownToolbar.vue'
import SymbolPicker from './SymbolPicker.vue'
import TexturePicker from './TexturePicker.vue'
import ItemPreview from './ItemPreview.vue'
import MinecraftButton from '../ui/MinecraftButton.vue'

interface Props {
  isSkyblock: boolean
}

defineProps<Props>()

const { markdownToMinecraft } = useMinecraftFormat()
const { exportAsPng, copyToClipboard, generateGiveCommand } = useExport()

// Preview ref for export
const itemPreviewRef = ref<InstanceType<typeof ItemPreview>>()

// Editor state
const editorMode = ref<'markdown' | 'minecraft'>('markdown')
const itemName = ref('Custom Item')
const itemType = ref('sword')
const selectedRarity = ref('legendary')
const rawLore = ref('A powerful weapon\nforged in the depths')
const stats = ref<Record<string, number>>({})
const gemstoneSlots = ref<GemstoneSlot[]>([])
const selectedTexture = ref<string>('')

// UI state
const showSymbolPicker = ref(false)
const showTexturePicker = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()

// Item types for dropdown
const itemTypes = [
  { value: 'sword', label: 'Sword' },
  { value: 'bow', label: 'Bow' },
  { value: 'helmet', label: 'Helmet' },
  { value: 'chestplate', label: 'Chestplate' },
  { value: 'leggings', label: 'Leggings' },
  { value: 'boots', label: 'Boots' },
  { value: 'pickaxe', label: 'Pickaxe' },
  { value: 'axe', label: 'Axe' },
  { value: 'shovel', label: 'Shovel' },
  { value: 'hoe', label: 'Hoe' },
  { value: 'fishing rod', label: 'Fishing Rod' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'pet item', label: 'Pet Item' },
  { value: '', label: 'None' },
]

// Computed lore lines
const loreLines = computed(() => {
  const lines = rawLore.value.split('\n')

  if (editorMode.value === 'markdown') {
    return lines.map(line => markdownToMinecraft(line))
  }

  return lines
})

// Handle toolbar actions
function handleInsert(text: string) {
  if (!textareaRef.value) return

  const start = textareaRef.value.selectionStart
  const end = textareaRef.value.selectionEnd
  const before = rawLore.value.slice(0, start)
  const after = rawLore.value.slice(end)

  rawLore.value = before + text + after

  nextTick(() => {
    textareaRef.value?.setSelectionRange(start + text.length, start + text.length)
    textareaRef.value?.focus()
  })
}

function handleWrap(prefix: string, suffix: string) {
  if (!textareaRef.value) return

  const start = textareaRef.value.selectionStart
  const end = textareaRef.value.selectionEnd
  const selected = rawLore.value.slice(start, end)
  const before = rawLore.value.slice(0, start)
  const after = rawLore.value.slice(end)

  rawLore.value = before + prefix + selected + suffix + after

  nextTick(() => {
    textareaRef.value?.setSelectionRange(start + prefix.length, end + prefix.length)
    textareaRef.value?.focus()
  })
}

function handleSymbolSelect(symbol: string) {
  handleInsert(symbol)
}

function handleTextureSelect(item: TextureItem) {
  selectedTexture.value = item.texture
}

// Export functions
async function handleExportPng() {
  if (itemPreviewRef.value?.previewRef) {
    await exportAsPng(itemPreviewRef.value.previewRef, `skyblock-item-${Date.now()}`)
  }
}

async function handleCopyJson() {
  const item = {
    name: itemName.value,
    type: itemType.value,
    rarity: selectedRarity.value,
    lore: loreLines.value,
    stats: stats.value,
    texture: selectedTexture.value,
  }
  const success = await copyToClipboard(JSON.stringify(item, null, 2))
  if (success) {
    alert('JSON copied to clipboard!')
  }
}

async function handleGiveCommand() {
  const item = {
    name: itemName.value,
    type: itemType.value,
    rarity: selectedRarity.value,
    lore: loreLines.value,
    stats: stats.value,
    texture: selectedTexture.value,
  }
  const command = generateGiveCommand(item)
  const success = await copyToClipboard(command)
  if (success) {
    alert('Command copied to clipboard!')
  }
}

async function handleShare() {
  const item = {
    name: itemName.value,
    type: itemType.value,
    rarity: selectedRarity.value,
    lore: loreLines.value,
    stats: stats.value,
    texture: selectedTexture.value,
  }
  const data = encodeURIComponent(JSON.stringify(item))
  const url = `${window.location.origin}${window.location.pathname}?item=${data}`
  const success = await copyToClipboard(url)
  if (success) {
    alert('Share URL copied to clipboard!')
  }
}
</script>

<template>
  <div class="grid lg:grid-cols-2 gap-6">
    <!-- Editor Panel -->
    <div class="mc-panel-dark p-4">
      <h2 class="font-minecraft text-[#FFAA00] mb-4 mc-text-shadow flex items-center gap-2">
        <span>✎</span>
        <span>Item Editor</span>
      </h2>

      <div class="space-y-4">
        <!-- Item Name -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Item Name</label>
          <input
            v-model="itemName"
            type="text"
            class="mc-input"
            placeholder="Enter item name..."
          >
        </div>

        <!-- Texture selector -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Item Texture</label>
          <button
            class="mc-slot mc-slot-hover w-full h-16 flex items-center justify-center gap-3"
            @click="showTexturePicker = true"
          >
            <div class="w-12 h-12 flex items-center justify-center">
              <img
                v-if="selectedTexture"
                :src="selectedTexture"
                alt="Selected texture"
                class="w-10 h-10 object-contain"
              >
              <span
                v-else
                class="text-2xl text-[#555555]"
              >+</span>
            </div>
            <span class="font-minecraft text-xs text-[#555555]">
              {{ selectedTexture ? 'Change texture' : 'Select texture' }}
            </span>
          </button>
        </div>

        <!-- Skyblock-specific options -->
        <template v-if="isSkyblock">
          <div class="grid grid-cols-2 gap-4">
            <!-- Rarity -->
            <RaritySelector v-model="selectedRarity" />

            <!-- Item Type -->
            <div>
              <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Item Type</label>
              <select
                v-model="itemType"
                class="mc-select w-full"
              >
                <option
                  v-for="type in itemTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Stats Editor -->
          <div class="border-t border-[#373737] pt-4">
            <SkyblockStatEditor v-model="stats" v-model:gemstone-slots="gemstoneSlots" />
          </div>
        </template>

        <!-- Lore Editor -->
        <div class="border-t border-[#373737] pt-4">
          <div class="flex items-center justify-between mb-2">
            <label class="font-minecraft text-xs text-[#AAAAAA]">Item Lore</label>

            <!-- Editor mode tabs -->
            <div class="flex">
              <button
                class="px-3 py-1 font-minecraft text-[10px] transition-colors"
                :class="editorMode === 'markdown' ? 'bg-[#3d3d3d] text-white' : 'bg-[#2d2d2d] text-[#AAAAAA]'"
                @click="editorMode = 'markdown'"
              >
                Markdown
              </button>
              <button
                class="px-3 py-1 font-minecraft text-[10px] transition-colors"
                :class="editorMode === 'minecraft' ? 'bg-[#3d3d3d] text-white' : 'bg-[#2d2d2d] text-[#AAAAAA]'"
                @click="editorMode = 'minecraft'"
              >
                § Codes
              </button>
            </div>
          </div>

          <!-- Toolbar (Markdown mode) -->
          <MarkdownToolbar
            v-if="editorMode === 'markdown'"
            @insert="handleInsert"
            @wrap="handleWrap"
            @symbol="showSymbolPicker = true"
          />

          <!-- Quick codes (Minecraft mode) -->
          <div
            v-else
            class="flex flex-wrap gap-1 p-2 bg-[#2d2d2d] border-b border-[#1a1a1a]"
          >
            <button
              v-for="code in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']"
              :key="code"
              class="w-5 h-5 text-[10px] font-minecraft hover:scale-110 transition-transform"
              :class="`mc-${code}`"
              :title="`§${code}`"
              @click="handleInsert(`§${code}`)"
            >
              §
            </button>
            <div class="w-px h-5 bg-[#555555] mx-1" />
            <button
              class="px-2 h-5 text-[10px] font-minecraft font-bold bg-[#3d3d3d] hover:bg-[#4d4d4d]"
              @click="handleInsert('§l')"
            >
              B
            </button>
            <button
              class="px-2 h-5 text-[10px] font-minecraft italic bg-[#3d3d3d] hover:bg-[#4d4d4d]"
              @click="handleInsert('§o')"
            >
              I
            </button>
            <button
              class="px-2 h-5 text-[10px] font-minecraft bg-[#3d3d3d] hover:bg-[#4d4d4d]"
              @click="handleInsert('§r')"
            >
              R
            </button>
            <div class="w-px h-5 bg-[#555555] mx-1" />
            <button
              class="px-2 h-5 text-[10px] font-minecraft bg-[#3d3d3d] hover:bg-[#4d4d4d] text-[#FF5555]"
              @click="showSymbolPicker = true"
            >
              ❤
            </button>
          </div>

          <!-- Textarea -->
          <textarea
            ref="textareaRef"
            v-model="rawLore"
            class="mc-input min-h-[120px] resize-y font-minecraft text-sm"
            :placeholder="editorMode === 'markdown' ? 'Use **bold**, *italic*, ~~strikethrough~~...' : 'Use §c for red, §l for bold...'"
          />

          <p class="font-minecraft text-[10px] text-[#555555] mt-1">
            {{ editorMode === 'markdown' ? 'Tip: Use {red}text{/red} for colors' : 'Tip: §7 is gray, §c is red, §6 is gold' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Preview Panel -->
    <div class="mc-panel-dark p-4">
      <h2 class="font-minecraft text-[#FFAA00] mb-4 mc-text-shadow flex items-center gap-2">
        <span>👁</span>
        <span>Preview</span>
      </h2>

      <div class="min-h-[300px] flex items-center justify-center bg-black/30 border border-[#373737] p-4">
        <ItemPreview
          ref="itemPreviewRef"
          :name="itemName"
          :rarity="selectedRarity"
          :item-type="itemType"
          :lore="loreLines"
          :stats="stats"
          :gemstone-slots="gemstoneSlots"
          :texture="selectedTexture"
          :is-skyblock="isSkyblock"
        />
      </div>

      <!-- Export buttons -->
      <div class="flex flex-wrap gap-2 mt-4">
        <MinecraftButton
          variant="primary"
          size="sm"
          @click="handleExportPng"
        >
          <span class="icon icon-emoji">📥</span> Export PNG
        </MinecraftButton>
        <MinecraftButton
          size="sm"
          @click="handleCopyJson"
        >
          <span class="icon icon-emoji">📋</span> Copy JSON
        </MinecraftButton>
        <MinecraftButton
          size="sm"
          @click="handleGiveCommand"
        >
          <span class="icon icon-emoji">⌨</span> /give Command
        </MinecraftButton>
        <MinecraftButton
          size="sm"
          @click="handleShare"
        >
          <span class="icon icon-emoji">🔗</span> Share
        </MinecraftButton>
      </div>
    </div>

    <!-- Modals -->
    <SymbolPicker
      :show="showSymbolPicker"
      @close="showSymbolPicker = false"
      @select="handleSymbolSelect"
    />

    <TexturePicker
      :show="showTexturePicker"
      :current-texture="selectedTexture"
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
