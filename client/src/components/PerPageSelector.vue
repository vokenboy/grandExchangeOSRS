<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  pageSize: number;
}>();

const emit = defineEmits<{
  (e: "update:pageSize", value: number): void;
}>();

const isOpen = ref(false);
const options = [5, 10, 20, 50];

const selectOption = (value: number) => {
  emit("update:pageSize", value);
  isOpen.value = false;
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Close dropdown when clicking outside
const closeDropdown = () => {
  isOpen.value = false;
};
</script>

<template>
  <div class="relative" @click.stop>
    <button
      class="rounded-lg border-2 border-osrs-border bg-osrs-panel px-3 py-2 text-sm text-osrs-text hover:bg-osrs-accent/20 focus:outline-none focus:ring-2 focus:ring-osrs-accent focus:border-osrs-accent shadow-lg flex items-center gap-2 whitespace-nowrap transition-colors"
      @click="toggleDropdown"
    >
      <span>{{ pageSize }}</span>
      <svg
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute top-full mt-1 right-0 z-50 min-w-full rounded-lg border-2 border-osrs-border bg-osrs-panel shadow-xl overflow-hidden"
    >
      <button
        v-for="option in options"
        :key="option"
        class="w-full px-4 py-2 text-sm text-osrs-text hover:bg-osrs-accent/20 text-left transition-colors"
        :class="{
          'bg-osrs-accent/10 font-semibold': option === pageSize,
        }"
        @click="selectOption(option)"
      >
        {{ option }}
      </button>
    </div>

    <!-- Backdrop to close dropdown -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="closeDropdown"></div>
  </div>
</template>
