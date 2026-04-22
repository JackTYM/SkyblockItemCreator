<script setup lang="ts">
import RecipeDesigner from '~/components/recipe/RecipeDesigner.vue'
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="text-center">
      <h1 class="text-2xl font-bold text-[#55FF55] flex items-center justify-center gap-2">
        <span>⚒</span>
        <span>Recipe Designer</span>
      </h1>
      <p class="text-xs text-[#888888] mt-1">
        Create crafting recipes with vanilla or Skyblock styling
      </p>
    </div>

    <!-- Mode indicator bar -->
    <div class="h-0.5 bg-[#55FF55] rounded-full" />

    <!-- Recipe designer component -->
    <div class="mc-panel-dark p-6">
      <RecipeDesigner />
    </div>
  </div>
</template>
