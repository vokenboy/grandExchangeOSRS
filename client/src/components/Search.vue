<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import debounce from "lodash.debounce";

defineProps<{
  querry: string;
}>();

const emit = defineEmits<{
  (e: "update:querry", value: string): void;
}>();

const emitChange = debounce((value: string) => {
  emit("update:querry", value);
}, 200);

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emitChange(target.value);
};

onBeforeUnmount(() => {
  emitChange.cancel();
});
</script>

<template>
  <input
    :value="querry"
    placeholder="Search items..."
    type="text"
    class="w-72 rounded-lg border-2 border-osrs-border bg-osrs-panel px-3 py-2 text-sm text-osrs-text placeholder:text-osrs-muted focus:outline-none focus:ring-2 focus:ring-osrs-accent focus:border-osrs-accent shadow-lg"
    @input="onInput"
  />
</template>
