import { ref } from "vue";
import { defineStore } from "pinia";
import { useRoute, useRouter } from "vue-router";
import type { SortKey } from "@/types/SortKey";
import type { SortDir } from "@/types/SortDir";

export const useItemsQueryStore = defineStore("itemsQuery", () => {
  const route = useRoute();
  const router = useRouter();

  const querry = ref("");
  const page = ref(1);
  const sortKey = ref<SortKey>(null);
  const sortDir = ref<SortDir>(null);

  const hydrateFromRoute = () => {
    const q = typeof route.query.q === "string" ? route.query.q : "";
    const pageParam = Number(route.query.page ?? page.value);
    const sortKeyParam =
      typeof route.query.sortKey === "string" ? (route.query.sortKey as SortKey) : null;
    const sortDirParam =
      typeof route.query.sortDir === "string" ? (route.query.sortDir as SortDir) : null;

    querry.value = q;
    page.value = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    sortKey.value = sortKeyParam;
    sortDir.value = sortDirParam;
  };

  const syncQuery = async () => {
    const query: Record<string, string> = {};
    if (querry.value.trim()) query.q = querry.value.trim();
    query.page = String(page.value);
    if (sortKey.value) query.sortKey = sortKey.value;
    if (sortDir.value) query.sortDir = sortDir.value;
    await router.replace({ query });
  };

  return {
    querry,
    page,
    sortKey,
    sortDir,
    hydrateFromRoute,
    syncQuery,
  };
});
