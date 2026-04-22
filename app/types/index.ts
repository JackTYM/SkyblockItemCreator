// Minecraft color codes mapping
export const MINECRAFT_COLORS: Record<string, string> = {
  '0': '#000000', // Black
  '1': '#0000AA', // Dark Blue
  '2': '#00AA00', // Dark Green
  '3': '#00AAAA', // Dark Aqua
  '4': '#AA0000', // Dark Red
  '5': '#AA00AA', // Dark Purple
  '6': '#FFAA00', // Gold
  '7': '#AAAAAA', // Gray
  '8': '#555555', // Dark Gray
  '9': '#5555FF', // Blue
  'a': '#55FF55', // Green
  'b': '#55FFFF', // Aqua
  'c': '#FF5555', // Red
  'd': '#FF55FF', // Light Purple
  'e': '#FFFF55', // Yellow
  'f': '#FFFFFF', // White
}

export const MINECRAFT_COLOR_NAMES: Record<string, string> = {
  '0': 'Black',
  '1': 'Dark Blue',
  '2': 'Dark Green',
  '3': 'Dark Aqua',
  '4': 'Dark Red',
  '5': 'Dark Purple',
  '6': 'Gold',
  '7': 'Gray',
  '8': 'Dark Gray',
  '9': 'Blue',
  'a': 'Green',
  'b': 'Aqua',
  'c': 'Red',
  'd': 'Light Purple',
  'e': 'Yellow',
  'f': 'White',
}

export const MINECRAFT_FORMATS: Record<string, string> = {
  'l': 'Bold',
  'o': 'Italic',
  'n': 'Underline',
  'm': 'Strikethrough',
  'k': 'Obfuscated',
  'r': 'Reset',
}

// Skyblock rarity definitions
export interface Rarity {
  name: string
  displayName: string
  color: string
  code: string
  bgClass: string
}

export const RARITIES: Rarity[] = [
  { name: 'common', displayName: 'COMMON', color: '#FFFFFF', code: 'f', bgClass: 'bg-white/20' },
  { name: 'uncommon', displayName: 'UNCOMMON', color: '#55FF55', code: 'a', bgClass: 'bg-green-500/20' },
  { name: 'rare', displayName: 'RARE', color: '#5555FF', code: '9', bgClass: 'bg-blue-500/20' },
  { name: 'epic', displayName: 'EPIC', color: '#AA00AA', code: '5', bgClass: 'bg-purple-600/20' },
  { name: 'legendary', displayName: 'LEGENDARY', color: '#FFAA00', code: '6', bgClass: 'bg-amber-500/20' },
  { name: 'mythic', displayName: 'MYTHIC', color: '#FF55FF', code: 'd', bgClass: 'bg-pink-500/20' },
  { name: 'divine', displayName: 'DIVINE', color: '#55FFFF', code: 'b', bgClass: 'bg-cyan-400/20' },
  { name: 'special', displayName: 'SPECIAL', color: '#FF5555', code: 'c', bgClass: 'bg-red-500/20' },
  { name: 'very-special', displayName: 'VERY SPECIAL', color: '#AA0000', code: '4', bgClass: 'bg-red-900/20' },
]

// Skyblock stat symbols
export interface SkyblockStat {
  symbol: string
  name: string
  stat: string
  color: string
}

