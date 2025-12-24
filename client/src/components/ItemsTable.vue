<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
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

const updateScrollIndicators = () => {
  const container = document.querySelector(".scroll-container") as HTMLElement;
  if (!container) return;

  const topIndicator = document.querySelector(".scroll-indicator-top") as HTMLElement;
  const bottomIndicator = document.querySelector(".scroll-indicator-bottom") as HTMLElement;

  const { scrollTop, scrollHeight, clientHeight } = container;
  const isAtTop = scrollTop <= 10;
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

  if (topIndicator) {
    topIndicator.style.opacity = isAtTop ? "0" : "1";
  }
  if (bottomIndicator) {
    bottomIndicator.style.opacity = isAtBottom ? "0" : "1";
  }
};

onMounted(() => {
  const container = document.querySelector(".scroll-container");
  if (container) {
    container.addEventListener("scroll", updateScrollIndicators);
    // Initial check
    setTimeout(updateScrollIndicators, 100);
  }
});

onUnmounted(() => {
  const container = document.querySelector(".scroll-container");
  if (container) {
    container.removeEventListener("scroll", updateScrollIndicators);
  }
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden relative rounded-lg">
    <div
      class="overflow-y-auto overflow-x-auto no-scrollbar max-h-[calc(100vh-300px)] relative scroll-container rounded-lg"
    >
      <!-- Top scroll indicator -->
      <div class="scroll-indicator-top absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-osrs-panel/90 to-transparent pointer-events-none z-20 opacity-0 transition-opacity"></div>

      <table class="w-full min-w-[800px] text-base table-fixed rounded-lg overflow-hidden">
        <colgroup>
          <col style="width: 30%" />
          <col style="width: 14%" />
          <col style="width: 14%" />
          <col style="width: 12%" />
          <col style="width: 10%" />
          <col style="width: 12%" />
          <col style="width: 8%" />
        </colgroup>
        <thead class="border-b-2 border-osrs-border sticky top-0 bg-osrs-panel backdrop-blur z-10">
          <tr>
            <th
              class="px-2 py-3 text-left text-sm font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap transition-colors"
              :class="sortState('name') ? 'bg-osrs-accent/20 text-osrs-accent' : 'text-osrs-text hover:bg-osrs-accent/10'"
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
              class="px-2 py-3 text-left text-sm font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap transition-colors"
              :class="sortState('sell') ? 'bg-osrs-accent/20 text-osrs-accent' : 'text-osrs-text hover:bg-osrs-accent/10'"
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
              class="px-2 py-3 text-left text-sm font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap transition-colors"
              :class="sortState('buy') ? 'bg-osrs-accent/20 text-osrs-accent' : 'text-osrs-text hover:bg-osrs-accent/10'"
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
              class="px-2 py-3 text-left text-sm font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap transition-colors"
              :class="sortState('margin') ? 'bg-osrs-accent/20 text-osrs-accent' : 'text-osrs-text hover:bg-osrs-accent/10'"
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
              class="px-2 py-3 text-left text-sm font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap transition-colors"
              :class="sortState('tax') ? 'bg-osrs-accent/20 text-osrs-accent' : 'text-osrs-text hover:bg-osrs-accent/10'"
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
              class="px-2 py-3 text-left text-sm font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap transition-colors"
              :class="sortState('profit') ? 'bg-osrs-accent/20 text-osrs-accent' : 'text-osrs-text hover:bg-osrs-accent/10'"
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
              class="px-2 py-3 text-left text-sm font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap transition-colors"
              :class="sortState('roi') ? 'bg-osrs-accent/20 text-osrs-accent' : 'text-osrs-text hover:bg-osrs-accent/10'"
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
            class="odd:bg-osrs-panel/60 even:bg-osrs-panel/40 hover:bg-osrs-accent/20 transition-all cursor-pointer focus:outline-none border-b border-osrs-border/30"
            role="button"
            tabindex="0"
            @click="goToDetail(item)"
            @keydown.enter.prevent="goToDetail(item)"
            @keydown.space.prevent="goToDetail(item)"
          >
            <td class="px-2 py-2 align-top">
              <div class="flex items-center gap-2 hover:text-osrs-accent w-full">
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
            <td class="px-2 py-2 align-top whitespace-nowrap">
              <div class="flex flex-col leading-tight">
                <span class="font-mono text-osrs-accent text-sm">
                  {{ formatPrice(item.sellPrice) }}
                </span>
                <span class="text-osrs-muted text-xs">Sell (high)</span>
              </div>
            </td>
            <td class="px-2 py-2 align-top whitespace-nowrap">
              <div class="flex flex-col leading-tight">
                <span class="font-mono text-osrs-green text-sm">
                  {{ formatPrice(item.buyPrice) }}
                </span>
                <span class="text-osrs-muted text-xs">Buy (low)</span>
              </div>
            </td>
            <td class="px-2 py-2 align-top whitespace-nowrap">
              <span class="font-mono text-osrs-text text-sm">
                {{ formatPrice(item.margin) }}
              </span>
            </td>
            <td class="px-2 py-2 align-top whitespace-nowrap">
              <span class="font-mono text-osrs-muted text-sm">
                {{ formatPrice(item.tax) }}
              </span>
            </td>
            <td class="px-2 py-2 align-top whitespace-nowrap">
              <span class="font-mono text-osrs-accentDark text-sm">
                {{ formatPrice(item.profit) }}
              </span>
            </td>
            <td class="px-2 py-2 align-top whitespace-nowrap">
              <span class="font-mono text-osrs-text text-sm">
                {{ formatPercent(item.roi) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Bottom scroll indicator -->
      <div class="scroll-indicator-bottom absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-osrs-panel/90 to-transparent pointer-events-none z-20 opacity-0 transition-opacity"></div>
    </div>
  </div>
</template>
