<script setup lang="ts">
import type { TextureItem, GemstoneSlot, ItemAbility, PetHeldItem, CustomStat } from '~/types'
import { RARITIES, MINECRAFT_COLORS, PET_TYPES } from '~/types'
import RaritySelector from './RaritySelector.vue'
import SkyblockStatEditor from './SkyblockStatEditor.vue'
import SymbolPicker from './SymbolPicker.vue'
import TexturePicker from './TexturePicker.vue'
import ItemPreview from './ItemPreview.vue'
import PetPreview from './PetPreview.vue'
import MinecraftButton from '../ui/MinecraftButton.vue'

interface Props {
  isSkyblock: boolean
}

const props = defineProps<Props>()

const { exportAsPng, copyToClipboard, generateGiveCommand } = useExport()

// Preview ref for export
const itemPreviewRef = ref<InstanceType<typeof ItemPreview>>()
const petPreviewRef = ref<InstanceType<typeof PetPreview>>()

// Editor state
const itemName = ref('Custom Item')
const itemType = ref('sword')
const customItemType = ref('')
const selectedRarity = ref('legendary')
const customRarityName = ref('')
const customRarityColor = ref('#FF5555')
const nameColor = ref('f') // Default white for vanilla items
const rawLore = ref('A powerful weapon\nforged in the depths')
const stats = ref<Record<string, number>>({})
const gemstoneSlots = ref<GemstoneSlot[]>([])
const abilities = ref<ItemAbility[]>([])
const customStats = ref<CustomStat[]>([])
const selectedTexture = ref<string>('')
const textureSource = ref<'vanilla' | 'heads' | 'custom'>('vanilla')
const leatherColor = ref<string | undefined>(undefined)
const isDungeonized = ref(false)
const enchantGlint = ref(false)

// Pet-specific state
const petLevel = ref(100)
const petType = ref('Combat')
const customPetType = ref('')
const petIsMaxLevel = ref(true)
const petIsMount = ref(false)
const petXp = ref(0)
const petHeldItem = ref<PetHeldItem>({ name: '', perk: '' })

// Computed: check if in pet mode
const isPetMode = computed(() => itemType.value === 'pet')

// Actual pet type (handles custom)
const actualPetType = computed(() => {
  return petType.value === 'custom' ? customPetType.value : petType.value
})


// Computed actual item type (handles custom)
const actualItemType = computed(() => {
  return itemType.value === 'custom' ? customItemType.value : itemType.value
})

// UI state
const showSymbolPicker = ref(false)
const showTexturePicker = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()
const nameInputRef = ref<HTMLInputElement>()

// Item types for dropdown
const itemTypes = [
  { value: 'accessory', label: 'Accessory' },
  { value: 'axe', label: 'Axe' },
  { value: 'belt', label: 'Belt' },
  { value: 'boots', label: 'Boots' },
  { value: 'bow', label: 'Bow' },
  { value: 'bracelet', label: 'Bracelet' },
  { value: 'chestplate', label: 'Chestplate' },
  { value: 'cloak', label: 'Cloak' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'cosmetic', label: 'Cosmetic' },
  { value: 'deployable', label: 'Deployable' },
  { value: 'drill', label: 'Drill' },
  { value: 'drill part', label: 'Drill Part' },
  { value: 'dungeon item', label: 'Dungeon Item' },
  { value: 'fishing rod', label: 'Fishing Rod' },
  { value: 'gloves', label: 'Gloves' },
  { value: 'helmet', label: 'Helmet' },
  { value: 'hoe', label: 'Hoe' },
  { value: 'leggings', label: 'Leggings' },
  { value: 'necklace', label: 'Necklace' },
  { value: 'pet', label: 'Pet' },
  { value: 'pet item', label: 'Pet Item' },
  { value: 'pickaxe', label: 'Pickaxe' },
  { value: 'reforge stone', label: 'Reforge Stone' },
  { value: 'rod part', label: 'Rod Part' },
  { value: 'shovel', label: 'Shovel' },
  { value: 'sword', label: 'Sword' },
  { value: 'wand', label: 'Wand' },
  { value: '', label: 'None' },
  { value: 'custom', label: 'Custom...' },
]

