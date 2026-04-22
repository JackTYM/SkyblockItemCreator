import type { SkyblockItem, CraftingRecipe } from '~/types'

export function useExport() {
  // Export item preview as PNG
  async function exportAsPng(element: HTMLElement, filename: string = 'item'): Promise<void> {
    const { toPng } = await import('html-to-image')

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 1,
      backgroundColor: '#2b2b2b',
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

  // Generate Minecraft /give command
  function generateGiveCommand(item: SkyblockItem): string {
    const { stripFormatting } = useMinecraftFormat()

    // Base item ID (simplified - in reality would need proper item mapping)
    let itemId = 'minecraft:diamond_sword'

    // Build NBT components
    const components: string[] = []

    // Custom name with formatting
    if (item.name) {
      const jsonName = JSON.stringify({
        text: stripFormatting(item.name),
        italic: false,
      })
      components.push(`custom_name='${jsonName}'`)
    }

    // Lore lines
    if (item.lore && item.lore.length > 0) {
      const loreJson = item.lore.map(line => ({
        text: stripFormatting(line),
        italic: false,
      }))
      components.push(`lore='${JSON.stringify(loreJson)}'`)
    }

    // Enchantment glint for legendary+ items
    const highRarities = ['legendary', 'mythic', 'divine', 'special', 'very-special']
    if (highRarities.includes(item.rarity)) {
      components.push('enchantment_glint_override=true')
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
