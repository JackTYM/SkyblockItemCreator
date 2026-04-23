<script setup lang="ts">
import { SKYBLOCK_STATS, GEMSTONE_TYPES, GEMSTONE_RARITIES, MINECRAFT_COLORS, MINECRAFT_COLOR_NAMES, SKYBLOCK_SYMBOLS, type GemstoneSlot, type ItemAbility, type CustomStat } from '~/types'

interface Props {
  modelValue: Record<string, number>
  gemstoneSlots?: GemstoneSlot[]
  abilities?: ItemAbility[]
  customStats?: CustomStat[]
  hideGemstones?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  gemstoneSlots: () => [],
  abilities: () => [],
  customStats: () => [],
  hideGemstones: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, number>]
  'update:gemstoneSlots': [value: GemstoneSlot[]]
  'update:abilities': [value: ItemAbility[]]
  'update:customStats': [value: CustomStat[]]
}>()

// Local gemstone slots state
const localGemstones = ref<GemstoneSlot[]>([...props.gemstoneSlots])

watch(() => props.gemstoneSlots, (newVal) => {
  localGemstones.value = [...newVal]
}, { deep: true })

// Local abilities state
const localAbilities = ref<ItemAbility[]>([...props.abilities])

watch(() => props.abilities, (newVal) => {
  localAbilities.value = [...newVal]
}, { deep: true })

// Local custom stats state
const localCustomStats = ref<CustomStat[]>([...props.customStats])

watch(() => props.customStats, (newVal) => {
  localCustomStats.value = [...newVal]
}, { deep: true })

// Define stat categories with their stat keys
const statCategories = {
  combat: {
    name: 'Combat',
    icon: '❁',
    color: '#FF5555',
    stats: ['damage', 'strength', 'health', 'ferocity', 'ability_damage', 'vitality', 'health_regen'],
  },
  crit: {
    name: 'Crit',
    icon: '☠',
    color: '#5555FF',
    stats: ['crit_chance', 'crit_damage'],
  },
  defense: {
    name: 'Defense',
    icon: '❈',
    color: '#55FF55',
    stats: ['defense', 'mending', 'true_defense'],
  },
  utility: {
    name: 'Utility',
    icon: '✦',
    color: '#FFFFFF',
    stats: ['speed', 'intelligence', 'attack_speed', 'swing_range'],
  },
  luck: {
    name: 'Luck',
    icon: '✯',
    color: '#55FFFF',
    stats: ['magic_find', 'pet_luck', 'treasure_chance'],
  },
  fortune: {
    name: 'Fortune',
    icon: '☘',
    color: '#FFAA00',
    stats: ['mining_fortune', 'farming_fortune', 'foraging_fortune', 'hunting_fortune', 'fishing_fortune'],
  },
  mining: {
    name: 'Mining',
    icon: '⸕',
    color: '#FFAA00',
    stats: ['mining_speed', 'pristine', 'breaking_power'],
  },
  farming: {
    name: 'Farming',
    icon: 'Ⓟ',
    color: '#00AA00',
    stats: ['bonus_pest_chance', 'overbloom'],
  },
  fishing: {
    name: 'Fishing',
    icon: '☂',
    color: '#55FFFF',
    stats: ['fishing_speed', 'sea_creature_chance', 'double_hook', 'trophy_fish_chance'],
  },
  wisdom: {
    name: 'Wisdom',
    icon: 'ℰ',
    color: '#55FFFF',
    stats: ['combat_wisdom', 'mining_wisdom', 'farming_wisdom', 'foraging_wisdom', 'fishing_wisdom', 'alchemy_wisdom', 'enchanting_wisdom', 'carpentry_wisdom', 'runecrafting_wisdom', 'social_wisdom'],
  },
  rift: {
    name: 'Rift',
    icon: '⏣',
    color: '#AA00AA',
    stats: ['rift_health', 'rift_time', 'rift_damage'],
  },
  other: {
    name: 'Other',
    icon: '⚔',
    color: '#FFFF55',
    stats: ['bonus_attack_speed', 'bonus_defense'],
  },
}

const categoryKeys = Object.keys(statCategories) as Array<keyof typeof statCategories>
const activeTab = ref<'stats' | 'gemstones' | 'abilities'>('stats')
const activeStatCategory = ref<keyof typeof statCategories>('combat')

