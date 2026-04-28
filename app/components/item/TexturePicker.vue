<script setup lang="ts">
import type { TextureItem, LeatherArmorId } from '~/types'
import { LEATHER_ARMOR_IDS } from '~/types'
import { useLeatherArmor, isLeatherArmor } from '~/composables/useLeatherArmor'

interface Props {
  show: boolean
  currentTexture?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  select: [texture: TextureItem, count: number]
}>()

const { loading, items, initItems, searchVanillaItems, getCategories, getHeadUrl, validateImageUrl } = useTextures()
const { getDyedTexture, isRendering: isRenderingLeather } = useLeatherArmor()

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedTab = ref<'vanilla' | 'heads' | 'custom'>('vanilla')
const customUrl = ref('')
const headUsername = ref('')
const headPreview = ref('')
const headInputType = ref<'username' | 'texture'>('username')
const textureValue = ref('')
const texturePreview = ref('')
const isValidatingUrl = ref(false)
const urlError = ref('')
const itemCount = ref(1)
const pendingItem = ref<TextureItem | null>(null)
const leatherColor = ref('#A06540') // Default leather brown color
const leatherPreviewTexture = ref<string | null>(null) // Rendered preview texture

// Proxy external URLs through images.weserv.nl to add CORS headers for PNG export
function getProxiedUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Don't proxy same-origin URLs
    if (parsed.origin === window.location.origin) {
      return url
    }
    // If already proxied, return as-is
    if (parsed.hostname === 'images.weserv.nl') {
      return url
    }
    // Proxy all external URLs with unique cache buster
    // &n=-1 disables weserv caching, timestamp in URL busts browser cache
    const timestamp = Date.now()
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&n=-1&cb=${timestamp}`
  } catch {
    return url
  }
}

// Initialize items when modal is shown, reset state when closed
watch(() => props.show, (isShown) => {
  if (isShown && items.value.length === 0) {
    initItems()
  }
  if (!isShown) {
    // Reset all input state when modal closes
    customUrl.value = ''
    headUsername.value = ''
    headPreview.value = ''
    textureValue.value = ''
    texturePreview.value = ''
    urlError.value = ''
    pendingItem.value = null
    itemCount.value = 1
  }
}, { immediate: true })

const categories = computed(() => getCategories())

const filteredItems = computed(() => {
  if (selectedTab.value === 'vanilla') {
    return searchVanillaItems(searchQuery.value, selectedCategory.value)
  }
  return []
})

async function selectItem(item: TextureItem) {
  pendingItem.value = item
  itemCount.value = 1
  // Reset leather color to default when selecting a new item
  leatherColor.value = '#A06540'
  leatherPreviewTexture.value = null

  // If leather armor, render preview with default color
  if (isLeatherArmor(item.id)) {
    const texture = await getDyedTexture(item.id, leatherColor.value)
    leatherPreviewTexture.value = texture
  }
}

async function confirmSelection() {
  if (pendingItem.value) {
    // For leather armor, generate the final dyed texture
    const itemToEmit = { ...pendingItem.value }
    if (isLeatherArmor(pendingItem.value.id)) {
      const dyedTexture = await getDyedTexture(pendingItem.value.id, leatherColor.value)
      if (dyedTexture) {
        itemToEmit.texture = dyedTexture
      }
      itemToEmit.leatherColor = leatherColor.value
    }
    emit('select', itemToEmit, itemCount.value)
    pendingItem.value = null
    itemCount.value = 1
    leatherColor.value = '#A06540'
    leatherPreviewTexture.value = null
    emit('close')
  }
}

function cancelSelection() {
  pendingItem.value = null
  itemCount.value = 1
  leatherPreviewTexture.value = null
}

// Watch leather color changes to update preview
watch(leatherColor, async (newColor) => {
  if (pendingItem.value && isLeatherArmor(pendingItem.value.id)) {
    const texture = await getDyedTexture(pendingItem.value.id, newColor)
    leatherPreviewTexture.value = texture
  }
})

async function searchHead() {
  if (!headUsername.value) return

  const url = getHeadUrl(headUsername.value)
  const isValid = await validateImageUrl(url)

  if (isValid) {
    headPreview.value = url
    urlError.value = ''
  } else {
    headPreview.value = ''
    urlError.value = 'Player not found'
  }
}

function selectHead() {
  if (!headPreview.value) return

  pendingItem.value = {
    id: headUsername.value,
    name: `${headUsername.value}'s Head`,
    texture: headPreview.value,
    source: 'heads',
  }
  itemCount.value = 1
}

