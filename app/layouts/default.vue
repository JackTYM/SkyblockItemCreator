<script setup lang="ts">
const route = useRoute()

const navItems = [
  { path: '/', label: 'Home', icon: '⌂' },
  { path: '/item', label: 'Item Creator', icon: '⚔' },
  { path: '/recipe', label: 'Recipe Designer', icon: '⚒' },
  { path: '/mayor', label: 'Mayor Creator', icon: '👑' },
  { path: '/milestone', label: 'Milestone Creator', icon: '🏆' },
  { path: '/collection', label: 'Collection Creator', icon: '📚' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-[#0f0f0f] border-b border-[#2d2d2d] sticky top-0 z-40">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <div class="w-9 h-9 bg-gradient-to-br from-[#FFAA00] to-[#FF5555] rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <span class="text-xl">✦</span>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-[#FFAA00]">
                SkyBlock Creator
              </h1>
              <p class="text-[10px] text-[#666666] -mt-0.5">
                Item & Recipe Designer
              </p>
            </div>
          </NuxtLink>

          <!-- Navigation -->
          <nav class="flex gap-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-all"
              :class="route.path === item.path
                ? 'bg-[#FFAA00]/10 text-[#FFAA00] border border-[#FFAA00]/30'
                : 'text-[#888888] hover:text-white hover:bg-white/5'"
            >
              <span>{{ item.icon }}</span>
              <span class="hidden sm:inline">{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 container mx-auto px-4 py-6">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-[#0a0a0a] border-t border-[#1a1a1a] py-4">
      <div class="container mx-auto px-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#555555]">
          <p>Not affiliated with Hypixel or Mojang</p>
          <p>Made with <span class="text-[#FF5555]">❤</span> for the SkyBlock community</p>
        </div>
      </div>
    </footer>
  </div>
</template>