// Find closest Minecraft color code for a hex color
function findClosestColorCode(hexColor: string): string {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  let closestCode = 'c'
  let closestDistance = Infinity

  for (const [code, mcHex] of Object.entries(MINECRAFT_COLORS)) {
    const mcR = parseInt(mcHex.substring(1, 3), 16)
    const mcG = parseInt(mcHex.substring(3, 5), 16)
    const mcB = parseInt(mcHex.substring(5, 7), 16)

    const distance = Math.sqrt(
      Math.pow(r - mcR, 2) + Math.pow(g - mcG, 2) + Math.pow(b - mcB, 2)
    )

    if (distance < closestDistance) {
      closestDistance = distance
      closestCode = code
    }
  }

  return closestCode
}

// Computed lore lines
const loreLines = computed(() => {
  return rawLore.value.split('\n')
})

// Find all active formatting codes before a position in the text
// Returns §r + previous formatting to properly reset and restore
function getActiveFormatting(text: string): string {
  // Find all § codes in the text
  const matches = text.match(/§[0-9a-fklmnor]/gi) || []

  // If no formatting codes exist, just reset to clear the applied format
  if (matches.length === 0) {
    return '§r'
  }

  let lastColor: string | null = null
  let isBold = false
  let isItalic = false
  let isUnderline = false
  let isStrikethrough = false
  let isObfuscated = false

  for (const code of matches) {
    const char = code[1].toLowerCase()
    // Color codes (0-9, a-f) replace the current color
    if (/[0-9a-f]/.test(char)) {
      lastColor = `§${char}`
      // In Minecraft, color codes reset formatting
      isBold = false
      isItalic = false
      isUnderline = false
      isStrikethrough = false
      isObfuscated = false
    }
    // Format codes
    if (char === 'l') isBold = true
    if (char === 'o') isItalic = true
    if (char === 'n') isUnderline = true
    if (char === 'm') isStrikethrough = true
    if (char === 'k') isObfuscated = true
    // Reset clears everything
    if (char === 'r') {
      lastColor = null
      isBold = false
      isItalic = false
      isUnderline = false
      isStrikethrough = false
      isObfuscated = false
    }
  }

  // Build the restore string: §r first to reset, then color, then formatting
  let restore = '§r'
  if (lastColor) restore += lastColor
  if (isBold) restore += '§l'
  if (isItalic) restore += '§o'
  if (isUnderline) restore += '§n'
  if (isStrikethrough) restore += '§m'
  if (isObfuscated) restore += '§k'

  return restore
}