function updateStat(stat: string, value: string) {
  const numValue = parseFloat(value) || 0
  const newStats = { ...props.modelValue }

  if (numValue === 0) {
    delete newStats[stat]
  } else {
    newStats[stat] = numValue
  }

  emit('update:modelValue', newStats)
}

function getStatInfo(statKey: string) {
  return SKYBLOCK_STATS.find(s => s.stat === statKey)
}

function getStatValue(stat: string): number {
  return props.modelValue[stat] || 0
}

function isPercentStat(stat: string): boolean {
  return ['crit_chance', 'crit_damage', 'sea_creature_chance', 'trophy_fish_chance', 'bonus_pest_chance', 'overbloom', 'treasure_chance'].includes(stat)
}

// Gemstone functions
function addGemstoneSlot() {
  localGemstones.value.push({ type: 'ruby', rarity: 'empty' })
  emit('update:gemstoneSlots', [...localGemstones.value])
}

function removeGemstoneSlot(index: number) {
  localGemstones.value.splice(index, 1)
  emit('update:gemstoneSlots', [...localGemstones.value])
}

function updateGemstoneType(index: number, type: string) {
  localGemstones.value[index].type = type
  emit('update:gemstoneSlots', [...localGemstones.value])
}

function updateGemstoneRarity(index: number, rarity: string) {
  localGemstones.value[index].rarity = rarity
  emit('update:gemstoneSlots', [...localGemstones.value])
}

function getGemstoneType(id: string) {
  return GEMSTONE_TYPES.find(g => g.id === id)
}

function getGemstoneRarity(id: string) {
  return GEMSTONE_RARITIES.find(r => r.id === id)
}

// Ability functions
const abilityTextareaRefs = ref<(HTMLTextAreaElement | null)[]>([])
const showSymbolPicker = ref(false)
const activeAbilityIndex = ref<number | null>(null)

function addAbility() {
  localAbilities.value.push({ name: 'Ability Name', description: 'Ability description' })
  emit('update:abilities', [...localAbilities.value])
}

function removeAbility(index: number) {
  localAbilities.value.splice(index, 1)
  emit('update:abilities', [...localAbilities.value])
}

function updateAbilityName(index: number, name: string) {
  localAbilities.value[index].name = name
  emit('update:abilities', [...localAbilities.value])
}

function updateAbilityDescription(index: number, description: string) {
  localAbilities.value[index].description = description
  emit('update:abilities', [...localAbilities.value])
}

function insertIntoAbility(index: number, text: string) {
  const textarea = abilityTextareaRefs.value[index]
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const current = localAbilities.value[index].description
  const before = current.slice(0, start)
  const after = current.slice(end)

  localAbilities.value[index].description = before + text + after
  emit('update:abilities', [...localAbilities.value])

  nextTick(() => {
    textarea.setSelectionRange(start + text.length, start + text.length)
    textarea.focus()
  })
}

function openSymbolPicker(index: number) {
  activeAbilityIndex.value = index
  showSymbolPicker.value = true
}

function handleSymbolSelect(symbol: string) {
  if (activeAbilityIndex.value !== null) {
    insertIntoAbility(activeAbilityIndex.value, symbol)
  }
  showSymbolPicker.value = false
}

// Custom stat functions
function addCustomStat() {
  localCustomStats.value.push({ name: 'Custom Stat', color: '#FFFFFF', value: 0 })
  emit('update:customStats', [...localCustomStats.value])
}

function removeCustomStat(index: number) {
  localCustomStats.value.splice(index, 1)
  emit('update:customStats', [...localCustomStats.value])
}

function updateCustomStat(index: number, field: keyof CustomStat, value: string | number) {
  (localCustomStats.value[index] as any)[field] = value
  emit('update:customStats', [...localCustomStats.value])
}

</script>

