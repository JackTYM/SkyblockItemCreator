import type { SkyblockItem, CraftingRecipe } from '~/types'

export function useExport() {
  // Convert image to data URL to ensure we capture actual pixel data, not cached versions
  async function imageToDataUrl(src: string): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
          } else {
            resolve(null)
          }
        } catch {
          resolve(null)
        }
      }

      img.onerror = () => resolve(null)

      // Add cache buster to force fresh fetch
      const timestamp = Date.now()
      const url = new URL(src, window.location.href)
      url.searchParams.set('_export', timestamp.toString())
      img.src = url.toString()
    })
  }

  // Force reload all images in an element by converting to data URLs
  async function reloadImagesWithCacheBust(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img')

    const loadPromises = Array.from(images).map(async (img) => {
      if (!img.src || img.src.startsWith('data:')) {
        return
      }

      // Convert to data URL to capture actual pixel data
      const dataUrl = await imageToDataUrl(img.src)
      if (dataUrl) {
        img.src = dataUrl
      }
    })

    await Promise.all(loadPromises)
    // Small delay to ensure DOM updates
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  // Export item preview as PNG
  async function exportAsPng(element: HTMLElement, filename: string = 'item', backgroundColor: string = '#2b2b2b'): Promise<void> {
    const { toPng } = await import('html-to-image')

    // Force reload images with fresh cache-busting before export
    await reloadImagesWithCacheBust(element)

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 1,
      backgroundColor,
      fetchRequestInit: {
        cache: 'no-cache',
      },
    })

    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = dataUrl
    link.click()
  }

  // Export item as JSON
  function exportAsJson(item: SkyblockItem, filename: string = 'item'): void {
    const json = JSON.stringify(item, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.download = `${filename}.json`
    link.href = url
    link.click()

    URL.revokeObjectURL(url)
  }

  // Map § codes to Minecraft JSON color names
  const codeToColor: Record<string, string> = {
    '0': 'black', '1': 'dark_blue', '2': 'dark_green', '3': 'dark_aqua',
    '4': 'dark_red', '5': 'dark_purple', '6': 'gold', '7': 'gray',
    '8': 'dark_gray', '9': 'blue', 'a': 'green', 'b': 'aqua',
    'c': 'red', 'd': 'light_purple', 'e': 'yellow', 'f': 'white',
  }

  // Convert text with § codes to Minecraft JSON text components
  function textToJsonComponents(text: string, defaultColor: string = 'white'): object[] {
    const components: object[] = []
    // Default to white color when no color code at start
    let currentComponent: Record<string, unknown> = { text: '', color: defaultColor, italic: false }

    let i = 0
    while (i < text.length) {
      if (text[i] === '§' && i + 1 < text.length) {
        // Save current component if it has text
        if (currentComponent.text) {
          components.push({ ...currentComponent })
          currentComponent = { text: '', color: defaultColor, italic: false }
        }

        const code = text[i + 1].toLowerCase()

        if (codeToColor[code]) {
          // Color code - apply color, reset formatting
          currentComponent = { text: '', color: codeToColor[code], italic: false }
        } else {
          // Format codes
          switch (code) {
            case 'l':
              currentComponent.bold = true
              break
            case 'o':
              currentComponent.italic = true
              break
            case 'n':
              currentComponent.underlined = true
              break
            case 'm':
              currentComponent.strikethrough = true
              break
            case 'k':
              currentComponent.obfuscated = true
              break
            case 'r':
              // Reset all formatting (back to default white)
              currentComponent = { text: '', color: defaultColor, italic: false }
              break
          }
        }
        i += 2
      } else {
        currentComponent.text = (currentComponent.text as string) + text[i]
        i++
      }
    }

    // Add final component
    if (currentComponent.text) {
      components.push(currentComponent)
    }

    // Return single component or array
    return components.length > 0 ? components : [{ text: '', color: defaultColor, italic: false }]
  }

  // Generate Minecraft /give command
  function generateGiveCommand(item: SkyblockItem & {
    isSkyblock?: boolean
    rarityColorCode?: string
    rarityDisplayName?: string
    textureSource?: string
    enchantGlint?: boolean
  }): string {
    // Try to determine item ID from texture URL for vanilla items
    let itemId = 'minecraft:paper' // Default fallback
    if (item.textureSource === 'vanilla' && item.texture) {
      // Extract item name from texture URL like ".../textures/item/diamond_sword.png"
      const match = item.texture.match(/textures\/(?:item|block)\/([^.]+)\.png/)
      if (match) {
        let extractedId = match[1]
        // Remove block state suffixes that aren't valid item IDs
        const invalidSuffixes = ['_bottom', '_top', '_side', '_front', '_back', '_on', '_off', '_lit', '_stage0', '_stage1', '_stage2', '_stage3', '_stage4', '_stage5', '_stage6', '_stage7']
        for (const suffix of invalidSuffixes) {
          if (extractedId.endsWith(suffix)) {
            extractedId = extractedId.slice(0, -suffix.length)
            break
          }
        }
        itemId = `minecraft:${extractedId}`
      }
    } else if (item.textureSource === 'heads') {
      itemId = 'minecraft:player_head'
    }

    // Build NBT components
    const components: string[] = []

    // Custom name with formatting and colors
    if (item.name) {
      // For Skyblock items, prepend the rarity color code
      let nameToFormat = item.name
      if (item.isSkyblock && item.rarityColorCode) {
        // Only add rarity color if name doesn't already have color codes
        const hasColorCodes = /§[0-9a-f]/i.test(item.name)
        if (!hasColorCodes) {
          nameToFormat = `§${item.rarityColorCode}§l${item.name}`
        }
      }
      const nameComponents = textToJsonComponents(nameToFormat)
      components.push(`minecraft:custom_name=${JSON.stringify(nameComponents)}`)
    }

    // Build lore lines
    const allLoreLines: object[][] = []

    // Add user lore lines with formatting and colors
    if (item.lore && item.lore.length > 0) {
      item.lore.forEach(line => {
        allLoreLines.push(textToJsonComponents(line))
      })
    }

    // For Skyblock items, add rarity line at the bottom
    if (item.isSkyblock && item.rarityColorCode && item.rarityDisplayName) {
      // Add empty line before rarity
      if (allLoreLines.length > 0) {
        allLoreLines.push([{ text: '', italic: false }])
      }
      // Add rarity + type line (e.g., "LEGENDARY SWORD")
      const typeText = item.type ? ` ${item.type.toUpperCase()}` : ''
      const rarityLine = `§${item.rarityColorCode}§l${item.rarityDisplayName}${typeText}`
      allLoreLines.push(textToJsonComponents(rarityLine))
    }

    if (allLoreLines.length > 0) {
      components.push(`minecraft:lore=${JSON.stringify(allLoreLines)}`)
    }

    // Hide default item tooltip (attack damage, attack speed, etc.)
    components.push('minecraft:hide_additional_tooltip={}')

    // Enchantment glint - use manual toggle or auto-enable for high rarities
    if (item.enchantGlint) {
      components.push('minecraft:enchantment_glint_override=true')
    }

    // Build final command
    const nbt = components.length > 0 ? `[${components.join(',')}]` : ''
    return `/give @p ${itemId}${nbt} 1`
  }

  // Copy text to clipboard
  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    }
  }

  // Generate share URL
  function generateShareUrl(item: SkyblockItem): string {
    const data = encodeURIComponent(JSON.stringify(item))
    return `${window.location.origin}${window.location.pathname}?item=${data}`
  }

  // Parse item from share URL
  function parseShareUrl(): SkyblockItem | null {
    const params = new URLSearchParams(window.location.search)
    const itemData = params.get('item')

    if (!itemData) return null

    try {
      return JSON.parse(decodeURIComponent(itemData)) as SkyblockItem
    } catch {
      return null
    }
  }

  // Export crafting recipe as image
  async function exportRecipeAsPng(element: HTMLElement, filename: string = 'recipe'): Promise<void> {
    await exportAsPng(element, filename)
  }

  // Export recipe as JSON
  function exportRecipeAsJson(recipe: CraftingRecipe, filename: string = 'recipe'): void {
    const json = JSON.stringify(recipe, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.download = `${filename}.json`
    link.href = url
    link.click()

    URL.revokeObjectURL(url)
  }

  return {
    exportAsPng,
    exportAsJson,
    generateGiveCommand,
    copyToClipboard,
    generateShareUrl,
    parseShareUrl,
    exportRecipeAsPng,
    exportRecipeAsJson,
  }
}
