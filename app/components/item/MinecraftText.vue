<script setup lang="ts">
interface Props {
  text: string
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shadow: true,
})

const { parseMinecraftText, segmentToStyle } = useMinecraftFormat()

const segments = computed(() => parseMinecraftText(props.text))

// Obfuscated text characters pool
const obfuscatedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'.split('')

// Reactive obfuscated text state
const obfuscatedTexts = ref<Record<number, string>>({})
let animationFrame: number | null = null

function getRandomChar() {
  return obfuscatedChars[Math.floor(Math.random() * obfuscatedChars.length)]
}

function generateObfuscatedText(length: number): string {
  return Array(length).fill(0).map(() => getRandomChar()).join('')
}

function updateObfuscatedTexts() {
  segments.value.forEach((segment, index) => {
    if (segment.obfuscated && segment.text) {
      obfuscatedTexts.value[index] = generateObfuscatedText(segment.text.length)
    }
  })
  animationFrame = requestAnimationFrame(updateObfuscatedTexts)
}

// Start/stop animation based on whether there are obfuscated segments
watch(
  () => segments.value.some(s => s.obfuscated),
  (hasObfuscated) => {
    if (hasObfuscated) {
      updateObfuscatedTexts()
    } else if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})

function getDisplayText(segment: { text: string; obfuscated: boolean }, index: number): string {
  if (segment.obfuscated) {
    return obfuscatedTexts.value[index] || segment.text
  }
  return segment.text
}
</script>

<template>
  <span class="mc-font whitespace-pre-wrap">
    <span
      v-for="(segment, index) in segments"
      :key="index"
      :style="segmentToStyle(segment)"
      :class="[shadow && 'mc-text-shadow']"
    >{{ getDisplayText(segment, index) }}</span>
  </span>
</template>

<style scoped>
.mc-text-shadow {
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.4);
}
</style>
