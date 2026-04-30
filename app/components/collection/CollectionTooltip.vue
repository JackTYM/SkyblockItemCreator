<script setup lang="ts">
import MinecraftText from '../item/MinecraftText.vue'

interface Props {
  tierNumber: number
  requirement: number
  rewards: string[]
  unlocked: boolean
  collectionName: string
}

const props = defineProps<Props>()

function formatNumber(num: number): string {
  return num.toLocaleString()
}
</script>

<template>
  <div class="mc-tooltip p-3 h-full">
    <!-- Tier header -->
    <p class="font-minecraft text-sm mc-text-shadow mb-1">
      <span class="text-[#FFFF55]">{{ collectionName }}</span>&nbsp;<span class="text-[#AAAAAA]">{{ tierNumber }}</span>
    </p>

    <!-- Requirement -->
    <p class="font-minecraft text-xs mb-2">
      <span class="text-[#AAAAAA]">Requires: </span>
      <span :class="unlocked ? 'text-[#55FF55]' : 'text-[#FFFF55]'">
        {{ formatNumber(requirement) }}
      </span>
    </p>

    <!-- Rewards -->
    <div class="space-y-0.5">
      <p class="font-minecraft text-xs text-[#AAAAAA]">Rewards:</p>
      <MinecraftText
        v-for="(reward, idx) in rewards"
        :key="idx"
        :text="reward"
        class="text-xs block"
      />
    </div>

    <!-- Status -->
    <div class="mt-2 pt-2 border-t border-[#28007d]">
      <p v-if="unlocked" class="font-minecraft text-xs text-[#55FF55]">
        ✔ UNLOCKED
      </p>
      <p v-else class="font-minecraft text-xs text-[#FF5555]">
        ✖ LOCKED
      </p>
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
