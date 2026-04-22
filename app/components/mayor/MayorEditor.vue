<script setup lang="ts">
import type { TextureItem } from '~/types'
import { MINECRAFT_COLORS, MINECRAFT_COLOR_NAMES } from '~/types'
import TexturePicker from '../item/TexturePicker.vue'
import MayorGrid from './MayorGrid.vue'
import MinecraftButton from '../ui/MinecraftButton.vue'

const { exportAsPng, copyToClipboard } = useExport()

// Preview refs
const mayorGridRef = ref<InstanceType<typeof MayorGrid>>()

// Editor state
const mayorName = ref('Paul')
const isMinister = ref(false)
const mayorColor = ref('e') // Yellow by default
const selectedTexture = ref<string>('')
const perks = ref<{ name: string; description: string }[]>([
  { name: 'Marauder', description: 'Dungeon reward chests are §e20%§7 cheaper.' },
  { name: 'EZPZ', description: 'Gain §e10§7 bonus score on dungeon runs.' },
])

// UI state
const showTexturePicker = ref(false)
const perkTextareaRefs = ref<(HTMLTextAreaElement | null)[]>([])

function handleTextureSelect(item: TextureItem) {
  selectedTexture.value = item.texture
}

// Perk functions
function addPerk() {
  perks.value.push({ name: 'New Perk', description: 'Perk description' })
}

function removePerk(index: number) {
  perks.value.splice(index, 1)
}

function updatePerkName(index: number, name: string) {
  perks.value[index].name = name
}

function updatePerkDescription(index: number, description: string) {
  perks.value[index].description = description
}

function insertIntoPerk(index: number, text: string) {
  const textarea = perkTextareaRefs.value[index]
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const current = perks.value[index].description
  const before = current.slice(0, start)
  const after = current.slice(end)

  perks.value[index].description = before + text + after

  nextTick(() => {
    textarea.setSelectionRange(start + text.length, start + text.length)
    textarea.focus()
  })
}

// Export functions
async function handleExportPng() {
  if (mayorGridRef.value?.menuRef) {
    await exportAsPng(mayorGridRef.value.menuRef, `mayor-${Date.now()}`)
  }
}

async function handleCopyJson() {
  const mayor = {
    name: mayorName.value,
    isMinister: isMinister.value,
    color: mayorColor.value,
    texture: selectedTexture.value,
    perks: perks.value,
  }
  const success = await copyToClipboard(JSON.stringify(mayor, null, 2))
  if (success) {
    alert('JSON copied to clipboard!')
  }
}
</script>

