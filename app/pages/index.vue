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
  {
    icon: '👑',
    title: 'Mayor Creator',
    description: 'Design custom mayors with perks and tooltips',
    link: '/mayor',
    color: '#FFAA00',
  },
  {
    icon: '🏆',
    title: 'Milestone Creator',
    description: 'Create milestone reward menus with progress tracking',
    link: '/milestone',
    color: '#55FFFF',
  },
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
    <div class="grid md:grid-cols-2 gap-6 w-full max-w-3xl mb-12">
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

      </div>
</template>