// Insert text at cursor while preserving undo history
function insertTextPreservingUndo(textarea: HTMLTextAreaElement, newText: string) {
  textarea.focus()
  // Use execCommand to preserve undo stack (still works in most browsers for textareas)
  if (!document.execCommand('insertText', false, newText)) {
    // Fallback: use setRangeText which also preserves undo in modern browsers
    const start = textarea.selectionStart
    textarea.setRangeText(newText, start, textarea.selectionEnd, 'end')
    // Manually trigger input event for Vue reactivity
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

// Handle toolbar actions
function handleInsert(text: string) {
  if (!textareaRef.value) return

  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = rawLore.value.slice(0, start)
  const selected = rawLore.value.slice(start, end)

  // Check if this is a color code (§0-§f) or format code (§l, §o, §n, §m, §k)
  const isColorCode = /^§[0-9a-f]$/i.test(text)
  const isFormatCode = /^§[lonmk]$/i.test(text)

  if ((isColorCode || isFormatCode) && selected.length > 0) {
    // Find what formatting was active before the selection
    const previousFormatting = getActiveFormatting(before)

    // Build the replacement: code + selected text + restore formatting
    const replacement = text + selected + previousFormatting

    // Insert using undo-preserving method
    insertTextPreservingUndo(textarea, replacement)

    nextTick(() => {
      // Keep the text selected (after the inserted code)
      textarea.setSelectionRange(start + text.length, start + text.length + selected.length)
    })
  } else {
    // Just insert the code at cursor position
    insertTextPreservingUndo(textarea, text)

    nextTick(() => {
      const newPos = start + text.length
      textarea.setSelectionRange(newPos, newPos)
    })
  }
}

function handleSymbolSelect(symbol: string) {
  handleInsert(symbol)
}

// Handle inserting color/format codes into item name
function handleNameInsert(code: string) {
  if (!nameInputRef.value) return

  const input = nameInputRef.value
  const start = input.selectionStart ?? 0
  const end = input.selectionEnd ?? 0

  // Insert code at cursor or wrap selected text
  const before = itemName.value.slice(0, start)
  const selected = itemName.value.slice(start, end)
  const after = itemName.value.slice(end)

  if (selected.length > 0) {
    // Wrap selected text with code and reset
    itemName.value = `${before}${code}${selected}§r${after}`
    nextTick(() => {
      input.setSelectionRange(start + code.length, start + code.length + selected.length)
      input.focus()
    })
  } else {
    // Just insert the code
    itemName.value = `${before}${code}${after}`
    nextTick(() => {
      const newPos = start + code.length
      input.setSelectionRange(newPos, newPos)
      input.focus()
    })
  }
}

function handleTextureSelect(item: TextureItem) {
  selectedTexture.value = item.texture
  textureSource.value = item.source as 'vanilla' | 'heads' | 'custom'
  leatherColor.value = item.leatherColor
}

// Export functions
async function handleExportPng() {
  if (isPetMode.value && petPreviewRef.value?.previewRef) {
    await exportAsPng(petPreviewRef.value.previewRef, `skyblock-pet-${Date.now()}`)
  } else if (itemPreviewRef.value?.previewRef) {
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
    abilities: abilities.value,
    texture: selectedTexture.value,
  }
  const success = await copyToClipboard(JSON.stringify(item, null, 2))
  if (success) {
    alert('JSON copied to clipboard!')
  }
}

async function handleGiveCommand() {
  // Get the rarity info for Skyblock items
  const rarityInfo = RARITIES.find(r => r.name === selectedRarity.value)
  const rarityColorCode = selectedRarity.value === 'custom'
    ? findClosestColorCode(customRarityColor.value)
    : (rarityInfo?.code ?? '6')
  const rarityDisplayName = selectedRarity.value === 'custom'
    ? (customRarityName.value || 'CUSTOM')
    : (rarityInfo?.displayName ?? 'LEGENDARY')

  const item = {
    name: itemName.value,
    type: actualItemType.value,
    rarity: selectedRarity.value,
    lore: loreLines.value,
    stats: stats.value,
    abilities: abilities.value,
    texture: selectedTexture.value,
    isSkyblock: props.isSkyblock,
    rarityColorCode: rarityColorCode,
    rarityDisplayName: rarityDisplayName,
    textureSource: textureSource.value,
    enchantGlint: enchantGlint.value,
  }
  const command = generateGiveCommand(item)
  const success = await copyToClipboard(command)
  if (success) {
    // Warn about custom URL textures
    if (textureSource.value === 'custom' && selectedTexture.value) {
      alert('Command copied to clipboard!\n\nNote: Custom image URL textures will NOT work in Minecraft. Only vanilla items, player heads (via username), and skull textures (via texture hash) can be used in-game.')
    } else {
      alert('Command copied to clipboard!')
    }
  }
}

async function handleShare() {
  const item = {
    name: itemName.value,
    type: itemType.value,
    rarity: selectedRarity.value,
    lore: loreLines.value,
    stats: stats.value,
    abilities: abilities.value,
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
        <span>{{ isPetMode && isSkyblock ? '🐾' : '✎' }}</span>
        <span>{{ isPetMode && isSkyblock ? 'Pet Editor' : 'Item Editor' }}</span>
      </h2>

      <div class="space-y-4">
        <!-- Item Name -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">{{ isPetMode && isSkyblock ? 'Pet Name' : 'Item Name' }}</label>
          <!-- Color toolbar for name (vanilla items only) -->
          <div v-if="!isSkyblock" class="flex flex-wrap gap-1 p-2 bg-[#2d2d2d] border-b border-[#1a1a1a] rounded-t">
            <button
              v-for="code in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']"
              :key="'name-' + code"
              class="w-5 h-5 text-[10px] font-minecraft hover:scale-110 transition-transform"
              :class="`mc-${code}`"
              :title="`§${code}`"
              @click="handleNameInsert(`§${code}`)"
            >
              §
            </button>
            <div class="w-px h-5 bg-[#555555] mx-1" />
            <button
              class="px-2 h-5 text-[10px] font-minecraft font-bold bg-[#3d3d3d] hover:bg-[#4d4d4d]"
              title="Bold"
              @click="handleNameInsert('§l')"
            >
              B
            </button>
            <button
              class="px-2 h-5 text-[10px] font-minecraft italic bg-[#3d3d3d] hover:bg-[#4d4d4d]"
              title="Italic"
              @click="handleNameInsert('§o')"
            >
              I
            </button>
            <button
              class="px-2 h-5 text-[10px] font-minecraft bg-[#3d3d3d] hover:bg-[#4d4d4d]"
              title="Reset"
              @click="handleNameInsert('§r')"
            >
              R
            </button>
          </div>
          <input
            ref="nameInputRef"
            v-model="itemName"
            type="text"
            class="mc-input"
            :class="{ 'rounded-t-none': !isSkyblock }"
            placeholder="Enter item name..."
          >
        </div>

        <!-- Texture selector -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">{{ isPetMode && isSkyblock ? 'Pet Texture' : 'Item Texture' }}</label>
          <button
            class="mc-slot mc-slot-hover w-full h-16 flex items-center justify-center gap-3"
            @click="showTexturePicker = true"
          >
            <div class="w-12 h-12 flex items-center justify-center">
              <img
                v-if="selectedTexture"
                :key="selectedTexture"
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
          <!-- Enchant glint toggle (hidden for pets) -->
          <div v-if="!(isPetMode && isSkyblock)" class="flex items-center gap-2 mt-2">
            <input
              id="enchant-glint"
              v-model="enchantGlint"
              type="checkbox"
              class="w-4 h-4 accent-[#AA00FF]"
            >
            <label for="enchant-glint" class="font-minecraft text-xs text-[#AA00FF] cursor-pointer">
              Enchant Glint
            </label>
          </div>
        </div>

        <!-- Skyblock-specific options -->
        <template v-if="isSkyblock">
          <div class="grid grid-cols-2 gap-4">
            <!-- Rarity -->
            <RaritySelector
              v-model="selectedRarity"
              v-model:custom-name="customRarityName"
              v-model:custom-color="customRarityColor"
            />

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
              <!-- Custom item type input -->
              <input
                v-if="itemType === 'custom'"
                v-model="customItemType"
                type="text"
                class="mc-input mt-2 text-xs"
                placeholder="Enter custom type..."
              >
            </div>
          </div>

          <!-- Pet-specific options -->
          <template v-if="isPetMode">
            <div class="grid grid-cols-2 gap-4">
              <!-- Pet Level -->
              <div>
                <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Pet Level</label>
                <input
                  v-model.number="petLevel"
                  type="number"
                  min="1"
                  max="200"
                  class="mc-input"
                >
              </div>

              <!-- Pet Type -->
              <div>
                <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Pet Type</label>
                <select
                  v-model="petType"
                  class="mc-select w-full"
                >
                  <option
                    v-for="pType in PET_TYPES"
                    :key="pType"
                    :value="pType"
                  >
                    {{ pType }}
                  </option>
                  <option value="custom">Custom...</option>
                </select>
                <input
                  v-if="petType === 'custom'"
                  v-model="customPetType"
                  type="text"
                  class="mc-input mt-2 text-xs"
                  placeholder="e.g., Fishing Pet, Boss Mount..."
                >
              </div>
            </div>

            <!-- Max Level & XP -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">XP Amount</label>
                <input
                  v-model.number="petXp"
                  type="number"
                  min="0"
                  class="mc-input"
                >
              </div>
              <div class="flex flex-col gap-2 pt-3">
                <div class="flex items-center gap-2">
                  <input
                    id="max-level"
                    v-model="petIsMaxLevel"
                    type="checkbox"
                    class="w-4 h-4 accent-[#55FFFF]"
                  >
                  <label for="max-level" class="font-minecraft text-xs text-[#55FFFF] cursor-pointer">
                    Max Level
                  </label>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    id="is-mount"
                    v-model="petIsMount"
                    type="checkbox"
                    class="w-4 h-4 accent-[#FFAA00]"
                  >
                  <label for="is-mount" class="font-minecraft text-xs text-[#FFAA00] cursor-pointer">
                    Mount
                  </label>
                </div>
              </div>
            </div>

            <!-- Held Item -->
            <div class="border-t border-[#373737] pt-4">
              <label class="font-minecraft text-xs text-[#AAAAAA] mb-2 block">Held Item</label>
              <div class="space-y-2">
                <input
                  v-model="petHeldItem.name"
                  type="text"
                  class="mc-input text-xs"
                  placeholder="Item name (e.g., Washed-up Souvenir)"
                >
                <input
                  v-model="petHeldItem.perk"
                  type="text"
                  class="mc-input text-xs"
                  placeholder="Item perk (e.g., Grants +5α Sea Creature Chance.)"
                >
              </div>
            </div>

            <!-- Stats Editor (without gemstones for pets) -->
            <div class="border-t border-[#373737] pt-4">
              <SkyblockStatEditor v-model="stats" v-model:abilities="abilities" v-model:custom-stats="customStats" :hide-gemstones="true" />
            </div>
          </template>

          <!-- Regular item options (non-pet) -->
          <template v-else>
            <!-- Dungeonized checkbox -->
            <div class="flex items-center gap-2 mt-2">
              <input
                id="dungeonized"
                v-model="isDungeonized"
                type="checkbox"
                class="w-4 h-4 accent-[#AA00AA]"
              >
              <label for="dungeonized" class="font-minecraft text-xs text-[#AA00AA] cursor-pointer">
                Dungeonized
              </label>
              <span class="text-[10px] text-[#555555]">(Shows "DUNGEON" in rarity)</span>
            </div>

            <!-- Stats Editor -->
            <div class="border-t border-[#373737] pt-4">
              <SkyblockStatEditor v-model="stats" v-model:gemstone-slots="gemstoneSlots" v-model:abilities="abilities" v-model:custom-stats="customStats" />
            </div>
          </template>
        </template>

        <!-- Lore Editor -->
        <div class="border-t border-[#373737] pt-4">
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-2 block">Item Lore</label>

          <!-- Color codes toolbar -->
          <div class="flex flex-wrap gap-1 p-2 bg-[#2d2d2d] border-b border-[#1a1a1a]">
            <button
              v-for="code in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']"
              :key="code"
              class="w-5 h-5 text-[10px] font-minecraft hover:scale-110 transition-transform"
              :class="`mc-${code}`"
              :title="`§${code} (select text to wrap)`"
              @click="handleInsert(`§${code}`)"
            >
              §
            </button>
            <div class="w-px h-5 bg-[#555555] mx-1" />
            <button
              class="px-2 h-5 text-[10px] font-minecraft font-bold bg-[#3d3d3d] hover:bg-[#4d4d4d]"
              title="Bold"
              @click="handleInsert('§l')"
            >
              B
            </button>
            <button
              class="px-2 h-5 text-[10px] font-minecraft italic bg-[#3d3d3d] hover:bg-[#4d4d4d]"
              title="Italic"
              @click="handleInsert('§o')"
            >
              I
            </button>
            <button
              class="px-2 h-5 text-[10px] font-minecraft bg-[#3d3d3d] hover:bg-[#4d4d4d]"
              title="Reset"
              @click="handleInsert('§r')"
            >
              R
            </button>
            <div class="w-px h-5 bg-[#555555] mx-1" />
            <button
              class="px-2 h-5 text-[10px] font-minecraft bg-[#3d3d3d] hover:bg-[#4d4d4d] text-[#FF5555]"
              title="Insert Symbol"
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
            placeholder="Use §c for red, §l for bold... Select text and click a color to wrap it."
          />

          <p class="font-minecraft text-[10px] text-[#555555] mt-1">
            Tip: Select text and click a color to wrap it. §7 is gray, §c is red, §6 is gold
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
        <!-- Pet Preview -->
        <PetPreview
          v-if="isPetMode && isSkyblock"
          ref="petPreviewRef"
          :name="itemName"
          :rarity="selectedRarity"
          :custom-rarity-name="customRarityName"
          :custom-rarity-color="customRarityColor"
          :pet-type="actualPetType"
          :level="petLevel"
          :is-max-level="petIsMaxLevel"
          :is-mount="petIsMount"
          :is-custom-type="petType === 'custom'"
          :xp="petXp"
          :stats="stats"
          :abilities="abilities"
          :custom-stats="customStats"
          :held-item="petHeldItem"
          :texture="selectedTexture"
          :lore="loreLines"
        />
        <!-- Item Preview -->
        <ItemPreview
          v-else
          ref="itemPreviewRef"
          :name="itemName"
          :rarity="selectedRarity"
          :custom-rarity-name="customRarityName"
          :custom-rarity-color="customRarityColor"
          :name-color="nameColor"
          :item-type="actualItemType"
          :lore="loreLines"
          :stats="stats"
          :gemstone-slots="gemstoneSlots"
          :abilities="abilities"
          :custom-stats="customStats"
          :texture="selectedTexture"
          :leather-color="leatherColor"
          :is-skyblock="isSkyblock"
          :is-dungeonized="isDungeonized"
          :enchant-glint="enchantGlint"
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