export const SKYBLOCK_STATS: SkyblockStat[] = [
  // Combat Stats - Red
  { symbol: '♥', name: 'Health', stat: 'health', color: '#FF5555' },
  { symbol: '❁', name: 'Damage', stat: 'damage', color: '#FF5555' },
  { symbol: '❁', name: 'Strength', stat: 'strength', color: '#FF5555' },
  { symbol: '⫽', name: 'Ferocity', stat: 'ferocity', color: '#FF5555' },
  { symbol: '๑', name: 'Ability Damage', stat: 'ability_damage', color: '#FF5555' },
  { symbol: '♨', name: 'Vitality', stat: 'vitality', color: '#FF5555' },
  { symbol: '❣', name: 'Health Regen', stat: 'health_regen', color: '#FF5555' },

  // Crit Stats - Blue
  { symbol: '☣', name: 'Crit Chance', stat: 'crit_chance', color: '#5555FF' },
  { symbol: '☠', name: 'Crit Damage', stat: 'crit_damage', color: '#5555FF' },

  // Defense - Green
  { symbol: '❈', name: 'Defense', stat: 'defense', color: '#55FF55' },
  { symbol: '☄', name: 'Mending', stat: 'mending', color: '#55FF55' },

  // White Stats
  { symbol: '❂', name: 'True Defense', stat: 'true_defense', color: '#FFFFFF' },
  { symbol: '✦', name: 'Speed', stat: 'speed', color: '#FFFFFF' },

  // Intelligence - Aqua/Light Blue
  { symbol: '✎', name: 'Intelligence', stat: 'intelligence', color: '#55FFFF' },

  // Yellow Stats
  { symbol: '⚔', name: 'Attack Speed', stat: 'attack_speed', color: '#FFFF55' },
  { symbol: 'Ⓢ', name: 'Swing Range', stat: 'swing_range', color: '#FFFF55' },

  // Luck Stats - Light Purple / Aqua
  { symbol: '☘', name: 'Pet Luck', stat: 'pet_luck', color: '#FF55FF' },
  { symbol: '✯', name: 'Magic Find', stat: 'magic_find', color: '#55FFFF' },

  // Fortune Stats - Gold
  { symbol: '☘', name: 'Mining Fortune', stat: 'mining_fortune', color: '#FFAA00' },
  { symbol: '☘', name: 'Farming Fortune', stat: 'farming_fortune', color: '#FFAA00' },
  { symbol: '☘', name: 'Foraging Fortune', stat: 'foraging_fortune', color: '#FFAA00' },
  { symbol: '☘', name: 'Hunting Fortune', stat: 'hunting_fortune', color: '#FFAA00' },
  { symbol: '☘', name: 'Fishing Fortune', stat: 'fishing_fortune', color: '#FFAA00' },

  // Mining Stats - Gold
  { symbol: '⸕', name: 'Mining Speed', stat: 'mining_speed', color: '#FFAA00' },
  { symbol: '✧', name: 'Pristine', stat: 'pristine', color: '#AA00AA' },
  { symbol: '⸕', name: 'Breaking Power', stat: 'breaking_power', color: '#00AA00' },

  // Farming Stats
  { symbol: 'Ⓟ', name: 'Bonus Pest Chance', stat: 'bonus_pest_chance', color: '#00AA00' },

  // Fishing Stats
  { symbol: '☂', name: 'Fishing Speed', stat: 'fishing_speed', color: '#55FFFF' },
  { symbol: 'α', name: 'Sea Creature Chance', stat: 'sea_creature_chance', color: '#00AA00' },
  { symbol: '⚓', name: 'Double Hook', stat: 'double_hook', color: '#55FFFF' },
  { symbol: '✧', name: 'Trophy Fish Chance', stat: 'trophy_fish_chance', color: '#FFAA00' },

  // Wisdom Stats - Aqua
  { symbol: 'ℰ', name: 'Combat Wisdom', stat: 'combat_wisdom', color: '#55FFFF' },
  { symbol: 'ℰ', name: 'Mining Wisdom', stat: 'mining_wisdom', color: '#55FFFF' },
  { symbol: 'ℰ', name: 'Farming Wisdom', stat: 'farming_wisdom', color: '#55FFFF' },
  { symbol: 'ℰ', name: 'Foraging Wisdom', stat: 'foraging_wisdom', color: '#55FFFF' },
  { symbol: 'ℰ', name: 'Fishing Wisdom', stat: 'fishing_wisdom', color: '#55FFFF' },
  { symbol: '⚗', name: 'Alchemy Wisdom', stat: 'alchemy_wisdom', color: '#55FFFF' },
  { symbol: 'ℰ', name: 'Enchanting Wisdom', stat: 'enchanting_wisdom', color: '#55FFFF' },
  { symbol: 'ℰ', name: 'Carpentry Wisdom', stat: 'carpentry_wisdom', color: '#55FFFF' },
  { symbol: 'ℰ', name: 'Runecrafting Wisdom', stat: 'runecrafting_wisdom', color: '#55FFFF' },
  { symbol: 'ℰ', name: 'Social Wisdom', stat: 'social_wisdom', color: '#55FFFF' },


  // Rift Stats
  { symbol: '♥', name: 'Rift Health', stat: 'rift_health', color: '#55FF55' },
  { symbol: '⏣', name: 'Rift Time', stat: 'rift_time', color: '#AA00AA' },
  { symbol: '☠', name: 'Rift Damage', stat: 'rift_damage', color: '#AA00AA' },

  // Other
  { symbol: '⚔', name: 'Bonus Attack Speed', stat: 'bonus_attack_speed', color: '#FFFF55' },
  { symbol: '❈', name: 'Bonus Defense', stat: 'bonus_defense', color: '#55FF55' },
]

