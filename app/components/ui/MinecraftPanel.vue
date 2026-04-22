<script setup lang="ts">
interface Props {
  variant?: 'light' | 'dark' | 'inventory'
  title?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'light',
  padding: 'md',
})

const panelClasses = computed(() => {
  const base = 'relative'

  const variants = {
    light: 'bg-[#c6c6c6] shadow-[inset_-4px_-4px_0_0_#555555,inset_4px_4px_0_0_#ffffff]',
    dark: 'bg-[#1a1a1a] shadow-[inset_4px_4px_0_0_#0a0a0a,inset_-4px_-4px_0_0_#2d2d2d]',
    inventory: 'bg-[#8b8b8b] shadow-[inset_-4px_-4px_0_0_#373737,inset_4px_4px_0_0_#ffffff]',
  }

  const paddings = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  }

  return [base, variants[props.variant], paddings[props.padding]]
})
</script>

<template>
  <div :class="panelClasses">
    <div
      v-if="title"
      class="font-minecraft text-sm mb-3 mc-text-shadow"
      :class="variant === 'dark' ? 'text-white' : 'text-[#3f3f3f]'"
    >
      {{ title }}
    </div>
    <slot />
  </div>
</template>
