<script setup lang="ts">
interface Props {
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const classes = computed(() => {
  const base = 'font-minecraft relative inline-flex items-center justify-center gap-1.5 leading-none transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variants = {
    default: 'bg-[#555555] text-white hover:bg-[#6a6a6a] shadow-[inset_-3px_-3px_0_0_#2d2d2d,inset_3px_3px_0_0_#7a7a7a] active:shadow-[inset_3px_3px_0_0_#2d2d2d,inset_-3px_-3px_0_0_#7a7a7a]',
    primary: 'bg-[#2d5a27] text-white hover:bg-[#3d7a37] shadow-[inset_-3px_-3px_0_0_#1a3a17,inset_3px_3px_0_0_#3d7a37] active:shadow-[inset_3px_3px_0_0_#1a3a17,inset_-3px_-3px_0_0_#3d7a37]',
    danger: 'bg-[#8b2222] text-white hover:bg-[#a52a2a] shadow-[inset_-3px_-3px_0_0_#5a1515,inset_3px_3px_0_0_#a52a2a] active:shadow-[inset_3px_3px_0_0_#5a1515,inset_-3px_-3px_0_0_#a52a2a]',
    ghost: 'bg-transparent text-white hover:bg-white/10 shadow-none',
  }

  return [base, sizes[props.size], variants[props.variant]]
})

function handleClick(e: MouseEvent) {
  if (!props.disabled) {
    emit('click', e)
  }
}
</script>

<template>
  <button
    :class="classes"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
