import type { TextureItem, TextureSource } from '~/types'

// CDN URLs for textures
const MC_VERSION = '26.1.2'
const MC_ASSETS_CDN = 'https://assets.mcasset.cloud'
const MC_ASSETS_BASE = `${MC_ASSETS_CDN}/${MC_VERSION}/assets/minecraft/textures`
const MC_HEADS_CDN = 'https://mc-heads.net'
// GitHub API for file listing
const GITHUB_API_BASE = 'https://api.github.com/repos/InventivetalentDev/minecraft-assets/contents/assets/minecraft/textures'

// LocalStorage cache keys and TTL
const CACHE_KEY = 'mc-assets-cache'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// In-memory cache
let cachedItems: TextureItem[] | null = null
let fetchPromise: Promise<TextureItem[]> | null = null

// Convert filename to display name
function filenameToDisplayName(filename: string): string {
  return filename
    .replace('.png', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// Categorize items based on their name
function categorizeItem(name: string): string {
  const lowerName = name.toLowerCase()

  // Weapons
  if (lowerName.includes('sword') || lowerName.includes('bow') ||
      lowerName.includes('crossbow') || lowerName.includes('trident') ||
      lowerName.includes('mace')) return 'weapons'

  // Tools
  if (lowerName.includes('pickaxe') || lowerName.includes('axe') ||
      lowerName.includes('shovel') || lowerName.includes('hoe') ||
      lowerName.includes('fishing_rod') || lowerName.includes('shears') ||
      lowerName.includes('flint_and_steel') || lowerName.includes('brush') ||
      lowerName.includes('spyglass')) return 'tools'

  // Armor
  if (lowerName.includes('helmet') || lowerName.includes('chestplate') ||
      lowerName.includes('leggings') || lowerName.includes('boots') ||
      lowerName.includes('_cap') || lowerName.includes('turtle_shell') ||
      lowerName.includes('elytra') || lowerName.includes('shield')) return 'armor'

  // Food
  if (['apple', 'golden_apple', 'enchanted_golden_apple', 'beef', 'cooked_beef',
       'porkchop', 'cooked_porkchop', 'chicken', 'cooked_chicken', 'cod', 'cooked_cod',
       'salmon', 'cooked_salmon', 'bread', 'carrot', 'golden_carrot', 'potato',
       'baked_potato', 'melon_slice', 'mushroom_stew', 'beetroot', 'beetroot_soup',
       'rabbit', 'cooked_rabbit', 'rabbit_stew', 'mutton', 'cooked_mutton',
       'sweet_berries', 'glow_berries', 'chorus_fruit', 'cookie', 'pumpkin_pie',
       'cake', 'honey_bottle', 'dried_kelp', 'tropical_fish', 'pufferfish',
       'suspicious_stew', 'rotten_flesh', 'spider_eye'].some(f => lowerName === f)) return 'food'

  // Spawn eggs
  if (lowerName.includes('spawn_egg')) return 'spawn_eggs'

  // Dyes
  if (lowerName.includes('_dye') || lowerName === 'ink_sac' ||
      lowerName === 'bone_meal' || lowerName === 'cocoa_beans' ||
      lowerName === 'lapis_lazuli') return 'dyes'

  // Potions & brewing
  if (lowerName.includes('potion') || lowerName.includes('bottle') ||
      lowerName === 'brewing_stand' || lowerName === 'cauldron' ||
      lowerName === 'dragon_breath' || lowerName === 'blaze_powder' ||
      lowerName === 'blaze_rod' || lowerName === 'ghast_tear' ||
      lowerName === 'magma_cream' || lowerName === 'nether_wart' ||
      lowerName === 'fermented_spider_eye' || lowerName === 'glistering_melon_slice' ||
      lowerName === 'rabbit_foot' || lowerName === 'phantom_membrane') return 'potions'

  // Materials & resources
  if (['diamond', 'iron_ingot', 'gold_ingot', 'copper_ingot', 'netherite_ingot',
       'coal', 'charcoal', 'redstone', 'emerald', 'quartz', 'amethyst_shard',
       'string', 'gunpowder', 'stick', 'flint', 'leather', 'feather', 'bone',
       'glowstone_dust', 'ender_pearl', 'eye_of_ender', 'nether_star',
       'prismarine_shard', 'prismarine_crystals', 'slime_ball', 'clay_ball',
       'brick', 'nether_brick', 'paper', 'sugar', 'wheat', 'iron_nugget',
       'gold_nugget', 'raw_iron', 'raw_gold', 'raw_copper', 'netherite_scrap',
       'ancient_debris', 'echo_shard', 'disc_fragment', 'armadillo_scute',
       'nautilus_shell', 'heart_of_the_sea', 'shulker_shell', 'honeycomb',
       'scute'].some(m => lowerName === m)) return 'materials'

  // Heads/skulls
  if (lowerName.includes('head') || lowerName.includes('skull')) return 'heads'

  // Music discs
  if (lowerName.includes('music_disc')) return 'music_discs'

  // Pottery sherds
  if (lowerName.includes('pottery_sherd')) return 'pottery'

  // Smithing templates
  if (lowerName.includes('smithing_template')) return 'templates'

  // Banners & patterns
  if (lowerName.includes('banner_pattern')) return 'patterns'

  // Boats
  if (lowerName.includes('boat') || lowerName.includes('raft')) return 'transportation'

  // Minecarts
  if (lowerName.includes('minecart')) return 'transportation'

  // Buckets
  if (lowerName.includes('bucket')) return 'buckets'

  // Books
  if (lowerName.includes('book')) return 'books'

  // Doors & signs
  if (lowerName.includes('door') || lowerName.includes('sign')) return 'blocks'

  // Seeds
  if (lowerName.includes('seeds')) return 'farming'

  // Candles
  if (lowerName.includes('candle')) return 'decoration'

  // Trim materials
  if (lowerName.includes('trim')) return 'templates'

  // Default
  return 'misc'
}

// Files to exclude (animations, overlays, etc.)
const EXCLUDED_PATTERNS = [
  '_overlay',
  '_pulling_',
  '_standby',
  '_throwing',
  '_blocking',
  '_cast',
  '_tip',
  '_base',
  '_filled',
  '_empty',
  'broken_',
  '_list.json',
]

// Build texture items from file lists
function buildTextureItems(itemIds: string[], blockIds: string[]): TextureItem[] {
  const processFiles = (files: string[], type: 'item' | 'block') => {
    return files
      .filter(id => !EXCLUDED_PATTERNS.some(p => id.includes(p)))
      .map(id => ({
        id,
        name: filenameToDisplayName(id + '.png'),
        texture: `${MC_ASSETS_BASE}/${type}/${id}.png`,
        source: 'vanilla' as TextureSource,
        category: type === 'block' ? 'blocks' : categorizeItem(id),
      }))
  }

  const items = processFiles(itemIds, 'item')
  const blocks = processFiles(blockIds, 'block')

  return [...items, ...blocks].sort((a, b) => a.name.localeCompare(b.name))
}

export function useTextures() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const items = ref<TextureItem[]>([])

  // Fetch texture list from GitHub
  async function fetchTextureList(type: 'item' | 'block'): Promise<string[]> {
    const response = await fetch(`${GITHUB_API_BASE}/${type}?ref=${MC_VERSION}`)
    if (!response.ok) return []

    const files: { name: string }[] = await response.json()
    return files
      .filter(f => f.name.endsWith('.png'))
      .map(f => f.name.replace('.png', ''))
  }

  // Fetch all items and blocks (with localStorage caching)
  async function fetchItems(): Promise<TextureItem[]> {
    if (cachedItems) return cachedItems

    if (fetchPromise) return fetchPromise

    fetchPromise = (async () => {
      // Check localStorage cache first
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          try {
            const { version, items, blocks, timestamp } = JSON.parse(cached)
            if (version === MC_VERSION && Date.now() - timestamp < CACHE_TTL && items.length > 0 && blocks.length > 0) {
              const textureItems = buildTextureItems(items, blocks)
              cachedItems = textureItems
              return textureItems
            }
          }
          catch {}
        }
      }

      // Fetch from GitHub API
      const [itemIds, blockIds] = await Promise.all([
        fetchTextureList('item'),
        fetchTextureList('block'),
      ])

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          version: MC_VERSION,
          items: itemIds,
          blocks: blockIds,
          timestamp: Date.now(),
        }))
      }

      const textureItems = buildTextureItems(itemIds, blockIds)
      cachedItems = textureItems
      return textureItems
    })().catch(err => {
      console.error('Failed to fetch Minecraft items:', err)
      cachedItems = []
      return []
    })

    return fetchPromise
  }

  // Initialize items on first use
  async function initItems() {
    if (items.value.length > 0) return

    loading.value = true
    error.value = null

    try {
      items.value = await fetchItems()
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load items'
    }
    finally {
      loading.value = false
    }
  }

  // Get texture URL based on source
  function getTextureUrl(id: string, source: TextureSource): string {
    switch (source) {
      case 'vanilla':
        return `${MC_ASSETS_BASE}/item/${id}.png`
      case 'heads':
        return `${MC_HEADS_CDN}/head/${id}/64`
      case 'custom':
        return id // Custom URLs are passed directly
      default:
        return `${MC_ASSETS_BASE}/item/${id}.png`
    }
  }

  // Get head texture URL
  function getHeadUrl(username: string, _orientation: 'front' | 'side' = 'front'): string {
    return `${MC_HEADS_CDN}/head/${username}/64`
  }

  // Get avatar (2D face) URL
  function getAvatarUrl(username: string): string {
    return `${MC_HEADS_CDN}/avatar/${username}/64`
  }

  // Search items
  function searchVanillaItems(query: string, category?: string): TextureItem[] {
    const lowerQuery = query.toLowerCase()
    return items.value.filter(item => {
      const matchesQuery = !query || item.name.toLowerCase().includes(lowerQuery)
      const matchesCategory = !category || category === 'all' || item.category === category
      return matchesQuery && matchesCategory
    })
  }

  // Get all categories
  function getCategories(): string[] {
    const categories = new Set<string>()
    items.value.forEach(item => categories.add(item.category))
    return ['all', ...Array.from(categories).sort()]
  }

  // Validate if an image URL is accessible
  async function validateImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      // Add cache-busting to prevent stale validation results
      const cacheBuster = `${url.includes('?') ? '&' : '?'}_cb=${Date.now()}`
      img.src = url + cacheBuster
    })
  }

  return {
    loading,
    error,
    items,
    initItems,
    getTextureUrl,
    getHeadUrl,
    getAvatarUrl,
    searchVanillaItems,
    getCategories,
    validateImageUrl,
  }
}
