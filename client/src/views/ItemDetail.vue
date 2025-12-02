<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getItem } from "@/services/item";
import { formatPrice } from "@/utils/formatPrice";
import { formatPercent } from "@/utils/formatPercent";
import type { Item } from "@/types/Item";
import type { GraphData } from "@/components/ItemGraph.vue";
import ItemGraph from "@/components/ItemGraph.vue";

defineOptions({ name: "ItemDetailView" });

const route = useRoute();
const router = useRouter();

const handleBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: "home", query: route.query });
  }
};

const item = ref<Item | null>(null);
const enriched = ref<Item | null>(null);
const graphData = ref<GraphData | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

type EnrichedInfo = Item & {
  latestBuyTime?: number | null;
  latestSellTime?: number | null;
  buyPrice?: number | string | null;
  sellPrice?: number | string | null;
};

const taxRate = 0.01;
const asNumber = (val: unknown): number => {
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
};
const asNullableNumber = (val: unknown): number | null => {
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
};

const stats = computed(() => {
  const base = (enriched.value as EnrichedInfo | null) ?? (item.value as EnrichedInfo | null);
  if (!base) {
    return {
      buy: null,
      sell: null,
      margin: null,
      tax: null,
      profit: null,
      roi: null,
      volume: null,
      potentialProfit: null,
      buyTime: null,
      sellTime: null,
      highAlch: null,
      lowAlch: null,
    };
  }

  const buy = asNumber(base.buyPrice ?? base.current?.price);
  const sell = asNumber(base.sellPrice ?? base.current?.price);
  const margin = sell - buy;
  const tax = sell * taxRate;
  const profit = margin - tax;
  const roi = buy > 0 ? (profit / buy) * 100 : null;

  const highAlch = asNullableNumber(base.highAlch ?? base.highalch);
  const lowAlch = asNullableNumber(base.lowAlch ?? base.lowalch);

  const rawVolume = base.limit ?? null;
  const volume = rawVolume === null ? null : asNullableNumber(rawVolume);
  const potentialProfit = volume !== null ? profit * volume : null;

  const buyTime = base.latestBuyTime ?? null;
  const sellTime = base.latestSellTime ?? null;

  return {
    buy,
    sell,
    margin,
    tax,
    profit,
    roi,
    volume,
    potentialProfit,
    buyTime,
    sellTime,
    highAlch,
    lowAlch,
  };
});

const formatTimeAgo = (epochSeconds: number | null) => {
  if (!epochSeconds) return "?";
  const ms = epochSeconds * 1000;
  const diff = Date.now() - ms;
  if (diff < 0) return "just now";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const wikiLink = computed(() =>
  item.value ? `https://prices.runescape.wiki/osrs/item/${item.value.id}` : null
);

const fetchItem = async (id: number) => {
  try {
    isLoading.value = true;
    error.value = null;

    const detail = await getItem(id);
    if (!detail?.item) throw new Error("Item not found");
    item.value = detail.item;
    enriched.value = detail.item;

    graphData.value = null;
  } catch (err) {
    console.error("Failed to load item", err);
    error.value = "Failed to load item.";
  } finally {
    isLoading.value = false;
  }
};

const syncFromRoute = () => {
  const idParam = route.params.id;
  const idNum = Number(idParam);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    router.push("/");
    return;
  }
  void fetchItem(idNum);
};

onMounted(syncFromRoute);
watch(
  () => route.params.id,
  () => syncFromRoute()
);
</script>

<template>
  <div class="min-h-screen px-3 py-4 sm:px-6 space-y-4">
    <button
      class="text-sm text-osrs-accent hover:text-osrs-accentDark underline"
      @click="handleBack"
    >
      <- Back to search
    </button>

    <section
      class="rounded-xl border border-osrs-border bg-osrs-panel/90 p-3 sm:p-5 shadow-osrs space-y-4 min-h-[860px]"
    >
      <div v-if="isLoading" class="text-osrs-muted text-sm">Loading item...</div>
      <div v-else-if="error" class="text-osrs-red text-sm">{{ error }}</div>
      <div v-else-if="item" class="space-y-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <img :src="item.icon" :alt="item.name" class="w-20 h-20 object-contain" />
          <div class="space-y-3 flex-1">
            <div class="flex items-center gap-4">
              <h1 class="text-2xl font-osrs text-osrs-text">{{ item.name }}</h1>
              <div v-if="wikiLink" class="text-sm">
                <a
                  :href="wikiLink"
                  class="text-osrs-accent hover:text-osrs-accentDark underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on OSRS Wiki
                </a>
              </div>
            </div>
            <p class="text-osrs-muted text-sm">{{ item.description }}</p>

            <div class="flex flex-wrap gap-4">
              <div>
                <div class="text-osrs-muted uppercase">Buy</div>
                <div class="font-mono text-osrs-green">
                  {{ formatPrice(stats.buy) }} ( {{ formatTimeAgo(stats.buyTime) }} )
                </div>
              </div>
              <div>
                <div class="text-osrs-muted uppercase">Sell</div>
                <div class="font-mono text-osrs-accent">
                  {{ formatPrice(stats.sell) }} ( {{ formatTimeAgo(stats.sellTime) }} )
                </div>
              </div>
              <div>
                <div class="text-osrs-muted uppercase">Margin</div>
                <div class="font-mono text-osrs-text">{{ formatPrice(stats.margin) }}</div>
              </div>
              <div>
                <div class="text-osrs-muted uppercase">Tax</div>
                <div class="font-mono text-osrs-muted">{{ formatPrice(stats.tax) }}</div>
              </div>
              <div>
                <div class="text-osrs-muted uppercase">Profit</div>
                <div class="font-mono text-osrs-accentDark">{{ formatPrice(stats.profit) }}</div>
              </div>
              <div>
                <div class="text-osrs-muted uppercase">ROI%</div>
                <div class="font-mono text-osrs-text">{{ formatPercent(stats.roi) }}</div>
              </div>
              <div>
                <div class="text-osrs-muted uppercase">High Alch</div>
                <div class="font-mono text-osrs-text">{{ formatPrice(stats.highAlch) }}</div>
              </div>
              <div>
                <div class="text-osrs-muted uppercase">Low Alch</div>
                <div class="font-mono text-osrs-text">{{ formatPrice(stats.lowAlch) }}</div>
              </div>
              <div>
                <div class="text-osrs-muted uppercase">Volume</div>
                <div class="font-mono text-osrs-text">
                  {{ stats.volume === null ? "?" : stats.volume.toLocaleString() }}
                </div>
              </div>
              <div>
                <div class="text-osrs-muted uppercase">Potential Profit</div>
                <div class="font-mono text-osrs-text">{{ formatPrice(stats.potentialProfit) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 min-h-[600px]">
          <ItemGraph :item-id="item.id" :graph="graphData" />
        </div>
      </div>
    </section>
  </div>
</template>
