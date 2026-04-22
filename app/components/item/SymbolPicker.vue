<script setup lang="ts">
import { SKYBLOCK_SYMBOLS, SKYBLOCK_STATS } from '~/types'

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  select: [symbol: string]
}>()

const searchQuery = ref('')

const filteredSymbols = computed(() => {
  if (!searchQuery.value) return SKYBLOCK_SYMBOLS
  const query = searchQuery.value.toLowerCase()
  return SKYBLOCK_SYMBOLS.filter((_, i) => {
    const stat = SKYBLOCK_STATS[i]
    return stat?.name.toLowerCase().includes(query) || false
  })
})

function selectSymbol(symbol: string) {
  emit('select', symbol)
  emit('close')
}

function getSymbolName(symbol: string): string {
  const stat = SKYBLOCK_STATS.find(s => s.symbol === symbol)
  return stat?.name || 'Symbol'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <div class="mc-panel-dark p-4 w-full max-w-md animate-slide-up">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-minecraft text-[#FFAA00] mc-text-shadow">
              Symbol Picker
            </h3>
            <button
              class="text-[#FF5555] hover:text-[#FF7777] font-minecraft text-lg"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- Search -->
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search symbols..."
            class="mc-input mb-4 text-sm"
          >

          <!-- Stats section -->
          <div class="mb-4">
            <p class="font-minecraft text-xs text-[#AAAAAA] mb-2">Stat Symbols</p>
            <div class="grid grid-cols-5 gap-1">
              <button
                v-for="stat in SKYBLOCK_STATS"
                :key="stat.stat"
                class="mc-slot-dark mc-slot-dark-hover aspect-square flex items-center justify-center text-lg transition-transform hover:scale-105"
                :style="{ color: stat.color }"
                :title="stat.name"
                @click="selectSymbol(stat.symbol)"
              >
                {{ stat.symbol }}
              </button>
            </div>
          </div>

          <!-- All symbols -->
          <div>
            <p class="font-minecraft text-xs text-[#AAAAAA] mb-2">All Symbols</p>
            <div class="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
              <button
                v-for="symbol in filteredSymbols"
                :key="symbol"
                class="mc-slot-dark mc-slot-dark-hover aspect-square flex items-center justify-center text-base transition-transform hover:scale-105"
                :title="getSymbolName(symbol)"
                @click="selectSymbol(symbol)"
              >
                {{ symbol }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mc-text-shadow {
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}
</style>
