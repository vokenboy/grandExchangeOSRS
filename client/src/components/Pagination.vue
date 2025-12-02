<script setup lang="ts">
import { ref, watch, computed } from "vue";

const props = withDefaults(
  defineProps<{
    page: number;
    totalPages: number;
    disabled?: boolean;
  }>(),
  { disabled: false }
);

const emit = defineEmits<{
  (e: "page", page: number): void;
}>();

const disabled = computed(() => props.disabled);
const inputPage = ref(props.page.toString());

const hasNext = computed(() => props.page < safeTotalPages.value);
const hasPrev = computed(() => props.page > 1);

const safeTotalPages = computed(() =>
  props.totalPages && props.totalPages > 0 ? props.totalPages : 1
);

const clamp = (target: number) => {
  const upper = safeTotalPages.value;
  return Math.min(Math.max(1, target), upper);
};

const goTo = (target: number) => {
  if (disabled.value) return;
  const next = clamp(target);
  emit("page", next);
};

const submitInput = () => {
  const parsed = Number(inputPage.value);
  if (!Number.isFinite(parsed)) {
    inputPage.value = props.page.toString();
    return;
  }
  goTo(parsed);
};

watch(
  () => props.page,
  (val) => {
    inputPage.value = val.toString();
  }
);
</script>

<template>
  <div class="flex flex-col gap-2 border-t border-osrs-border pt-3">
    <div class="flex items-center gap-2 text-osrs-text flex-wrap sm:flex-nowrap">
      <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <button
          class="px-3 py-1 rounded border border-osrs-border bg-osrs-panel text-xs hover:bg-osrs-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="!hasPrev"
          @click="goTo(1)"
        >
          First
        </button>
        <button
          class="px-3 py-1 rounded border border-osrs-border bg-osrs-panel text-xs hover:bg-osrs-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="!hasPrev"
          @click="goTo(page - 1)"
        >
          Prev
        </button>
        <button
          class="px-3 py-1 rounded border border-osrs-border bg-osrs-panel text-xs hover:bg-osrs-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="!hasNext"
          @click="goTo(page + 1)"
        >
          Next
        </button>
        <button
          class="px-3 py-1 rounded border border-osrs-border bg-osrs-panel text-xs hover:bg-osrs-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="!hasNext"
          @click="goTo(totalPages)"
        >
          Last
        </button>
      </div>
      <span class="text-xs text-osrs-muted px-1 sm:px-2 whitespace-nowrap">
        Page {{ page }} of {{ safeTotalPages }}
      </span>
      <div class="flex items-center gap-2 text-xs text-osrs-text flex-wrap sm:flex-nowrap">
        <span>Go to</span>
        <input
          v-model="inputPage"
          :max="safeTotalPages"
          type="number"
          class="w-14 sm:w-12 rounded bg-osrs-panel border border-osrs-border px-2 py-1 text-xs text-osrs-text focus:outline-none focus:ring-1 focus:ring-osrs-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          :disabled="disabled"
          @keyup.enter="submitInput"
        />
        <button
          class="px-2 py-1 rounded border border-osrs-border bg-osrs-panel text-xs hover:bg-osrs-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="disabled"
          @click="submitInput"
        >
          Go
        </button>
      </div>
    </div>
  </div>
</template>
