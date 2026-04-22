<script setup lang="ts">
import ItemEditor from '~/components/item/ItemEditor.vue'

const itemMode = ref<'vanilla' | 'skyblock'>('skyblock')
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#FFAA00] flex items-center gap-2">
          <span>⚔</span>
          <span>Item Creator</span>
        </h1>
        <p class="text-xs text-[#888888] mt-1">
          Design custom items with stats, lore, and abilities
        </p>
      </div>

      <!-- Mode toggle -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-[#888888]">Mode:</span>
        <div class="flex rounded-lg overflow-hidden border border-[#333333]">
          <button
            class="px-4 py-2 text-xs transition-colors"
            :class="itemMode === 'vanilla'
              ? 'bg-[#2d7a27] text-white'
              : 'bg-[#1a1a1a] text-[#888888] hover:bg-[#252525]'"
            @click="itemMode = 'vanilla'"
          >
            Vanilla
          </button>
          <button
            class="px-4 py-2 text-xs transition-colors"
            :class="itemMode === 'skyblock'
              ? 'bg-[#2d7a27] text-white'
              : 'bg-[#1a1a1a] text-[#888888] hover:bg-[#252525]'"
            @click="itemMode = 'skyblock'"
          >
            Skyblock
          </button>
        </div>
      </div>
    </div>

    <!-- Mode indicator bar -->
    <div
      class="h-0.5 rounded-full transition-colors duration-300"
      :class="itemMode === 'skyblock' ? 'bg-[#FFAA00]' : 'bg-[#55FF55]'"
    />

    <!-- Editor component -->
    <ItemEditor :is-skyblock="itemMode === 'skyblock'" />
  </div>
</template>
