<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import type { Item } from "@/types/Item";
import { type SortKey } from "../types/SortKey";
import { type SortDir } from "../types/SortDir";
import { formatPrice } from "@/utils/formatPrice";
import { formatPercent } from "@/utils/formatPercent";

const props = defineProps<{
  items: Item[];
  sortKey: SortKey;
  sortDir: SortDir;
}>();

const emit = defineEmits<{
  (emit: "sort", sort: { key: SortKey; dir: SortDir }): void;
}>();

const route = useRoute();
const router = useRouter();

const toggleSort = (key: SortKey) => {
  if (props.sortKey === key) {
    if (props.sortDir === "desc") {
      emit("sort", { key, dir: "asc" });
    } else if (props.sortDir === "asc") {
      emit("sort", { key: null, dir: null });
    } else {
      emit("sort", { key, dir: "desc" });
    }
  } else {
    emit("sort", { key, dir: key === "name" ? "asc" : "desc" });
  }
};

const sortState = (key: SortKey) => {
  if (props.sortKey !== key || !props.sortDir) return null;
  return props.sortDir === "asc" ? "asc" : "desc";
};

const goToDetail = (item: Item) => {
  void router.push({ name: "item-detail", params: { id: item.id }, query: route.query });
};
</script>

<template>
  <div class="space-y-3 overflow-hidden">
    <div class="overflow-x-auto no-scrollbar">
      <table class="min-w-full text-sm table-fixed">
        <thead class="border-b border-osrs-border">
          <tr>
            <th
              class="px-3 py-3 text-left font-semibold text-osrs-text uppercase tracking-wide cursor-pointer select-none w-2/5 whitespace-nowrap"
              title="Item name from the Grand Exchange listing"
              @click="toggleSort('name')"
            >
              <span class="inline-flex items-center gap-1">
                <span>Item</span>
                <svg
                  v-if="sortState('name') === 'asc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 6l-6 9h12z" />
                </svg>
                <svg
                  v-else-if="sortState('name') === 'desc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 9l6 9 6-9z" />
                </svg>
                <svg
                  v-else
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M8 10l4-4 4 4M8 14l4 4 4-4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </th>
            <th
              class="px-3 py-3 text-left font-semibold text-osrs-text uppercase tracking-wide cursor-pointer select-none w-24 whitespace-nowrap"
              title="Latest observed sell price on the Grand Exchange"
              @click="toggleSort('sell')"
            >
              <span class="inline-flex items-center gap-1">
                <span>Sell price</span>
                <svg
                  v-if="sortState('sell') === 'asc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 6l-6 9h12z" />
                </svg>
                <svg
                  v-else-if="sortState('sell') === 'desc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 9l6 9 6-9z" />
                </svg>
                <svg
                  v-else
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M8 10l4-4 4 4M8 14l4 4 4-4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </th>
            <th
              class="px-3 py-3 text-left font-semibold text-osrs-text uppercase tracking-wide cursor-pointer select-none w-24 whitespace-nowrap"
              title="Latest observed buy price on the Grand Exchange"
              @click="toggleSort('buy')"
            >
              <span class="inline-flex items-center gap-1">
                <span>Buy price</span>
                <svg
                  v-if="sortState('buy') === 'asc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 6l-6 9h12z" />
                </svg>
                <svg
                  v-else-if="sortState('buy') === 'desc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 9l6 9 6-9z" />
                </svg>
                <svg
                  v-else
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M8 10l4-4 4 4M8 14l4 4 4-4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </th>
            <th
              class="px-3 py-3 text-left font-semibold text-osrs-text uppercase tracking-wide cursor-pointer select-none w-24 whitespace-nowrap"
              title="Difference between sell and buy price"
              @click="toggleSort('margin')"
            >
              <span class="inline-flex items-center gap-1">
                <span>Margin</span>
                <svg
                  v-if="sortState('margin') === 'asc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 6l-6 9h12z" />
                </svg>
                <svg
                  v-else-if="sortState('margin') === 'desc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 9l6 9 6-9z" />
                </svg>
                <svg
                  v-else
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M8 10l4-4 4 4M8 14l4 4 4-4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </th>
            <th
              class="px-3 py-3 text-left font-semibold text-osrs-text uppercase tracking-wide cursor-pointer select-none w-20 whitespace-nowrap"
              title="1% Grand Exchange tax applied to the sell price"
              @click="toggleSort('tax')"
            >
              <span class="inline-flex items-center gap-1">
                <span>Tax</span>
                <svg
                  v-if="sortState('tax') === 'asc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 6l-6 9h12z" />
                </svg>
                <svg
                  v-else-if="sortState('tax') === 'desc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 9l6 9 6-9z" />
                </svg>
                <svg
                  v-else
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M8 10l4-4 4 4M8 14l4 4 4-4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </th>
            <th
              class="px-3 py-3 text-left font-semibold text-osrs-text uppercase tracking-wide cursor-pointer select-none w-24 whitespace-nowrap"
              title="Margin minus GE tax (estimated profit per item)"
              @click="toggleSort('profit')"
            >
              <span class="inline-flex items-center gap-1">
                <span>Profit</span>
                <svg
                  v-if="sortState('profit') === 'asc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 6l-6 9h12z" />
                </svg>
                <svg
                  v-else-if="sortState('profit') === 'desc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 9l6 9 6-9z" />
                </svg>
                <svg
                  v-else
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M8 10l4-4 4 4M8 14l4 4 4-4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </th>
            <th
              class="px-3 py-3 text-left font-semibold text-osrs-text uppercase tracking-wide cursor-pointer select-none w-20 whitespace-nowrap"
              title="Profit divided by buy price, shown as a percentage return"
              @click="toggleSort('roi')"
            >
              <span class="inline-flex items-center gap-1">
                <span>ROI%</span>
                <svg
                  v-if="sortState('roi') === 'asc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 6l-6 9h12z" />
                </svg>
                <svg
                  v-else-if="sortState('roi') === 'desc'"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 9l6 9 6-9z" />
                </svg>
                <svg
                  v-else
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M8 10l4-4 4 4M8 14l4 4 4-4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="odd:bg-osrs-panel/60 even:bg-osrs-panel/40 hover:bg-osrs-accent/10 hover:scale-[1.01] transition-transform transition-colors cursor-pointer focus:outline-none"
            role="button"
            tabindex="0"
            @click="goToDetail(item)"
            @keydown.enter.prevent="goToDetail(item)"
            @keydown.space.prevent="goToDetail(item)"
          >
            <td class="px-3 py-2 w-2/5 align-top">
              <div class="flex items-center gap-3 hover:text-osrs-accent w-full">
                <img
                  :src="item.icon"
                  :alt="item.name"
                  class="w-8 h-8 object-contain flex-shrink-0"
                />
                <div class="min-w-0 space-y-1">
                  <div class="text-sm font-semibold text-osrs-text font-osrs truncate">
                    {{ item.name }}
                  </div>
                  <div class="text-xs text-osrs-muted truncate">
                    {{ item.description }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-3 py-2 align-top w-24 whitespace-nowrap">
              <div class="flex flex-col leading-tight">
                <span class="font-mono text-osrs-accent">
                  {{ formatPrice(item.sellPrice) }}
                </span>
                <span class="text-osrs-muted">Sell (high)</span>
              </div>
            </td>
            <td class="px-3 py-2 align-top w-24 whitespace-nowrap">
              <div class="flex flex-col leading-tight">
                <span class="font-mono text-osrs-green">
                  {{ formatPrice(item.buyPrice) }}
                </span>
                <span class="text-osrs-muted">Buy (low)</span>
              </div>
            </td>
            <td class="px-3 py-2 align-top w-24 whitespace-nowrap">
              <span class="font-mono text-osrs-text">
                {{ formatPrice(item.margin) }}
              </span>
            </td>
            <td class="px-3 py-2 align-top w-20 whitespace-nowrap">
              <span class="font-mono text-osrs-muted">
                {{ formatPrice(item.tax) }}
              </span>
            </td>
            <td class="px-3 py-2 align-top w-24 whitespace-nowrap">
              <span class="font-mono text-osrs-accentDark">
                {{ formatPrice(item.profit) }}
              </span>
            </td>
            <td class="px-3 py-2 align-top w-20 whitespace-nowrap">
              <span class="font-mono text-osrs-text">
                {{ formatPercent(item.roi) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
