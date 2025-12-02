<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import defaultCursorImg from "@/assets/default_cursor.png";
import dragonCursorImg from "@/assets/dragon_scimitar_cursor.png";

type CursorMode = "dragon" | "default";

const cursorMode = ref<CursorMode>("dragon");
const STORAGE_KEY = "cursor-mode";

const tooltipText = computed(() =>
  cursorMode.value === "dragon" ? "Switch to default cursor" : "Switch to dragon scimitar cursor"
);

const setCursor = (mode: CursorMode) => {
  const value = mode === "dragon" ? 'url("/cursors/dragon-scimitar.cur"), auto' : "auto";
  document.documentElement.style.setProperty("--osrs-cursor", value);
};

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dragon" || stored === "default") {
    cursorMode.value = stored;
  }
  setCursor(cursorMode.value);
});

const toggleCursor = () => {
  cursorMode.value = cursorMode.value === "dragon" ? "default" : "dragon";
  setCursor(cursorMode.value);
  localStorage.setItem(STORAGE_KEY, cursorMode.value);
};
</script>

<template>
  <div class="inline-block">
    <button
      type="button"
      class="inline-flex h-10 w-10 items-center justify-center rounded border border-osrs-border bg-osrs-panel/90 shadow-osrs focus:outline-none transition"
      :aria-pressed="cursorMode === 'dragon'"
      :aria-label="tooltipText"
      @click="toggleCursor"
    >
      <span class="sr-only">{{ tooltipText }}</span>
      <img
        v-if="cursorMode === 'dragon'"
        :src="dragonCursorImg"
        alt="Dragon scimitar cursor"
        class="h-6 w-6 object-contain"
      />
      <img v-else :src="defaultCursorImg" alt="Default cursor" class="h-4 w-4 object-contain" />
    </button>
  </div>
</template>
