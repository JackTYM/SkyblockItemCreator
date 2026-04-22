<script setup lang="ts">
import { RARITIES, SKYBLOCK_STATS, type ItemAbility, type PetHeldItem } from '~/types'
import MinecraftText from './MinecraftText.vue'

interface Props {
  name: string
  rarity: string
  customRarityName?: string
  customRarityColor?: string
  petType: string
  level: number
  isMaxLevel: boolean
  isMount: boolean
  xp: number
  stats: Record<string, number>
  abilities?: ItemAbility[]
  heldItem?: PetHeldItem
  texture?: string
  lore?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  customRarityName: '',
  customRarityColor: '#FF5555',
  level: 1,
  isMaxLevel: false,
  isMount: false,
  xp: 0,
  lore: () => [],
})

// Custom lore lines (filtered)
const customLoreLines = computed(() => {
  return props.lore.filter(l => l.trim())
})

const previewRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()

const selectedRarity = computed(() => {
  if (props.rarity === 'custom') {
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

function findClosestColorCode(hexColor: string): string {
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

// Format the pet name with level (level is gray, name is rarity color)
const formattedName = computed(() => {
  const name = props.name || 'Pet Name'
  return `§7[Lvl ${props.level}] §${selectedRarity.value.code}${name}`
})

// Pet type line (dark gray)
const petTypeLine = computed(() => {
  const suffix = props.isMount ? 'Mount' : 'Pet'
  return `§8${props.petType} ${suffix}`
})

// Map hex colors to Minecraft color codes
function getColorCode(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#FF5555': 'c',
    '#5555FF': '9',
    '#55FF55': 'a',
    '#55FFFF': 'b',
    '#00CED1': '3', // Turquoise -> dark aqua
    '#FFFF55': 'e',
    '#FFAA00': '6',
    '#FFFFFF': 'f',
    '#AA00AA': '5',
    '#AAAAAA': '7',
    '#00AA00': '2',
  }
  return colorMap[hexColor] || 'c'
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
    lines.push(`§7${stat.name}: §${colorCode}${prefix}${value}${suffix}`)
  }

  return lines
})

// Format XP with commas
const formattedXp = computed(() => {
  return props.xp.toLocaleString()
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
      <div class="relative">
        <!-- Pet icon -->
        <div class="flex items-start gap-3 mb-2">
          <div class="mc-slot w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <img
              v-if="texture"
              :key="texture"
              :src="texture"
              alt="Pet texture"
              class="w-10 h-10 object-contain pixelated"
            >
            <span
              v-else
              class="text-2xl text-[#555555]"
            >?</span>
          </div>

          <!-- Pet name -->
          <div class="pt-1">
            <MinecraftText
              :text="formattedName"
              class="text-base"
            />
          </div>
        </div>

        <!-- Tooltip content -->
        <div ref="tooltipRef" class="mc-tooltip p-3 min-w-[280px]">
          <!-- Pet name in tooltip -->
          <MinecraftText
            :text="formattedName"
            class="text-sm block"
          />
          <!-- Pet type -->
          <MinecraftText
            :text="petTypeLine"
            class="text-xs block mb-2"
          />

          <div class="space-y-0.5">
            <!-- Stats section -->
            <template v-if="formattedStats.length > 0">
              <MinecraftText
                v-for="(line, index) in formattedStats"
                :key="'stat-' + index"
                :text="line"
                class="text-xs block"
              />
              <div class="h-1.5" />
            </template>

            <!-- Abilities -->
            <template v-if="abilities && abilities.length > 0">
              <template v-for="(ability, aIndex) in abilities" :key="'ability-' + aIndex">
                <MinecraftText
                  :text="`§6${ability.name}`"
                  class="text-xs block"
                />
                <MinecraftText
                  v-for="(line, lIndex) in ability.description.split('\n')"
                  :key="'ability-' + aIndex + '-line-' + lIndex"
                  :text="line.startsWith('§') ? line : `§7${line}`"
                  class="text-xs block"
                />
                <div class="h-1.5" />
              </template>
            </template>

            <!-- Custom lore -->
            <template v-if="customLoreLines.length > 0">
              <MinecraftText
                v-for="(line, index) in customLoreLines"
                :key="'lore-' + index"
                :text="line"
                class="text-xs block"
              />
              <div class="h-1.5" />
            </template>

            <!-- Held Item -->
            <template v-if="heldItem && heldItem.name">
              <MinecraftText
                :text="`§7Held Item: §b${heldItem.name}`"
                class="text-xs block"
              />
              <MinecraftText
                v-if="heldItem.perk"
                :text="heldItem.perk.startsWith('§') ? heldItem.perk : `§7${heldItem.perk}`"
                class="text-xs block"
              />
              <div class="h-1.5" />
            </template>

            <!-- Max Level indicator -->
            <template v-if="isMaxLevel">
              <MinecraftText
                text="§b§lMAX LEVEL"
                class="text-xs block mb-0.5"
              />
            </template>

            <!-- XP -->
            <MinecraftText
              :text="`§8▸ ${formattedXp} XP`"
              class="text-xs block"
            />

            <div class="h-1.5" />

            <!-- Instructions -->
            <MinecraftText
              text="§eLeft-click to summon!"
              class="text-xs block"
            />
            <MinecraftText
              text="§eShift Left-click to toggle as favorite!"
              class="text-xs block"
            />
            <MinecraftText
              text="§eRight-click to convert to an item!"
              class="text-xs block"
            />
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
</style>