<template>
  <div class="space-y-3">
    <!-- Main tabs: Stats vs Gemstones -->
    <div class="flex gap-2 border-b border-[#333] pb-2">
      <button
        class="px-3 py-1.5 text-xs rounded transition-colors"
        :class="activeTab === 'stats' ? 'bg-[#3d7a37] text-white' : 'bg-[#2d2d2d] text-[#888] hover:bg-[#353535]'"
        @click="activeTab = 'stats'"
      >
        Stats
      </button>
      <button
        v-if="!hideGemstones"
        class="px-3 py-1.5 text-xs rounded transition-colors"
        :class="activeTab === 'gemstones' ? 'bg-[#3d7a37] text-white' : 'bg-[#2d2d2d] text-[#888] hover:bg-[#353535]'"
        @click="activeTab = 'gemstones'"
      >
        Gemstone Slots
      </button>
      <button
        class="px-3 py-1.5 text-xs rounded transition-colors"
        :class="activeTab === 'abilities' ? 'bg-[#3d7a37] text-white' : 'bg-[#2d2d2d] text-[#888] hover:bg-[#353535]'"
        @click="activeTab = 'abilities'"
      >
        Abilities
      </button>
    </div>

    <!-- Stats Tab -->
    <template v-if="activeTab === 'stats'">
      <!-- Category tabs -->
      <div class="flex flex-wrap gap-1">
        <button
          v-for="key in categoryKeys"
          :key="key"
          class="px-2 py-1 text-[10px] rounded transition-colors flex items-center gap-1"
          :class="activeStatCategory === key
            ? 'bg-[#3d3d3d] text-white'
            : 'bg-[#1a1a1a] text-[#888] hover:bg-[#2a2a2a] hover:text-[#aaa]'"
          @click="activeStatCategory = key"
        >
          <span :style="{ color: statCategories[key].color }">{{ statCategories[key].icon }}</span>
          <span>{{ statCategories[key].name }}</span>
        </button>
      </div>

      <!-- Active category content -->
      <div class="p-3 bg-[#1a1a1a] border border-[#333] rounded">
        <p
          class="text-xs mb-3 flex items-center gap-2"
          :style="{ color: statCategories[activeStatCategory].color }"
        >
          <span class="text-lg">{{ statCategories[activeStatCategory].icon }}</span>
          <span>{{ statCategories[activeStatCategory].name }} Stats</span>
        </p>

        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="stat in statCategories[activeStatCategory].stats"
            :key="stat"
            class="flex items-center gap-2"
          >
            <span
              class="text-base w-5 text-center"
              :style="{ color: getStatInfo(stat)?.color || '#FFFFFF' }"
            >
              {{ getStatInfo(stat)?.symbol || '?' }}
            </span>
            <div class="flex-1">
              <label class="text-[10px] text-[#666] block">
                {{ getStatInfo(stat)?.name || stat }}
              </label>
              <input
                type="number"
                step="any"
                :value="getStatValue(stat)"
                class="mc-input text-xs py-1 w-full"
                :placeholder="isPercentStat(stat) ? '%' : ''"
                @input="updateStat(stat, ($event.target as HTMLInputElement).value)"
              >
            </div>
          </div>
        </div>

        <!-- Custom Stats Section (only in Other category) -->
        <template v-if="activeStatCategory === 'other'">
          <div class="mt-4 pt-4 border-t border-[#333]">
            <p class="text-xs text-[#888] mb-3">Custom Stats</p>

            <div class="space-y-2">
              <div
                v-for="(customStat, index) in localCustomStats"
                :key="index"
                class="p-2 bg-black/30 rounded space-y-2"
              >
                <div class="flex items-center gap-2">
                  <!-- Name -->
                  <input
                    type="text"
                    :value="customStat.name"
                    class="mc-input text-xs py-1 flex-1"
                    placeholder="Stat Name"
                    @input="updateCustomStat(index, 'name', ($event.target as HTMLInputElement).value)"
                  >

                  <!-- Value -->
                  <input
                    type="number"
                    step="any"
                    :value="customStat.value"
                    class="mc-input text-xs py-1 w-20"
                    placeholder="Value"
                    @input="updateCustomStat(index, 'value', parseFloat(($event.target as HTMLInputElement).value) || 0)"
                  >

                  <!-- Remove button -->
                  <button
                    class="w-6 h-6 flex items-center justify-center text-[#FF5555] hover:text-[#FF7777] bg-[#2d2d2d] rounded"
                    @click="removeCustomStat(index)"
                  >
                    ✕
                  </button>
                </div>

                <!-- Minecraft color selector -->
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="(color, code) in MINECRAFT_COLORS"
                    :key="code"
                    class="w-5 h-5 rounded transition-transform hover:scale-110"
                    :class="customStat.color === color ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''"
                    :style="{ backgroundColor: color }"
                    :title="MINECRAFT_COLOR_NAMES[code]"
                    @click="updateCustomStat(index, 'color', color)"
                  />
                </div>
              </div>
            </div>

            <button
              class="w-full mt-2 py-2 text-xs text-[#55FF55] hover:text-[#77FF77] bg-[#2d2d2d] hover:bg-[#353535] rounded transition-colors"
              @click="addCustomStat"
            >
              + Add Custom Stat
            </button>
          </div>

        </template>
      </div>
    </template>

    <!-- Gemstones Tab -->
    <template v-else-if="activeTab === 'gemstones' && !hideGemstones">
      <div class="p-3 bg-[#1a1a1a] border border-[#333] rounded space-y-3">
        <p class="text-xs text-[#AA00AA] flex items-center gap-2">
          <span class="text-lg">✧</span>
          <span>Gemstone Slots</span>
        </p>

        <p class="text-[10px] text-[#666]">
          Add gemstone slots to your item. The bracket color indicates the gem rarity.
        </p>

        <!-- Gemstone slots list -->
        <div class="space-y-2">
          <div
            v-for="(slot, index) in localGemstones"
            :key="index"
            class="flex items-center gap-2 p-2 bg-black/30 rounded"
          >
            <!-- Preview -->
            <span
              class="text-sm mc-font gemstone-slot"
              :style="{ color: getGemstoneRarity(slot.rarity)?.color || '#555555' }"
            >
              [<span class="gem-symbol">{{ getGemstoneType(slot.type)?.symbol }}</span>]
            </span>

            <!-- Type selector -->
            <select
              :value="slot.type"
              class="mc-select text-xs py-1 flex-1"
              @change="updateGemstoneType(index, ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="gem in GEMSTONE_TYPES"
                :key="gem.id"
                :value="gem.id"
              >
                {{ gem.symbol }} {{ gem.name }} ({{ gem.stat }})
              </option>
            </select>

            <!-- Rarity selector -->
            <select
              :value="slot.rarity"
              class="mc-select text-xs py-1 w-28"
              @change="updateGemstoneRarity(index, ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="rarity in GEMSTONE_RARITIES"
                :key="rarity.id"
                :value="rarity.id"
              >
                {{ rarity.name }}
              </option>
            </select>

            <!-- Remove button -->
            <button
              class="w-6 h-6 flex items-center justify-center text-[#FF5555] hover:text-[#FF7777] bg-[#2d2d2d] rounded"
              @click="removeGemstoneSlot(index)"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Add slot button -->
        <button
          class="w-full py-2 text-xs text-[#55FF55] hover:text-[#77FF77] bg-[#2d2d2d] hover:bg-[#353535] rounded transition-colors"
          @click="addGemstoneSlot"
        >
          + Add Gemstone Slot
        </button>

        <!-- Preview -->
        <div
          v-if="localGemstones.length > 0"
          class="p-2 bg-black/50 rounded"
        >
          <p class="text-[10px] text-[#666] mb-1">Preview:</p>
          <span class="mc-font text-sm">
            <template
              v-for="(slot, index) in localGemstones"
              :key="index"
            >
              <span class="gemstone-slot" :style="{ color: getGemstoneRarity(slot.rarity)?.color }">
                [<span class="gem-symbol">{{ getGemstoneType(slot.type)?.symbol }}</span>]
              </span>
              {{ ' ' }}
            </template>
          </span>
        </div>
      </div>
    </template>

    <!-- Abilities Tab -->
    <template v-else>
      <div class="p-3 bg-[#1a1a1a] border border-[#333] rounded space-y-3">
        <p class="text-xs text-[#FFAA00] flex items-center gap-2">
          <span class="text-lg">๑</span>
          <span>Item Abilities</span>
        </p>

        <p class="text-[10px] text-[#666]">
          Add abilities to your item. Use formatting codes in descriptions (e.g. §c for red).
        </p>

        <!-- Abilities list -->
        <div class="space-y-3">
          <div
            v-for="(ability, index) in localAbilities"
            :key="index"
            class="p-3 bg-black/30 rounded space-y-2"
          >
            <div class="flex items-center gap-2">
              <!-- Ability name -->
              <input
                :value="ability.name"
                type="text"
                class="mc-input text-xs py-1 flex-1"
                placeholder="Ability Name"
                @input="updateAbilityName(index, ($event.target as HTMLInputElement).value)"
              >

              <!-- Remove button -->
              <button
                class="w-6 h-6 flex items-center justify-center text-[#FF5555] hover:text-[#FF7777] bg-[#2d2d2d] rounded"
                @click="removeAbility(index)"
              >
                ✕
              </button>
            </div>

            <!-- Formatting toolbar -->
            <div class="flex flex-wrap gap-1 p-2 bg-[#2d2d2d] rounded-t border-b border-[#1a1a1a]">
              <button
                v-for="code in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']"
                :key="code"
                class="w-5 h-5 text-[10px] font-minecraft hover:scale-110 transition-transform"
                :style="{ color: MINECRAFT_COLORS[code] }"
                :title="`${MINECRAFT_COLOR_NAMES[code]} (§${code})`"
                @click="insertIntoAbility(index, `§${code}`)"
              >
                §
              </button>
              <div class="w-px h-5 bg-[#555555] mx-1" />
              <button
                class="px-2 h-5 text-[10px] font-minecraft font-bold bg-[#3d3d3d] hover:bg-[#4d4d4d]"
                title="Bold"
                @click="insertIntoAbility(index, '§l')"
              >
                B
              </button>
              <button
                class="px-2 h-5 text-[10px] font-minecraft italic bg-[#3d3d3d] hover:bg-[#4d4d4d]"
                title="Italic"
                @click="insertIntoAbility(index, '§o')"
              >
                I
              </button>
              <button
                class="px-2 h-5 text-[10px] font-minecraft bg-[#3d3d3d] hover:bg-[#4d4d4d]"
                title="Reset"
                @click="insertIntoAbility(index, '§r')"
              >
                R
              </button>
              <div class="w-px h-5 bg-[#555555] mx-1" />
              <button
                class="px-2 h-5 text-[10px] font-minecraft bg-[#3d3d3d] hover:bg-[#4d4d4d] text-[#FF5555]"
                title="Insert Symbol"
                @click="openSymbolPicker(index)"
              >
                ❤
              </button>
            </div>

            <!-- Ability description -->
            <textarea
              :ref="el => abilityTextareaRefs[index] = el as HTMLTextAreaElement"
              :value="ability.description"
              class="mc-input text-xs py-1 w-full min-h-[60px] resize-y rounded-t-none"
              placeholder="Ability description (use §c for colors)"
              @input="updateAbilityDescription(index, ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
        </div>

        <!-- Symbol Picker Modal -->
        <Teleport to="body">
          <div
            v-if="showSymbolPicker"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            @click.self="showSymbolPicker = false"
          >
            <div class="bg-[#1a1a1a] border-2 border-[#444] rounded-lg p-4 max-w-md">
              <h3 class="text-sm text-[#FFAA00] mb-3">Select Symbol</h3>
              <div class="grid grid-cols-10 gap-1">
                <button
                  v-for="symbol in SKYBLOCK_SYMBOLS"
                  :key="symbol"
                  class="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#333] rounded transition-colors"
                  @click="handleSymbolSelect(symbol)"
                >
                  {{ symbol }}
                </button>
              </div>
              <button
                class="mt-3 w-full py-2 text-xs text-[#888] hover:text-white bg-[#2d2d2d] hover:bg-[#353535] rounded"
                @click="showSymbolPicker = false"
              >
                Cancel
              </button>
            </div>
          </div>
        </Teleport>

        <!-- Add ability button -->
        <button
          class="w-full py-2 text-xs text-[#55FF55] hover:text-[#77FF77] bg-[#2d2d2d] hover:bg-[#353535] rounded transition-colors"
          @click="addAbility"
        >
          + Add Ability
        </button>
      </div>
    </template>

    <!-- Stats summary -->
    <div
      v-if="Object.keys(modelValue).length > 0"
      class="p-2 bg-black/30 border border-[#373737] rounded"
    >
      <p class="text-xs text-[#AAAAAA] mb-1">Active Stats:</p>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(value, key) in modelValue"
          :key="key"
          class="text-xs px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#333]"
        >
          <span :style="{ color: getStatInfo(key as string)?.color || '#AAAAAA' }">
            {{ getStatInfo(key as string)?.symbol }}
          </span>
          <span class="text-[#888]"> {{ getStatInfo(key as string)?.name }}: </span>
          <span :style="{ color: getStatInfo(key as string)?.color || '#FF5555' }">
            +{{ value }}{{ isPercentStat(key as string) ? '%' : '' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
