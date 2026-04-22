<script setup lang="ts">
const features = [
  {
    icon: '⚔',
    title: 'Item Creator',
    description: 'Design custom items with Skyblock stats, abilities, and lore',
    link: '/item',
    color: '#FF5555',
  },
  {
    icon: '⚒',
    title: 'Recipe Designer',
    description: 'Create crafting recipes with vanilla or Skyblock UI',
    link: '/recipe',
    color: '#55FF55',
  },
]

const highlights = [
  { icon: '✎', text: 'Markdown & § code editors' },
  { icon: '❤', text: 'All Skyblock stat symbols' },
  { icon: '🎨', text: 'Multiple texture sources' },
  { icon: '📥', text: 'Export as PNG, JSON, /give' },
]
</script>

<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center py-12">
    <!-- Hero section -->
    <div class="text-center mb-12 animate-fade-in">
      <!-- Animated logo -->
      <div class="relative inline-block mb-6">
        <div class="w-20 h-20 mx-auto bg-gradient-to-br from-[#FFAA00] via-[#FF5555] to-[#AA00AA] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#FFAA00]/20">
          <span class="text-4xl">✦</span>
        </div>
        <!-- Floating particles -->
        <div class="absolute -top-2 -left-2 w-3 h-3 bg-[#55FFFF] rounded-full animate-bounce opacity-70" style="animation-delay: 0s;" />
        <div class="absolute -top-1 -right-3 w-2 h-2 bg-[#FF55FF] rounded-full animate-bounce opacity-70" style="animation-delay: 0.2s;" />
        <div class="absolute -bottom-2 -left-1 w-2 h-2 bg-[#55FF55] rounded-full animate-bounce opacity-70" style="animation-delay: 0.4s;" />
      </div>

      <h1 class="text-3xl md:text-4xl font-bold text-[#FFAA00] mb-3">
        SkyBlock Item Creator
      </h1>
      <p class="text-sm md:text-base text-[#888888] max-w-md mx-auto">
        Design custom items and crafting recipes for Hypixel SkyBlock
      </p>
    </div>

    <!-- Feature cards -->
    <div class="grid md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
      <NuxtLink
        v-for="feature in features"
        :key="feature.title"
        :to="feature.link"
        class="mc-panel-dark p-6 group transition-all hover:border-[#404040] hover:shadow-lg"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
            :style="{ backgroundColor: feature.color + '15', color: feature.color }"
          >
            {{ feature.icon }}
          </div>
          <div>
            <h2
              class="text-lg font-semibold mb-1"
              :style="{ color: feature.color }"
            >
              {{ feature.title }}
            </h2>
            <p class="text-xs text-[#888888]">
              {{ feature.description }}
            </p>
          </div>
        </div>

        <!-- Hover indicator -->
        <div
          class="h-0.5 mt-4 rounded-full transition-all duration-300 opacity-30 group-hover:opacity-100"
          :style="{ backgroundColor: feature.color }"
        />
      </NuxtLink>
    </div>

    <!-- Highlights -->
    <div class="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-5 max-w-lg w-full">
      <h3 class="text-sm text-[#888888] mb-4 text-center font-medium">
        Features
      </h3>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="highlight in highlights"
          :key="highlight.text"
          class="flex items-center gap-2"
        >
          <span class="text-lg">{{ highlight.icon }}</span>
          <span class="text-xs text-[#aaaaaa]">{{ highlight.text }}</span>
        </div>
      </div>
    </div>

    <!-- Rarity showcase -->
    <div class="mt-12 text-center">
      <p class="text-xs text-[#555555] mb-3">All Rarity Tiers</p>
      <div class="flex flex-wrap justify-center gap-2">
        <span class="text-xs text-rarity-common px-3 py-1.5 bg-white/5 rounded-lg">COMMON</span>
        <span class="text-xs text-rarity-uncommon px-3 py-1.5 bg-green-500/10 rounded-lg">UNCOMMON</span>
        <span class="text-xs text-rarity-rare px-3 py-1.5 bg-blue-500/10 rounded-lg">RARE</span>
        <span class="text-xs text-rarity-epic px-3 py-1.5 bg-purple-500/10 rounded-lg">EPIC</span>
        <span class="text-xs text-rarity-legendary px-3 py-1.5 bg-amber-500/10 rounded-lg">LEGENDARY</span>
        <span class="text-xs text-rarity-mythic px-3 py-1.5 bg-pink-500/10 rounded-lg">MYTHIC</span>
        <span class="text-xs text-rarity-divine px-3 py-1.5 bg-cyan-400/10 rounded-lg">DIVINE</span>
        <span class="text-xs text-rarity-special px-3 py-1.5 bg-red-500/10 rounded-lg">SPECIAL</span>
      </div>
    </div>
  </div>
</template>