<template>
  <div class="grid lg:grid-cols-2 gap-6">
    <!-- Editor Panel -->
    <div class="mc-panel-dark p-4">
      <h2 class="font-minecraft text-[#FFAA00] mb-4 mc-text-shadow flex items-center gap-2">
        <span>👑</span>
        <span>Mayor Editor</span>
      </h2>

      <div class="space-y-4">
        <!-- Mayor Name -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Mayor Name</label>
          <input
            v-model="mayorName"
            type="text"
            class="mc-input"
            placeholder="Enter mayor name..."
          >
        </div>

        <!-- Minister checkbox -->
        <div class="flex items-center gap-2">
          <input
            id="is-minister"
            v-model="isMinister"
            type="checkbox"
            class="w-4 h-4 accent-[#AA00AA]"
          >
          <label for="is-minister" class="font-minecraft text-xs text-[#AA00AA] cursor-pointer">
            Minister
          </label>
          <span class="text-[10px] text-[#555555]">(Changes "Mayor" to "Minister")</span>
        </div>

        <!-- Color selector -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Name & Perk Color</label>
          <div class="flex flex-wrap gap-1 p-2 bg-[#2d2d2d] rounded">
            <button
              v-for="code in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']"
              :key="code"
              class="w-7 h-7 rounded transition-all flex items-center justify-center"
              :class="mayorColor === code ? 'ring-2 ring-white scale-110' : 'hover:scale-105'"
              :style="{ backgroundColor: MINECRAFT_COLORS[code] }"
              :title="MINECRAFT_COLOR_NAMES[code]"
              @click="mayorColor = code"
            >
              <span v-if="mayorColor === code" class="text-xs" :class="['0', '1', '2', '4', '5', '8'].includes(code) ? 'text-white' : 'text-black'">✓</span>
            </button>
          </div>
        </div>

        <!-- Texture selector -->
        <div>
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Mayor Head Texture</label>
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
        </div>

        <!-- Perks Editor -->
        <div class="border-t border-[#373737] pt-4">
          <label class="font-minecraft text-xs text-[#AAAAAA] mb-2 block">Perks</label>

          <div class="space-y-3">
            <div
              v-for="(perk, index) in perks"
              :key="index"
              class="p-3 bg-[#1a1a1a] border border-[#333] rounded space-y-2"
            >
              <div class="flex items-center gap-2">
                <input
                  :value="perk.name"
                  type="text"
                  class="mc-input text-xs py-1 flex-1"
                  placeholder="Perk Name"
                  @input="updatePerkName(index, ($event.target as HTMLInputElement).value)"
                >
                <button
                  class="w-6 h-6 flex items-center justify-center text-[#FF5555] hover:text-[#FF7777] bg-[#2d2d2d] rounded"
                  @click="removePerk(index)"
                >
                  ✕
                </button>
              </div>

              <!-- Color toolbar -->
              <div class="flex flex-wrap gap-1 p-2 bg-[#2d2d2d] rounded-t border-b border-[#1a1a1a]">
                <button
                  v-for="code in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']"
                  :key="code"
                  class="w-5 h-5 text-[10px] font-minecraft hover:scale-110 transition-transform"
                  :style="{ color: MINECRAFT_COLORS[code] }"
                  :title="`${MINECRAFT_COLOR_NAMES[code]} (§${code})`"
                  @click="insertIntoPerk(index, `§${code}`)"
                >
                  §
                </button>
                <div class="w-px h-5 bg-[#555555] mx-1" />
                <button
                  class="px-2 h-5 text-[10px] font-minecraft font-bold bg-[#3d3d3d] hover:bg-[#4d4d4d]"
                  title="Bold"
                  @click="insertIntoPerk(index, '§l')"
                >
                  B
                </button>
                <button
                  class="px-2 h-5 text-[10px] font-minecraft italic bg-[#3d3d3d] hover:bg-[#4d4d4d]"
                  title="Italic"
                  @click="insertIntoPerk(index, '§o')"
                >
                  I
                </button>
                <button
                  class="px-2 h-5 text-[10px] font-minecraft bg-[#3d3d3d] hover:bg-[#4d4d4d]"
                  title="Reset"
                  @click="insertIntoPerk(index, '§r')"
                >
                  R
                </button>
              </div>

              <textarea
                :ref="el => perkTextareaRefs[index] = el as HTMLTextAreaElement"
                :value="perk.description"
                class="mc-input text-xs py-1 w-full min-h-[50px] resize-y rounded-t-none"
                placeholder="Perk description"
                @input="updatePerkDescription(index, ($event.target as HTMLTextAreaElement).value)"
              />
            </div>
          </div>

          <button
            class="w-full mt-3 py-2 text-xs text-[#55FF55] hover:text-[#77FF77] bg-[#2d2d2d] hover:bg-[#353535] rounded transition-colors"
            @click="addPerk"
          >
            + Add Perk
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Panel -->
    <div class="mc-panel-dark p-4">
      <h2 class="font-minecraft text-[#FFAA00] mb-4 mc-text-shadow flex items-center gap-2">
        <span>👁</span>
        <span>Preview</span>
      </h2>

      <div class="flex justify-center bg-black/30 border border-[#373737] p-4">
        <MayorGrid
          ref="mayorGridRef"
          :mayor-name="mayorName"
          :mayor-texture="selectedTexture"
          :is-minister="isMinister"
          :color="mayorColor"
          :perks="perks"
          @head-click="showTexturePicker = true"
        />
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