// Search for skull texture by hash or base64 value
async function searchTexture() {
  if (!textureValue.value) return

  urlError.value = ''
  const value = textureValue.value.trim()

  // Build the mc-heads URL - works with both texture hashes and base64 values
  const directUrl = `https://mc-heads.net/head/${value}/64`

  // Validate using direct URL first (faster), then use proxied URL for storage
  const isValid = await validateImageUrl(directUrl)

  if (isValid) {
    texturePreview.value = getProxiedUrl(directUrl)
    urlError.value = ''
  } else {
    texturePreview.value = ''
    urlError.value = 'Invalid texture value'
  }
}

function selectTexture() {
  if (!texturePreview.value) return

  const shortId = textureValue.value.slice(0, 8)
  pendingItem.value = {
    id: textureValue.value,
    name: `Custom Head (${shortId}...)`,
    texture: texturePreview.value,
    source: 'heads',
  }
  itemCount.value = 1
}

async function validateCustomUrl() {
  if (!customUrl.value) return

  isValidatingUrl.value = true
  urlError.value = ''

  // Validate using direct URL first, then store proxied URL for CORS support
  const isValid = await validateImageUrl(customUrl.value)

  if (isValid) {
    pendingItem.value = {
      id: 'custom',
      name: 'Custom Texture',
      texture: getProxiedUrl(customUrl.value),
      source: 'custom',
    }
    itemCount.value = 1
  } else {
    urlError.value = 'Invalid image URL'
  }

  isValidatingUrl.value = false
}

