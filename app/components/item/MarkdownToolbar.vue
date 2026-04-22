<script setup lang="ts">
import { MINECRAFT_COLORS, MINECRAFT_COLOR_NAMES } from '~/types'

const emit = defineEmits<{
  insert: [text: string]
  wrap: [prefix: string, suffix: string]
  symbol: []
}>()

const showColorPicker = ref(false)

const formatButtons = [
  { label: 'B', title: 'Bold (§l)', prefix: '**', suffix: '**', style: 'font-bold' },
  { label: 'I', title: 'Italic (§o)', prefix: '*', suffix: '*', style: 'italic' },
  { label: 'U', title: 'Underline (§n)', prefix: '__', suffix: '__', style: 'underline' },
  { label: 'S', title: 'Strikethrough (§m)', prefix: '~~', suffix: '~~', style: 'line-through' },
  { label: 'K', title: 'Obfuscated (§k)', prefix: '§k', suffix: '§r', style: 'obfuscated-preview' },
]

function insertColor(code: string) {
  emit('insert', `§${code}`)
  showColorPicker.value = false
}

function wrapColor(code: string) {
  const colorName = MINECRAFT_COLOR_NAMES[code] ?? 'white'
  const formattedName = colorName.toLowerCase().replace(' ', '_')
  emit('wrap', `{${formattedName}}`, `{/${formattedName}}`)
  showColorPicker.value = false
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5 p-2 bg-[#1a1a1a] border-b border-[#333]">
    <!-- Format buttons -->
    <button
      v-for="btn in formatButtons"
      :key="btn.label"
      class="w-10 h-10 flex items-center justify-center text-base text-white bg-[#333] hover:bg-[#444] rounded border border-[#444] transition-colors"
      :class="btn.style"
      :title="btn.title"
      @click="emit('wrap', btn.prefix, btn.suffix)"
    >
      {{ btn.label }}
    </button>

    <div class="w-px h-8 bg-[#444] mx-1" />

    <!-- Color picker toggle -->
    <div class="relative">
      <button
        class="h-10 px-4 flex items-center gap-2 text-sm text-white bg-[#333] hover:bg-[#444] rounded border border-[#444] transition-colors"
        title="Colors"
        @click="showColorPicker = !showColorPicker"
      >
        <span class="w-4 h-4 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-sm" />
        <span>Color</span>
        <span class="text-xs text-[#888]">▼</span>
      </button>

      <!-- Color dropdown -->
      <Transition name="fade">
        <div
          v-if="showColorPicker"
          class="absolute top-full left-0 mt-1 p-3 bg-[#1a1a1a] border border-[#444] rounded z-10 grid grid-cols-8 gap-1.5 min-w-[280px]"
        >
          <button
            v-for="(color, code) in MINECRAFT_COLORS"
            :key="code"
            class="w-7 h-7 rounded hover:scale-110 transition-transform border border-black/50"
            :style="{ backgroundColor: color }"
            :title="`${MINECRAFT_COLOR_NAMES[code]} (§${code})`"
            @click="wrapColor(code)"
          />
        </div>
      </Transition>
    </div>

    <!-- Symbol picker -->
    <button
      class="h-10 px-4 flex items-center gap-2 text-sm text-white bg-[#333] hover:bg-[#444] rounded border border-[#444] transition-colors"
      title="Insert Symbol"
      @click="emit('symbol')"
    >
      <span class="text-[#FF5555] text-base">❤</span>
      <span>Symbol</span>
    </button>

    <div class="w-px h-8 bg-[#444] mx-1" />

    <!-- Quick insert codes -->
    <button
      class="h-10 px-4 flex items-center text-sm text-[#888] bg-[#333] hover:bg-[#444] rounded border border-[#444] transition-colors"
      title="Reset formatting"
      @click="emit('insert', '§r')"
    >
      §r
    </button>
  </div>

  <!-- Click outside to close color picker -->
  <div
    v-if="showColorPicker"
    class="fixed inset-0 z-[5]"
    @click="showColorPicker = false"
  />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.obfuscated-preview {
  background: linear-gradient(90deg, #666 0%, #888 50%, #666 100%);
  background-size: 200% 100%;
}
</style>
