<script setup lang="ts">
import { RARITIES } from '~/types'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedRarity = computed(() => {
  return RARITIES.find(r => r.name === props.modelValue) ?? RARITIES[0]
})
</script>

<template>
  <div class="relative">
    <label class="font-minecraft text-xs text-[#AAAAAA] mb-1 block">Rarity</label>
    <div class="relative">
      <select
        :value="modelValue"
        class="mc-select w-full"
        :style="{ color: selectedRarity.color }"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="rarity in RARITIES"
          :key="rarity.name"
          :value="rarity.name"
          :style="{ color: rarity.color }"
        >
          {{ rarity.displayName }}
        </option>
      </select>

      <!-- Rarity color indicator -->
      <div
        class="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        :style="{ backgroundColor: selectedRarity.color }"
      />
    </div>

    <!-- Rarity preview bar -->
    <div
      class="h-1 mt-2 transition-colors duration-200"
      :style="{ backgroundColor: selectedRarity.color }"
    />
  </div>
</template>
