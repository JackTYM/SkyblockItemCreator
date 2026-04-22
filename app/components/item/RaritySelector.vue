<script setup lang="ts">
import { RARITIES, MINECRAFT_COLORS } from '~/types'

interface Props {
  modelValue: string
  customName?: string
  customColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  customName: '',
  customColor: '#FF5555',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:customName': [value: string]
  'update:customColor': [value: string]
}>()

const isCustom = computed(() => props.modelValue === 'custom')

const selectedRarity = computed(() => {
  if (isCustom.value) {
    return {
      name: 'custom',
      displayName: props.customName || 'CUSTOM',
      color: props.customColor,
      code: 'c',
      bgClass: 'bg-red-500/20',
    }
  }
  return RARITIES.find(r => r.name === props.modelValue) ?? RARITIES[0]
})

// Preset color options for quick selection
const colorPresets = Object.entries(MINECRAFT_COLORS).map(([code, hex]) => ({
  code,
  hex,
}))
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
        <option value="custom" :style="{ color: customColor }">
          CUSTOM...
        </option>
      </select>

      <!-- Rarity color indicator -->
      <div
        class="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        :style="{ backgroundColor: selectedRarity.color }"
      />
    </div>

    <!-- Custom rarity inputs -->
    <div v-if="isCustom" class="mt-2 space-y-2 p-2 bg-black/30 border border-[#373737] rounded">
      <div>
        <label class="font-minecraft text-[10px] text-[#AAAAAA] mb-1 block">Rarity Name</label>
        <input
          :value="customName"
          type="text"
          class="mc-input text-xs uppercase"
          :style="{ color: customColor }"
          placeholder="CUSTOM"
          @input="emit('update:customName', ($event.target as HTMLInputElement).value.toUpperCase())"
        >
      </div>
      <div>
        <label class="font-minecraft text-[10px] text-[#AAAAAA] mb-1 block">Color</label>
        <div class="flex gap-2 items-center">
          <input
            :value="customColor"
            type="color"
            class="w-8 h-8 rounded cursor-pointer bg-transparent border border-[#373737]"
            @input="emit('update:customColor', ($event.target as HTMLInputElement).value)"
          >
          <div class="flex flex-wrap gap-1">
            <button
              v-for="preset in colorPresets"
              :key="preset.code"
              class="w-4 h-4 rounded hover:scale-110 transition-transform border border-black/50"
              :style="{ backgroundColor: preset.hex }"
              :title="`§${preset.code}`"
              @click="emit('update:customColor', preset.hex)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Rarity preview bar -->
    <div
      class="h-1 mt-2 transition-colors duration-200"
      :style="{ backgroundColor: selectedRarity.color }"
    />
  </div>
</template>