const tabs = [
  { id: 'vanilla', label: 'Items', icon: '⬛' },
  { id: 'heads', label: 'Heads', icon: '👤' },
  { id: 'custom', label: 'Custom', icon: '🔗' },
] as const
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <div class="mc-panel-dark p-0 w-full max-w-2xl max-h-[80vh] flex flex-col animate-slide-up overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-[#373737]">
            <h3 class="font-minecraft text-[#FFAA00] mc-text-shadow">
              Select Texture
            </h3>
            <button
              class="text-[#FF5555] hover:text-[#FF7777] font-minecraft text-lg"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-[#373737]">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="flex-1 py-2 px-3 font-minecraft text-xs flex items-center justify-center gap-1 transition-colors"
              :class="selectedTab === tab.id ? 'bg-[#3d3d3d] text-white' : 'bg-[#2d2d2d] text-[#AAAAAA] hover:bg-[#353535]'"
              @click="selectedTab = tab.id"
            >
              <span>{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-hidden p-4">
            <!-- Items tab -->
            <template v-if="selectedTab === 'vanilla'">
              <!-- Search and filter -->
              <div class="flex gap-2 mb-4">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search items..."
                  class="mc-input flex-1 text-sm"
                >
                <select
                  v-model="selectedCategory"
                  class="mc-select text-sm w-32"
                >
                  <option
                    v-for="cat in categories"
                    :key="cat"
                    :value="cat"
                  >
                    {{ cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ') }}
                  </option>
                </select>
              </div>

              <!-- Loading state -->
              <div
                v-if="loading"
                class="flex items-center justify-center py-12"
              >
                <div class="text-[#AAAAAA] text-sm">Loading items...</div>
              </div>

              <!-- Items grid -->
              <div
                v-else
                class="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto p-1"
              >
                <button
                  v-for="item in filteredItems"
                  :key="item.id"
                  class="mc-slot mc-slot-hover aspect-square flex items-center justify-center p-1 group relative"
                  :title="item.name"
                  @click="selectItem(item)"
                >
                  <img
                    :src="item.texture"
                    :alt="item.name"
                    class="w-full h-full object-contain"
                    loading="lazy"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  >
                  <!-- Tooltip -->
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#100010] border border-[#28007d] text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {{ item.name }}
                  </div>
                </button>
              </div>

              <p
                v-if="!loading && filteredItems.length === 0"
                class="text-center text-[#AAAAAA] text-sm py-8"
              >
                No items found
              </p>
            </template>

            <!-- Heads tab -->
            <template v-else-if="selectedTab === 'heads'">
              <div class="space-y-4">
                <!-- Toggle between username and texture input -->
                <div class="flex gap-2 mb-3">
                  <button
                    class="flex-1 py-1.5 text-xs rounded transition-colors"
                    :class="headInputType === 'username' ? 'bg-[#3d7a37] text-white' : 'bg-[#2d2d2d] text-[#AAAAAA] hover:bg-[#353535]'"
                    @click="headInputType = 'username'"
                  >
                    Player Username
                  </button>
                  <button
                    class="flex-1 py-1.5 text-xs rounded transition-colors"
                    :class="headInputType === 'texture' ? 'bg-[#3d7a37] text-white' : 'bg-[#2d2d2d] text-[#AAAAAA] hover:bg-[#353535]'"
                    @click="headInputType = 'texture'"
                  >
                    Skull Texture
                  </button>
                </div>

                <!-- Username input -->
                <div v-if="headInputType === 'username'">
                  <label class="text-xs text-[#AAAAAA] mb-1 block">Player Username</label>
                  <div class="flex gap-2">
                    <input
                      v-model="headUsername"
                      type="text"
                      placeholder="Enter username..."
                      class="mc-input flex-1 text-sm"
                      @keyup.enter="searchHead"
                    >
                    <button
                      class="mc-btn-primary px-4"
                      @click="searchHead"
                    >
                      Search
                    </button>
                  </div>
                </div>

                <!-- Texture value input -->
                <div v-else>
                  <label class="text-xs text-[#AAAAAA] mb-1 block">Texture Hash or Base64 Value</label>
                  <div class="flex gap-2">
                    <input
                      v-model="textureValue"
                      type="text"
                      placeholder="e.g. dceb1708d5404ef... or eyJ0ZXh0dXJlcyI6..."
                      class="mc-input flex-1 text-sm"
                      @keyup.enter="searchTexture"
                    >
                    <button
                      class="mc-btn-primary px-4"
                      @click="searchTexture"
                    >
                      Load
                    </button>
                  </div>
                  <p class="text-[10px] text-[#555555] mt-1">
                    Paste texture hash from textures.minecraft.net or base64 value from NBT data
                  </p>
                </div>

                <p
                  v-if="urlError"
                  class="text-xs text-[#FF5555]"
                >
                  {{ urlError }}
                </p>

                <!-- Head preview (username) -->
                <div
                  v-if="headInputType === 'username' && headPreview"
                  class="flex items-center gap-4 p-4 bg-black/30 border border-[#373737] rounded"
                >
                  <div class="mc-slot w-16 h-16 flex items-center justify-center">
                    <img
                      :key="headPreview"
                      :src="headPreview"
                      :alt="headUsername"
                      class="w-12 h-12 object-contain"
                    >
                  </div>
                  <div class="flex-1">
                    <p class="text-white">{{ headUsername }}</p>
                    <p class="text-xs text-[#AAAAAA]">Player Head</p>
                  </div>
                  <button
                    class="mc-btn-primary"
                    @click="selectHead"
                  >
                    Select
                  </button>
                </div>

                <!-- Texture preview -->
                <div
                  v-if="headInputType === 'texture' && texturePreview"
                  class="flex items-center gap-4 p-4 bg-black/30 border border-[#373737] rounded"
                >
                  <div class="mc-slot w-16 h-16 flex items-center justify-center">
                    <img
                      :key="texturePreview"
                      :src="texturePreview"
                      alt="Custom Head"
                      class="w-12 h-12 object-contain"
                    >
                  </div>
                  <div class="flex-1">
                    <p class="text-white">Custom Head</p>
                    <p class="text-xs text-[#AAAAAA]">Skull Texture</p>
                  </div>
                  <button
                    class="mc-btn-primary"
                    @click="selectTexture"
                  >
                    Select
                  </button>
                </div>

                <p class="text-xs text-[#555555] mt-2">
                  <template v-if="headInputType === 'username'">
                    Enter a Minecraft username to get their head texture.
                  </template>
                  <template v-else>
                    For Skyblock items, find the texture value in the item's NBT data or from sites like minecraft-heads.com
                  </template>
                </p>
              </div>
            </template>

            <!-- Custom URL tab -->
            <template v-else-if="selectedTab === 'custom'">
              <div class="space-y-4">
                <div>
                  <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Image URL</label>
                  <div class="flex gap-2">
                    <input
                      v-model="customUrl"
                      type="url"
                      placeholder="https://example.com/texture.png"
                      class="mc-input flex-1 text-sm"
                      @keyup.enter="validateCustomUrl"
                    >
                    <button
                      class="mc-btn-primary px-4"
                      :disabled="isValidatingUrl"
                      @click="validateCustomUrl"
                    >
                      {{ isValidatingUrl ? '...' : 'Use' }}
                    </button>
                  </div>
                </div>

                <p
                  v-if="urlError"
                  class="font-minecraft text-xs text-[#FF5555]"
                >
                  {{ urlError }}
                </p>

                <p class="font-minecraft text-xs text-[#555555]">
                  Paste a direct link to any image. The image must be CORS-enabled.
                </p>
              </div>
            </template>
          </div>

          <!-- Count selection panel (shown when item is pending) -->
          <div
            v-if="pendingItem"
            class="absolute inset-0 bg-black/90 flex items-center justify-center"
          >
            <div class="bg-[#1a1a1a] border border-[#444] rounded-lg p-6 max-w-xs w-full mx-4">
              <h4 class="text-[#FFAA00] text-sm mb-4 text-center">
                {{ isLeatherArmor(pendingItem.id) ? 'Customize Leather Armor' : 'Set Item Count' }}
              </h4>

              <div class="flex items-center justify-center gap-4 mb-4">
                <div class="mc-slot w-16 h-16 flex items-center justify-center relative">
                  <!-- Use rendered leather texture if available, otherwise original -->
                  <img
                    v-if="isLeatherArmor(pendingItem.id) && leatherPreviewTexture"
                    :key="leatherPreviewTexture"
                    :src="leatherPreviewTexture"
                    :alt="pendingItem.name"
                    class="w-12 h-12 object-contain pixelated"
                  >
                  <img
                    v-else
                    :key="pendingItem.texture"
                    :src="pendingItem.texture"
                    :alt="pendingItem.name"
                    class="w-12 h-12 object-contain pixelated"
                  >
                  <!-- Loading indicator for leather rendering -->
                  <div
                    v-if="isLeatherArmor(pendingItem.id) && isRenderingLeather"
                    class="absolute inset-0 flex items-center justify-center bg-black/50"
                  >
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                <div>
                  <p class="text-white text-sm">{{ pendingItem.name }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <button
                      class="w-8 h-8 bg-[#333] hover:bg-[#444] rounded text-white"
                      @click="itemCount = Math.max(1, itemCount - 1)"
                    >
                      -
                    </button>
                    <input
                      v-model.number="itemCount"
                      type="number"
                      min="1"
                      max="64"
                      class="w-14 h-8 bg-[#0f0f0f] border border-[#444] rounded text-center text-white text-sm"
                    >
                    <button
                      class="w-8 h-8 bg-[#333] hover:bg-[#444] rounded text-white"
                      @click="itemCount = Math.min(64, itemCount + 1)"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <!-- Leather dye color picker -->
              <div v-if="isLeatherArmor(pendingItem.id)" class="mb-4">
                <label class="text-xs text-[#AAAAAA] mb-2 block">Dye Color</label>
                <div class="flex items-center gap-3">
                  <input
                    v-model="leatherColor"
                    type="color"
                    class="w-10 h-10 rounded cursor-pointer border-2 border-[#444] bg-transparent"
                  >
                  <input
                    v-model="leatherColor"
                    type="text"
                    class="flex-1 h-8 bg-[#0f0f0f] border border-[#444] rounded px-2 text-white text-sm font-mono"
                    placeholder="#A06540"
                  >
                </div>
                <!-- Preset colors -->
                <div class="flex flex-wrap gap-1 mt-2">
                  <button
                    v-for="color in ['#A06540', '#FF5555', '#FFAA00', '#55FF55', '#55FFFF', '#5555FF', '#AA00AA', '#FF55FF', '#FFFFFF', '#1D1D21']"
                    :key="color"
                    class="w-6 h-6 rounded border border-[#444] hover:scale-110 transition-transform"
                    :style="{ backgroundColor: color }"
                    :title="color"
                    @click="leatherColor = color"
                  />
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  class="flex-1 py-2 bg-[#333] hover:bg-[#444] rounded text-[#888] text-sm"
                  @click="cancelSelection"
                >
                  Cancel
                </button>
                <button
                  class="flex-1 py-2 bg-[#2d7a27] hover:bg-[#3d8a37] rounded text-white text-sm"
                  @click="confirmSelection"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mc-text-shadow {
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}
</style>
