<script setup lang="ts">
import { SKYBLOCK_STATS, GEMSTONE_TYPES, GEMSTONE_RARITIES, type GemstoneSlot } from '~/types'

interface Props {
  modelValue: Record<string, number>
  gemstoneSlots?: GemstoneSlot[]
}

const props = withDefaults(defineProps<Props>(), {
  gemstoneSlots: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, number>]
  'update:gemstoneSlots': [value: GemstoneSlot[]]
}>()

// Local gemstone slots state
const localGemstones = ref<GemstoneSlot[]>([...props.gemstoneSlots])

watch(() => props.gemstoneSlots, (newVal) => {
  localGemstones.value = [...newVal]
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
    stats: ['magic_find', 'pet_luck'],
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
    stats: ['bonus_pest_chance'],
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
const activeTab = ref<'stats' | 'gemstones'>('stats')
const activeStatCategory = ref<keyof typeof statCategories>('combat')

function updateStat(stat: string, value: string) {
  const numValue = parseInt(value) || 0
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
  return ['crit_chance', 'crit_damage', 'sea_creature_chance', 'trophy_fish_chance', 'bonus_pest_chance'].includes(stat)
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
        class="px-3 py-1.5 text-xs rounded transition-colors"
        :class="activeTab === 'gemstones' ? 'bg-[#3d7a37] text-white' : 'bg-[#2d2d2d] text-[#888] hover:bg-[#353535]'"
        @click="activeTab = 'gemstones'"
      >
        Gemstone Slots
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
                :value="getStatValue(stat)"
                class="mc-input text-xs py-1 w-full"
                :placeholder="isPercentStat(stat) ? '%' : ''"
                @input="updateStat(stat, ($event.target as HTMLInputElement).value)"
              >
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Gemstones Tab -->
    <template v-else>
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
