<script setup lang="ts">
import MinecraftText from '../item/MinecraftText.vue'

interface Target {
  name: string
  progress: number
  requirement: number
}

interface Props {
  milestoneNumber: number
  targets: Target[]
  rewards: string[]
  claimed: boolean
}

const props = withDefaults(defineProps<Props>(), {
  claimed: false,
})

// Convert number to roman numeral
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

const titleText = computed(() => {
  return `§6Milestone ${toRoman(props.milestoneNumber)} Rewards`
})

function getProgressPercent(target: Target): number {
  if (target.requirement === 0) return 100
  return Math.min(100, (target.progress / target.requirement) * 100)
}

function formatProgressPercent(target: Target): string {
  const percent = getProgressPercent(target)
  if (percent >= 100) return '100%'
  return `${percent.toFixed(1)}%`
}

function formatNumber(num: number): string {
  return num.toLocaleString()
}
</script>

<template>
  <div class="mc-tooltip p-3 h-full">
    <!-- Title -->
    <MinecraftText
      :text="titleText"
      class="text-sm block mb-1"
    />

    <!-- Targets -->
    <template v-for="(target, tIndex) in targets" :key="'target-' + tIndex">
      <!-- Target name and progress -->
      <div class="flex items-center gap-1">
        <MinecraftText
          :text="`§b${target.name} §fProgress: §f${formatProgressPercent(target)}`"
          class="text-xs"
        />
      </div>

      <!-- Progress bar -->
      <div class="flex items-center gap-2 my-1">
        <div class="progress-bar flex-1 h-2 bg-[#373737] relative">
          <div
            class="progress-fill h-full bg-[#55FF55]"
            :style="{ width: `${getProgressPercent(target)}%` }"
          />
        </div>
        <MinecraftText
          :text="`§e${formatNumber(target.progress)}/${formatNumber(target.requirement)}`"
          class="text-xs"
        />
      </div>
    </template>

    <div class="h-1" />

    <!-- Rewards section -->
    <MinecraftText
      text="§7Rewards:"
      class="text-xs block"
    />
    <template v-for="(reward, rIndex) in rewards" :key="'reward-' + rIndex">
      <MinecraftText
        :text="reward.startsWith('§') ? `  ${reward}` : `  §7${reward}`"
        class="text-xs block"
      />
    </template>

    <!-- Claimed status -->
    <template v-if="claimed">
      <div class="h-1.5" />
      <MinecraftText
        text="§a§lCLAIMED"
        class="text-xs block"
      />
    </template>
  </div>
</template>

<style scoped>
.mc-tooltip {
  background: #100010;
  border: 2px solid #28007d;
  box-shadow:
    inset 0 0 0 1px #28007d,
    0 0 0 1px #100010;
  white-space: nowrap;
}

.progress-bar {
  border: 1px solid #000;
}

.progress-fill {
  transition: width 0.3s ease;
}
</style>
