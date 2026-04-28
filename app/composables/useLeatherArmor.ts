import { LEATHER_ARMOR_IDS, type LeatherArmorId } from '~/types'

const MC_ASSETS_BASE = 'https://assets.mcasset.cloud/26.1.2/assets/minecraft/textures/item'

// Cache for generated leather armor textures
const textureCache = new Map<string, string>()

// Get the overlay texture URL for a leather armor piece
function getOverlayUrl(id: LeatherArmorId): string {
  return `${MC_ASSETS_BASE}/${id}_overlay.png`
}

// Get the base texture URL for a leather armor piece
function getBaseUrl(id: LeatherArmorId): string {
  return `${MC_ASSETS_BASE}/${id}.png`
}

// Load an image as a promise
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

// Check if an item ID is leather armor
export function isLeatherArmor(id: string): boolean {
  return LEATHER_ARMOR_IDS.includes(id as LeatherArmorId)
}

// Render dyed leather armor using canvas
export async function renderDyedLeatherArmor(
  armorId: LeatherArmorId,
  dyeColor: string
): Promise<string> {
  // Check cache first
  const cacheKey = `${armorId}-${dyeColor}`
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!
  }

  const baseUrl = getBaseUrl(armorId)
  const overlayUrl = getOverlayUrl(armorId)

  // Load both textures
  const [baseImg, overlayImg] = await Promise.all([
    loadImage(baseUrl),
    loadImage(overlayUrl),
  ])

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = baseImg.width
  canvas.height = baseImg.height
  const ctx = canvas.getContext('2d')!

  // Step 1: Draw the base texture (colorable portion)
  ctx.drawImage(baseImg, 0, 0)

  // Step 2: Apply dye color using multiply blend mode
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = dyeColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Step 3: Restore original transparency
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(baseImg, 0, 0)

  // Step 4: Draw the overlay on top (brown parts stay brown)
  ctx.globalCompositeOperation = 'source-over'
  ctx.drawImage(overlayImg, 0, 0)

  // Convert to data URL and cache
  const dataUrl = canvas.toDataURL('image/png')
  textureCache.set(cacheKey, dataUrl)

  return dataUrl
}

// Composable for leather armor rendering
export function useLeatherArmor() {
  const isRendering = ref(false)
  const error = ref<string | null>(null)

  async function getDyedTexture(armorId: string, dyeColor: string): Promise<string | null> {
    if (!isLeatherArmor(armorId)) {
      return null
    }

    isRendering.value = true
    error.value = null

    try {
      const texture = await renderDyedLeatherArmor(armorId as LeatherArmorId, dyeColor)
      return texture
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to render leather armor'
      return null
    } finally {
      isRendering.value = false
    }
  }

  return {
    isRendering,
    error,
    getDyedTexture,
    isLeatherArmor,
  }
}
