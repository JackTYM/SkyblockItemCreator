<script setup lang="ts">
import { RARITIES, SKYBLOCK_STATS, GEMSTONE_TYPES, GEMSTONE_RARITIES, type GemstoneSlot, type ItemAbility, type CustomStat } from '~/types'
import MinecraftText from './MinecraftText.vue'
import type { Rarity } from '~/types'

interface Props {
  name: string
  rarity: string
  customRarityName?: string
  customRarityColor?: string
  nameColor?: string // Color code for vanilla items (e.g., 'f' for white)
  itemType: string
  lore: string[]
  stats: Record<string, number>
  gemstoneSlots?: GemstoneSlot[]
  abilities?: ItemAbility[]
  customStats?: CustomStat[]
  texture?: string
  isSkyblock: boolean
  isDungeonized?: boolean
  enchantGlint?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  customRarityName: '',
  customRarityColor: '#FF5555',
  nameColor: 'f', // Default white for vanilla
  enchantGlint: false,
})

const previewRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()

const selectedRarity = computed(() => {
  if (props.rarity === 'custom') {
    // Find the closest Minecraft color code for the custom color
    const colorCode = findClosestColorCode(props.customRarityColor)
    return {
      name: 'custom',
      displayName: props.customRarityName || 'CUSTOM',
      color: props.customRarityColor,
      code: colorCode,
      bgClass: 'bg-red-500/20',
    }
  }
  return RARITIES.find(r => r.name === props.rarity) ?? RARITIES[0]
})

// Find the closest Minecraft color code for a given hex color
function findClosestColorCode(hexColor: string): string {
  const mcColors: Record<string, string> = {
    '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
    '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
    '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
    'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF',
  }

  // Parse hex to RGB
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  let closestCode = 'c'
  let closestDistance = Infinity

  for (const [code, mcHex] of Object.entries(mcColors)) {
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

// Format the item name with appropriate color
const formattedName = computed(() => {
  const name = props.name || 'Item Name'

  // Check if name already has color codes
  const hasColorCodes = /§[0-9a-fk-or]/i.test(name)

  if (hasColorCodes) {
    // Name has custom formatting, just add bold at start if not present
    if (!name.startsWith('§l') && !name.includes('§l')) {
      return `§l${name}§r`
    }
    return `${name}§r`
  }

  // No custom formatting - apply default color based on mode
  const colorCode = props.isSkyblock ? selectedRarity.value.code : props.nameColor
  return `§${colorCode}§l${name}§r`
})

// Map hex colors to Minecraft color codes
function getColorCode(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#FF5555': 'c', // Red
    '#5555FF': '9', // Blue
    '#55FF55': 'a', // Green
    '#55FFFF': 'b', // Aqua
    '#00CED1': '3', // Turquoise -> dark aqua
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

// Find closest Minecraft color code for a hex color
function hexToColorCode(hexColor: string): string {
  const mcColors: Record<string, string> = {
    '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
    '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
    '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
    'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF',
  }

  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  let closestCode = 'f'
  let closestDistance = Infinity

  for (const [code, mcHex] of Object.entries(mcColors)) {
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

// Format stats for display (ordered by SKYBLOCK_STATS)
const formattedStats = computed(() => {
  const lines: string[] = []
  const percentStats = ['crit_chance', 'crit_damage', 'sea_creature_chance', 'trophy_fish_chance', 'bonus_pest_chance', 'overbloom', 'treasure_chance']

  // Iterate in SKYBLOCK_STATS order to maintain consistent display order
  for (const stat of SKYBLOCK_STATS) {
    const value = props.stats[stat.stat]
    if (value === undefined || value === 0) continue

    const prefix = value > 0 ? '+' : ''
    const suffix = percentStats.includes(stat.stat) ? '%' : ''
    const colorCode = getColorCode(stat.color)
    // Skyblock format: "Damage: +100" with stat-specific color
    lines.push(`§7${stat.name}: §${colorCode}${prefix}${value}${suffix}`)
  }

  // Add custom stats
  if (props.customStats) {
    for (const customStat of props.customStats) {
      if (customStat.value === 0) continue
      const prefix = customStat.value > 0 ? '+' : ''
      const colorCode = hexToColorCode(customStat.color)
      lines.push(`§7${customStat.symbol} ${customStat.name}: §${colorCode}${prefix}${customStat.value}`)
    }
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
  const dungeonPrefix = props.isDungeonized ? 'DUNGEON ' : ''
  return `§${selectedRarity.value.code}§l${selectedRarity.value.displayName} ${dungeonPrefix}${props.itemType ? `${props.itemType.toUpperCase()}` : ''}`.trim()
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
            <div v-if="texture" class="relative w-10 h-10">
              <img
                :key="texture"
                :src="texture"
                alt="Item texture"
                class="w-full h-full object-contain pixelated"
              >
              <div
                v-if="enchantGlint"
                class="absolute inset-0 glint-overlay pointer-events-none"
              />
            </div>
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
        <div ref="tooltipRef" class="mc-tooltip p-3 min-w-[250px]">
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
              <div class="h-2" />
            </template>

            <!-- Abilities -->
            <template v-if="isSkyblock && abilities && abilities.length > 0">
              <template v-for="(ability, aIndex) in abilities" :key="'ability-' + aIndex">
                <MinecraftText
                  :text="`§6Item Ability: ${ability.name}`"
                  class="text-xs block"
                />
                <MinecraftText
                  v-for="(line, lIndex) in ability.description.split('\n')"
                  :key="'ability-' + aIndex + '-line-' + lIndex"
                  :text="line.startsWith('§') ? line : `§7${line}`"
                  class="text-xs block"
                />
                <div class="h-2" />
              </template>
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

.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.glint-overlay {
  background:
    linear-gradient(
      -45deg,
      transparent 0%,
      rgba(120, 80, 200, 0.3) 15%,
      rgba(180, 100, 255, 0.5) 25%,
      transparent 35%,
      transparent 45%,
      rgba(100, 60, 180, 0.3) 55%,
      rgba(160, 80, 240, 0.5) 65%,
      transparent 75%,
      transparent 85%,
      rgba(140, 90, 220, 0.4) 95%
    );
  mix-blend-mode: screen;
}
</style>
