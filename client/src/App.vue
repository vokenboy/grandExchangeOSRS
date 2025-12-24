<script setup lang="ts">
import { RouterView } from "vue-router";
// import CursorToggle from "@/components/CursorToggle.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- <div class="px-4 pt-2">
      <CursorToggle />
    </div> -->
    <div class="flex-1">
      <RouterView />
    </div>
  </div>
</template>
