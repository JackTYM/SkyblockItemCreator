<script setup lang="ts">
import MinecraftText from '../item/MinecraftText.vue'

interface Props {
  tierNumber: number
  requirement: number
  currentAmount: number
  rewards: string[]
  unlocked: boolean
  collectionName: string
}

const props = defineProps<Props>()

function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ]
  let result = ''
  for (const [value, symbol] of romanNumerals) {
    while (num >= value) {
      result += symbol
      num -= value
    }
  }
  return result
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toLocaleString()
}

const progressPercent = computed(() => {
  if (props.unlocked) return 100
  const percent = Math.min(100, Math.floor((props.currentAmount / props.requirement) * 100))
  return percent
})

const progressBarLength = 25
const filledDashes = computed(() => Math.floor((progressPercent.value / 100) * progressBarLength))
const emptyDashes = computed(() => progressBarLength - filledDashes.value)

const displayCurrent = computed(() => {
  return props.currentAmount.toLocaleString()
})

const displayRequired = computed(() => formatNumber(props.requirement))
</script>

<template>
  <div class="mc-tooltip p-3 h-full w-full">
    <!-- Tier header -->
    <p class="font-minecraft text-sm mc-text-shadow mb-3">
      <span class="text-[#55FF55]">{{ collectionName }} {{ toRoman(tierNumber) }}</span>
    </p>

    <!-- Progress -->
    <p class="font-minecraft text-xs mb-1">
      <span class="text-[#AAAAAA]">Progress: </span>
      <span class="text-[#55FF55]">{{ progressPercent }}%</span>
    </p>

    <!-- Progress bar -->
    <p class="font-minecraft text-xs mb-3">
      <span class="text-[#00AA00]">{{ '-'.repeat(filledDashes) }}</span><span class="text-[#555555]">{{ '-'.repeat(emptyDashes) }}</span>&nbsp;<span class="text-[#FFFF55]">{{ displayCurrent }}/{{ displayRequired }}</span>
    </p>

    <!-- Rewards -->
    <div class="space-y-0.5">
      <p class="font-minecraft text-xs text-[#AAAAAA]">Rewards:</p>
      <div class="pl-2">
        <MinecraftText
          v-for="(reward, idx) in rewards"
          :key="idx"
          :text="reward"
          class="text-xs block"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mc-tooltip {
  background: #100010;
  border: 2px solid #28007d;
  box-shadow:
    inset 0 0 0 1px #28007d,
    0 0 0 1px #100010,
    4px 4px 0 rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.mc-text-shadow {
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}
</style>
