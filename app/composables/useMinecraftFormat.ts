import { MINECRAFT_COLORS } from '~/types'

export function useMinecraftFormat() {
  // Convert markdown-style syntax to Minecraft § codes
  function markdownToMinecraft(text: string): string {
    let result = text

    // Bold: **text** -> §ltext§r
    result = result.replace(/\*\*(.+?)\*\*/g, '§l$1§r')

    // Italic: *text* or _text_ -> §otext§r
    result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '§o$1§r')
    result = result.replace(/(?<!_)_([^_]+)_(?!_)/g, '§o$1§r')

    // Strikethrough: ~~text~~ -> §mtext§r
    result = result.replace(/~~(.+?)~~/g, '§m$1§r')

    // Underline: __text__ -> §ntext§r
    result = result.replace(/__(.+?)__/g, '§n$1§r')

    // Color codes: {red}text{/red} -> §ctext§r
    const colorMap: Record<string, string> = {
      'black': '0', 'dark_blue': '1', 'dark_green': '2', 'dark_aqua': '3',
      'dark_red': '4', 'dark_purple': '5', 'gold': '6', 'gray': '7',
      'dark_gray': '8', 'blue': '9', 'green': 'a', 'aqua': 'b',
      'red': 'c', 'light_purple': 'd', 'yellow': 'e', 'white': 'f',
    }

    for (const [name, code] of Object.entries(colorMap)) {
      const regex = new RegExp(`\\{${name}\\}(.+?)\\{\\/${name}\\}`, 'gi')
      result = result.replace(regex, `§${code}$1§r`)
    }

    return result
  }

  // Parse § codes into styled spans for rendering
  interface TextSegment {
    text: string
    color: string
    bold: boolean
    italic: boolean
    underline: boolean
    strikethrough: boolean
    obfuscated: boolean
  }

  function parseMinecraftText(text: string): TextSegment[] {
    const segments: TextSegment[] = []
    let currentSegment: TextSegment = {
      text: '',
      color: '#FFFFFF',
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      obfuscated: false,
    }

    let i = 0
    while (i < text.length) {
      if (text[i] === '§' && i + 1 < text.length) {
        // Save current segment if it has text
        if (currentSegment.text) {
          segments.push({ ...currentSegment })
          currentSegment.text = ''
        }

        const code = text[i + 1].toLowerCase()

        if (MINECRAFT_COLORS[code]) {
          // Color code - reset formatting
          currentSegment = {
            text: '',
            color: MINECRAFT_COLORS[code],
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            obfuscated: false,
          }
        } else {
          // Format code
          switch (code) {
            case 'l':
              currentSegment.bold = true
              break
            case 'o':
              currentSegment.italic = true
              break
            case 'n':
              currentSegment.underline = true
              break
            case 'm':
              currentSegment.strikethrough = true
              break
            case 'k':
              currentSegment.obfuscated = true
              break
            case 'r':
              // Reset all formatting
              currentSegment = {
                text: '',
                color: '#FFFFFF',
                bold: false,
                italic: false,
                underline: false,
                strikethrough: false,
                obfuscated: false,
              }
              break
          }
        }
        i += 2
      } else {
        currentSegment.text += text[i]
        i++
      }
    }

    // Add final segment
    if (currentSegment.text) {
      segments.push(currentSegment)
    }

    return segments
  }

  // Generate CSS style object from segment
  function segmentToStyle(segment: TextSegment): Record<string, string> {
    const style: Record<string, string> = {
      color: segment.color,
    }

    if (segment.bold) style.fontWeight = 'bold'
    if (segment.italic) style.fontStyle = 'italic'

    const decorations: string[] = []
    if (segment.underline) decorations.push('underline')
    if (segment.strikethrough) decorations.push('line-through')
    if (decorations.length) style.textDecoration = decorations.join(' ')

    return style
  }

  // Strip all formatting codes
  function stripFormatting(text: string): string {
    return text.replace(/§[0-9a-fk-or]/gi, '')
  }

  // Insert formatting code at cursor position
  function insertCode(text: string, position: number, code: string): { text: string; newPosition: number } {
    const before = text.slice(0, position)
    const after = text.slice(position)
    return {
      text: before + code + after,
      newPosition: position + code.length,
    }
  }

  // Wrap selected text with formatting
  function wrapWithFormat(
    text: string,
    start: number,
    end: number,
    formatCode: string
  ): { text: string; newStart: number; newEnd: number } {
    const before = text.slice(0, start)
    const selected = text.slice(start, end)
    const after = text.slice(end)

    const newText = `${before}§${formatCode}${selected}§r${after}`

    return {
      text: newText,
      newStart: start + 2,
      newEnd: end + 2,
    }
  }

  return {
    markdownToMinecraft,
    parseMinecraftText,
    segmentToStyle,
    stripFormatting,
    insertCode,
    wrapWithFormat,
  }
}
