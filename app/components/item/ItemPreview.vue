<script setup lang="ts">
import { RARITIES, SKYBLOCK_STATS, GEMSTONE_TYPES, GEMSTONE_RARITIES, type GemstoneSlot } from '~/types'
import MinecraftText from './MinecraftText.vue'
import type { Rarity } from '~/types'

interface Props {
  name: string
  rarity: string
  itemType: string
  lore: string[]
  stats: Record<string, number>
  gemstoneSlots?: GemstoneSlot[]
  texture?: string
  isSkyblock: boolean
}

const props = defineProps<Props>()

const previewRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()

const selectedRarity = computed(() => {
  return RARITIES.find(r => r.name === props.rarity) ?? RARITIES[0]
})

// Format the item name with rarity color
const formattedName = computed(() => {
  return `§${selectedRarity.value.code}§l${props.name || 'Item Name'}§r`
})

// Map hex colors to Minecraft color codes
function getColorCode(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#FF5555': 'c', // Red
    '#5555FF': '9', // Blue
    '#55FF55': 'a', // Green
    '#55FFFF': 'b', // Aqua
    '#FFFF55': 'e', // Yellow
    '#FFAA00': '6', // Gold
    '#FFFFFF': 'f', // White
    '#AA00AA': '5', // Purple
    '#AAAAAA': '7', // Gray
    '#00AA00': '2', // Dark Green
  }
  return colorMap[hexColor] || 'c'
}

// Format gemstone slots for display - returns array for separate rendering
const gemstoneSlotData = computed(() => {
  if (!props.gemstoneSlots || props.gemstoneSlots.length === 0) return []

  return props.gemstoneSlots.map(slot => {
    const gemType = GEMSTONE_TYPES.find(g => g.id === slot.type)
    const gemRarity = GEMSTONE_RARITIES.find(r => r.id === slot.rarity)
    if (!gemType || !gemRarity) return null
    return {
      symbol: gemType.symbol,
      color: gemRarity.color,
    }
  }).filter(Boolean) as { symbol: string; color: string }[]
})

// Format stats for display
const formattedStats = computed(() => {
  const lines: string[] = []

  for (const [key, value] of Object.entries(props.stats)) {
    if (value === 0) continue

    const stat = SKYBLOCK_STATS.find(s => s.stat === key)
    if (!stat) continue

    const prefix = value > 0 ? '+' : ''
    const suffix = key === 'crit_chance' || key === 'crit_damage' ? '%' : ''
    const colorCode = getColorCode(stat.color)
    // Skyblock format: "Damage: +100" with stat-specific color
    lines.push(`§7${stat.name}: §${colorCode}${prefix}${value}${suffix}`)
  }

  return lines
})

// Custom lore lines (filtered)
const customLoreLines = computed(() => {
  return props.lore.filter(l => l.trim())
})

// Rarity line
const rarityLine = computed(() => {
  if (!props.isSkyblock) return ''
  return `§${selectedRarity.value.code}§l${selectedRarity.value.displayName}${props.itemType ? ` ${props.itemType.toUpperCase()}` : ''}`
})

defineExpose({
  previewRef,
  tooltipRef,
})
</script>

<template>
  <div class="flex justify-center">
    <div
      ref="previewRef"
      class="inline-block"
    >
      <!-- Minecraft tooltip style container -->
      <div class="relative">
        <!-- Item icon -->
        <div class="flex items-start gap-3 mb-2">
          <div class="mc-slot w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <img
              v-if="texture"
              :src="texture"
              alt="Item texture"
              class="w-10 h-10 object-contain"
            >
            <span
              v-else
              class="text-2xl text-[#555555]"
            >?</span>
          </div>

          <!-- Item name -->
          <div class="pt-1">
            <MinecraftText
              :text="formattedName"
              class="text-base"
            />
          </div>
        </div>

        <!-- Tooltip content -->
        <div ref="tooltipRef" class="mc-tooltip p-3 min-w-[250px] max-w-[350px]">
          <!-- Item name in tooltip -->
          <MinecraftText
            :text="formattedName"
            class="text-sm block mb-1"
          />

          <!-- Lore lines -->
          <div class="space-y-0.5">
            <!-- Stats section -->
            <template v-if="isSkyblock && formattedStats.length > 0">
              <MinecraftText
                v-for="(line, index) in formattedStats"
                :key="'stat-' + index"
                :text="line"
                class="text-xs block"
              />
              <div class="h-2" />
            </template>

            <!-- Gemstone slots -->
            <template v-if="isSkyblock && gemstoneSlotData.length > 0">
              <div class="mc-font text-xs mc-text-shadow">
                <span
                  v-for="(gem, gIndex) in gemstoneSlotData"
                  :key="gIndex"
                  class="gemstone-slot"
                  :style="{ color: gem.color }"
                >[<span class="gem-symbol">{{ gem.symbol }}</span>]</span>
              </div>
              <div class="h-2" />
            </template>

            <!-- Custom lore -->
            <template v-if="customLoreLines.length > 0">
              <MinecraftText
                v-for="(line, index) in customLoreLines"
                :key="'lore-' + index"
                :text="line"
                class="text-xs block"
              />
            </template>

            <!-- Rarity line -->
            <template v-if="isSkyblock">
              <div class="h-2" />
              <MinecraftText
                :text="rarityLine"
                class="text-xs block"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mc-tooltip {
  background: #100010;
  border: 2px solid #28007d;
  box-shadow:
    inset 0 0 0 1px #28007d,
    0 0 0 1px #100010,
    4px 4px 0 rgba(0, 0, 0, 0.3);
}
</style>
