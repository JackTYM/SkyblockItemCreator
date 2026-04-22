<script setup lang="ts">
import MayorEditor from '~/components/mayor/MayorEditor.vue'
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#FFAA00] flex items-center gap-2">
          <span>👑</span>
          <span>Mayor Creator</span>
        </h1>
        <p class="text-xs text-[#888888] mt-1">
          Design custom mayors with perks and tooltips
        </p>
      </div>
    </div>

    <!-- Mode indicator bar -->
    <div class="h-0.5 rounded-full bg-[#FFAA00]" />

    <!-- Editor component -->
    <MayorEditor />
  </div>
</template>
