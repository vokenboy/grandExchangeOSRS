<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { getItems } from "@/services/item";
import { useItemsQueryStore } from "@/stores/itemsQueryStore";
import { type Item } from "@/types/Item";
import { type SortKey } from "../types/SortKey";
import { type SortDir } from "../types/SortDir";
import ItemsTable from "@/components/ItemsTable.vue";
import Search from "@/components/Search.vue";
import Pagination from "@/components/Pagination.vue";
import PerPageSelector from "@/components/PerPageSelector.vue";

const queryStore = useItemsQueryStore();
const { querry, page, sortKey, sortDir } = storeToRefs(queryStore);
const { hydrateFromRoute, syncQuery } = queryStore;

const pageSize = ref(10);

const items = ref<Item[]>();
const error = ref<string | null>(null);
const totalItems = ref(0);
const totalPages = ref(0);
const hasSearched = ref(false);

let isHydrating = true;

const loadItems = async (targetPage = page.value, syncRoute = true) => {
  const term = querry.value.trim();
  try {
    hasSearched.value = true;
    error.value = null;
    page.value = targetPage;

    if (syncRoute) await syncQuery();

    const data = await getItems(term, page.value, pageSize.value, sortKey.value, sortDir.value);
    items.value = data.items ?? [];
    totalPages.value = data.totalPages ?? 0;
    totalItems.value = data.total ?? 0;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 500) {
      error.value = "Server error";
    } else {
      error.value = "Unable to load items.";
    }
    items.value = [];
    totalItems.value = 0;
    totalPages.value = 0;
  }
};

const onAction = async (reset = false) => {
  if (reset) {
    page.value = 1;
  }

  await loadItems(page.value);

  const maxPage = Math.max(1, totalPages.value);

  if (page.value > maxPage) {
    page.value = maxPage;
    await loadItems(page.value);
  }
};

const onSearchChange = async (value: string) => {
  querry.value = value;
  if (isHydrating) return;
  await onAction(true);
};

const pageChange = async (nextPage: number) => {
  const maxPage = totalPages.value;
  if (nextPage === page.value || nextPage < 1 || nextPage > maxPage) {
    return;
  }
  await loadItems(nextPage);
};

const sortChange = (sort: { key: SortKey; dir: SortDir }) => {
  sortKey.value = sort.key;
  sortDir.value = sort.dir;
  page.value = 1;
  void loadItems(1);
};

const onPageSizeChange = async (newSize: number) => {
  pageSize.value = newSize;
  page.value = 1;
  await loadItems(1);
};

onMounted(async () => {
  hydrateFromRoute();
  await loadItems(page.value, false);
  isHydrating = false;
});
</script>

<template>
  <div class="px-3 py-4 sm:px-4 space-y-4">
    <section
      class="rounded-md border border-osrs-border bg-osrs-panel/90 p-3 sm:p-4 space-y-4 shadow-osrs backdrop-blur"
    >
      <div class="px-1 sm:px-2 pt-1 sm:pt-2 flex items-center gap-3 flex-wrap">
        <Search :querry="querry" @update:querry="onSearchChange" />
        <PerPageSelector :page-size="pageSize" @update:page-size="onPageSizeChange" />
      </div>
      <div v-if="error" class="p-4 text-sm text-osrs-red">
        {{ error }}
      </div>
      <div v-else class="flex flex-col h-full">
        <div v-if="hasSearched" class="flex flex-col min-h-0 flex-1">
          <div class="flex-1 min-h-0">
            <ItemsTable
              v-if="items"
              :items="items"
              :sort-key="sortKey"
              :sort-dir="sortDir"
              @sort="sortChange"
            />
          </div>
          <div class="mt-3 flex-shrink-0">
            <Pagination :page="page" :total-pages="totalPages" @page="pageChange" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