// Additional Skyblock symbols for the picker
export const SKYBLOCK_SYMBOLS: string[] = [
  // Main stats
  '♥', '❁', '☣', '☠', '❈', '❂', '✎', '✦', '⚔', '⫽', '๑', '♨', '☄', 'Ⓢ',
  // Luck & Fortune
  '☘', '✯', '⸕', '✧', 'Ⓟ', 'ℰ',
  // Fishing
  '☂', 'α', '⚓', '❣', '⚗',
  // Decorative
  '✿', '❃', '❆', '❉', '✵', '✶', '✸', '❋', '✾', '❀', '❇', '❊', '※',
  '⚡', '☀', '☁', '☾', '★', '☆', '⬟', '⬢', '◆', '◇', '○', '●', '□', '■',
  '△', '▲', '▽', '▼', '◁', '◀', '▷', '▶', '♦', '♣', '♠', '♥',
]

// Item types
export type ItemCategory = 'weapon' | 'armor' | 'accessory' | 'tool' | 'consumable' | 'material' | 'block' | 'misc'

export interface SkyblockItem {
  name: string
  rarity: string
  category: ItemCategory
  texture: string
  lore: string[]
  stats: Record<string, number>
  enchantments?: string[]
  reforge?: string
  ability?: {
    name: string
    description: string
    manaCost?: number
    cooldown?: number
  }
}

export interface CraftingSlot {
  texture: string | null
  name: string | null
  count: number
}

export interface CraftingRecipe {
  type: 'vanilla' | 'skyblock'
  grid: CraftingSlot[][]
  result: CraftingSlot
}

// Texture sources
export type TextureSource = 'vanilla' | 'furfsky' | 'heads' | 'custom'

export interface TextureItem {
  id: string
  name: string
  texture: string
  source: TextureSource
  category?: string
}

// Gemstone system
export interface GemstoneType {
  id: string
  name: string
  symbol: string
  stat: string
  color: string // Base stat color
}

export const GEMSTONE_TYPES: GemstoneType[] = [
  { id: 'ruby', name: 'Ruby', symbol: '♥', stat: 'Health', color: '#FF5555' },
  { id: 'amethyst', name: 'Amethyst', symbol: '❈', stat: 'Defense', color: '#55FF55' },
  { id: 'jasper', name: 'Jasper', symbol: '❁', stat: 'Strength', color: '#FF5555' },
  { id: 'sapphire', name: 'Sapphire', symbol: '✎', stat: 'Intelligence', color: '#55FFFF' },
  { id: 'amber', name: 'Amber', symbol: '⸕', stat: 'Mining Speed', color: '#FFAA00' },
  { id: 'topaz', name: 'Topaz', symbol: '✧', stat: 'Pristine', color: '#FFFF55' },
  { id: 'jade', name: 'Jade', symbol: '☘', stat: 'Mining Fortune', color: '#55FF55' },
  { id: 'opal', name: 'Opal', symbol: '❂', stat: 'True Defense', color: '#FFFFFF' },
  { id: 'aquamarine', name: 'Aquamarine', symbol: '☂', stat: 'Fishing Speed', color: '#55FFFF' },
  { id: 'citrine', name: 'Citrine', symbol: '⚔', stat: 'Attack Speed', color: '#FFFF55' },
  { id: 'onyx', name: 'Onyx', symbol: '☠', stat: 'Crit Damage', color: '#5555FF' },
  { id: 'peridot', name: 'Peridot', symbol: '☘', stat: 'Farming Fortune', color: '#55FF55' },
]

export interface GemstoneRarity {
  id: string
  name: string
  color: string
  code: string // Minecraft color code
}

export const GEMSTONE_RARITIES: GemstoneRarity[] = [
  { id: 'empty', name: 'Empty', color: '#555555', code: '8' },
  { id: 'rough', name: 'Rough', color: '#555555', code: '8' },
  { id: 'flawed', name: 'Flawed', color: '#AAAAAA', code: '7' },
  { id: 'fine', name: 'Fine', color: '#5555FF', code: '9' },
  { id: 'flawless', name: 'Flawless', color: '#55FF55', code: 'a' },
  { id: 'perfect', name: 'Perfect', color: '#FF5555', code: 'c' },
]

export interface GemstoneSlot {
  type: string // gemstone type id
  rarity: string // gemstone rarity id (empty if no gem placed)
}

// Item abilities
export interface ItemAbility {
  name: string
  description: string // Can contain newlines and formatting codes
}
