<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { getItemGraph } from "@/services/item";
import { formatPrice } from "@/utils/formatPrice";

const crosshairPlugin = {
  id: "crosshair",
  afterDatasetsDraw(chart: any, _args: unknown, opts: any) {
    const active = chart.getActiveElements?.() ?? [];
    if (!active.length) return;

    const { ctx, chartArea } = chart;
    const { top, bottom } = chartArea;
    const first = active[0];
    const { x } = first.element.getProps(["x"], true);

    const stroke = opts?.color || "#9ca3af";

    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = opts?.width ?? 1;
    ctx.setLineDash(opts?.dash ?? [4, 4]);

    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();

    ctx.restore();
  },
};

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  crosshairPlugin,
);

export type GraphSeries = Record<string, number>;
export interface GraphData {
  high?: GraphSeries;
  low?: GraphSeries;
  daily?: GraphSeries;
  average?: GraphSeries;
}

const props = defineProps<{
  itemId: number;
  title?: string;
  graph?: GraphData | null;
}>();

const isLoading = ref(false);
const error = ref<string | null>(null);
const graphData = ref<GraphData | null>(props.graph ?? null);
type RangeKey = "live" | "week" | "month" | "year";
const range = ref<RangeKey>("live");
const showSell = ref(true);
const showBuy = ref(true);

const ranges: Array<{
  value: RangeKey;
  label: string;
  timestep: "5m" | "1h" | "6h" | "24h";
  windowSec: number | null;
}> = [
  { value: "live", label: "Live", timestep: "5m", windowSec: 24 * 60 * 60 },
  { value: "week", label: "Week", timestep: "1h", windowSec: 7 * 24 * 60 * 60 },
  { value: "month", label: "Month", timestep: "6h", windowSec: 30 * 24 * 60 * 60 },
  { value: "year", label: "Year", timestep: "24h", windowSec: 365 * 24 * 60 * 60 },
];

const currentRange = computed(() => ranges.find((r) => r.value === range.value)!);

type Point = { t: number; price: number };

const points = computed<{ high: Point[]; low: Point[]; base: Point[] }>(() => {
  const high = graphData.value?.high ?? graphData.value?.daily ?? {};
  const low = graphData.value?.low ?? {};

  const normalize = (series: GraphSeries) =>
    Object.entries(series)
      .map(([time, price]) => {
        const rawT = Number(time);
        const t = rawT > 10_000_000_000 ? Math.floor(rawT / 1000) : rawT;
        return { t, price: Number(price) };
      })
      .sort((a, b) => a.t - b.t);

  const highPoints = normalize(high);
  const lowPoints = normalize(low);

  const entries = highPoints.length ? highPoints : lowPoints;

  if (!entries.length) return { high: [], low: [], base: [] };

  const filtered = (() => {
    const windowSec = currentRange.value.windowSec;
    if (windowSec !== null) {
      const latest = entries[entries.length - 1]?.t ?? 0;
      const cutoff = latest - windowSec;
      const windowed = entries.filter((e) => e.t >= cutoff);
      if (windowed.length) {
        return windowed;
      }
    }
    return entries;
  })();

  const usable =
    filtered.length >= 2 ? filtered : entries.slice(-Math.max(2, filtered.length || 50));

  const baseSet = new Set(usable.map((p) => p.t));

  return {
    high: highPoints.filter((p) => baseSet.has(p.t)),
    low: lowPoints.filter((p) => baseSet.has(p.t)),
    base: usable,
  };
});

const showLoadingState = computed(() => isLoading.value && !points.value.base.length);

const chartFont = { family: "RuneScapeSmall", size: 18 };

const baseTimes = computed(() => points.value.base.map((p) => p.t));

const tickConfig = computed(() => {
  const r = range.value;
  if (r === "live") {
    return {
      maxTicks: 72,
      format: (ts: number) => {
        const d = new Date(ts * 1000);
        return d.getMinutes() === 0 && d.getHours() % 2 === 0
          ? d.toLocaleTimeString([], { hour: "numeric" })
          : "";
      },
    };
  }
  if (r === "week") {
    return {
      maxTicks: 10,
      format: (ts: number, index: number) => {
        const day = Math.floor(ts / 86400);
        const prevTime = index > 0 ? baseTimes.value[index - 1] : null;
        const prevDay = prevTime !== null && prevTime !== undefined ? Math.floor(prevTime / 86400) : null;
        if (prevDay === day) return "";
        return new Date(ts * 1000).toLocaleDateString([], { weekday: "short" });
      },
    };
  }
  if (r === "month") {
    return {
      maxTicks: 32,
      format: (ts: number, index: number) => {
        const day = Math.floor(ts / 86400);
        const prevTime = index > 0 ? baseTimes.value[index - 1] : null;
        const prevDay = prevTime !== null && prevTime !== undefined ? Math.floor(prevTime / 86400) : null;
        if (prevDay === day) return "";
        return day % 2 === 0
          ? new Date(ts * 1000).toLocaleDateString([], { month: "short", day: "numeric" })
          : "";
      },
    };
  }
  if (r === "year") {
    return {
      maxTicks: 18,
      format: (ts: number, index: number) => {
        const day = Math.floor(ts / 86400);
        const prevTime = index > 0 ? baseTimes.value[index - 1] : null;
        const prevDay = prevTime !== null && prevTime !== undefined ? Math.floor(prevTime / 86400) : null;
        if (prevDay === day) return "";
        const d = new Date(ts * 1000);
        return d.getDate() === 1
          ? d.toLocaleDateString([], { month: "short" }) +
              (d.getMonth() === 0 ? ` ${d.getFullYear()}` : "")
          : "";
      },
    };
  }
  return {
    maxTicks: 24,
    format: (ts: number, index: number) => {
      const day = Math.floor(ts / 86400);
      const prevTime = index > 0 ? baseTimes.value[index - 1] : null;
      const prevDay = prevTime !== null && prevTime !== undefined ? Math.floor(prevTime / 86400) : null;
      if (prevDay === day) return "";
      const d = new Date(ts * 1000);
      return d.getDate() === 1 && d.getMonth() % 2 === 0
        ? d.toLocaleDateString([], { month: "short" }) +
            (d.getMonth() === 0 ? ` ${d.getFullYear()}` : "")
        : "";
    },
  };
});

const chartData = computed(() => {
  const labels = baseTimes.value.map((t) => String(t));
  const datasets: any[] = [];

  const highMap = new Map(points.value.high.map((p) => [p.t, p.price]));
  const lowMap = new Map(points.value.low.map((p) => [p.t, p.price]));

  if (showSell.value) {
    datasets.push({
      label: "Sell (high)",
      data: baseTimes.value.map((t) => highMap.get(t) ?? null),
      borderColor: "#e4c076",
      backgroundColor: "rgba(228,192,118,0.15)",
      borderWidth: 2,
      fill: false,
      tension: 0,
      pointRadius: 0,
    });
  }

  if (showBuy.value && points.value.low.length) {
    datasets.push({
      label: "Buy (low)",
      data: baseTimes.value.map((t) => lowMap.get(t) ?? null),
      borderColor: "#7ec982",
      backgroundColor: "rgba(126,201,130,0.15)",
      borderWidth: 2,
      fill: false,
      tension: 0,
      pointRadius: 0,
    });
  }

  return { labels, datasets };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  scales: {
    x: {
      position: "bottom" as const,
      grid: {
        color: "#3a2a1a",
        drawOnChartArea: true,
        tickLength: 0,
        display: true,
      },
      ticks: {
        color: "#d1c098",
        font: chartFont,
        maxRotation: 0,
        autoSkip: false,
        maxTicksLimit: tickConfig.value.maxTicks,
        callback: (_val: unknown, index: number) => {
          const ts = baseTimes.value[index];
          if (!ts) return "";
          return tickConfig.value.format(ts, index);
        },
      },
      title: {
        display: true,
        text: "Time",
        color: "#d1c098",
        font: { size: 22, family: "RuneScapeSmall" },
      },
    },
    y: {
      grid: { color: "#3a2a1a" },
      ticks: {
        color: "#d1c098",
        font: chartFont,
        callback: (val: unknown) => formatPrice(Number(val)),
        maxTicksLimit: 6,
      },
      title: {
        display: true,
        text: "Price (gp)",
        color: "#d1c098",
        font: { size: 22, family: "RuneScapeSmall" },
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items: Array<{ dataIndex: number }>) => {
          const idx = items[0]?.dataIndex ?? 0;
          const ts = baseTimes.value[idx];
          if (!ts) return "";
          const date = new Date(ts * 1000);
          if (range.value === "live") {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          }
          const includeYear = range.value === "year";
          return date.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            ...(includeYear ? { year: "numeric" } : {}),
          });
        },
        label: (tooltipItem: any) => {
          const y = tooltipItem?.parsed?.y ?? tooltipItem?.parsed ?? 0;
          const label = tooltipItem?.dataset?.label || "Price";
          return `${label}: ${formatPrice(y)}`;
        },
        labelColor: (context: any) => {
          const isSell = context.dataset?.label?.toLowerCase()?.includes("sell");
          const color = isSell ? "#e4c076" : "#7ec982";
          return { borderColor: color, backgroundColor: color };
        },
        labelTextColor: () => "#f5f3ed",
      },
      mode: "index" as const,
      intersect: false,
      titleFont: { family: "RuneScapeSmall", size: 22 },
      bodyFont: { family: "RuneScapeSmall", size: 22 },
    },
    crosshair: { color: "#9ca3af", width: 1.2, dash: [4, 3] },
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 12,
      hoverRadius: 10,
    },
  },
}));

const fetchGraph = async () => {
  if (props.graph) {
    graphData.value = props.graph;
    return;
  }
  try {
    isLoading.value = true;
    error.value = null;
    const { data } = await getItemGraph(props.itemId, currentRange.value.timestep);

    const high: GraphSeries = {};
    const low: GraphSeries = {};

    for (const point of data) {
      const ts = Number(point.timestamp);
      if (!Number.isFinite(ts)) continue;
      if (point.avgHighPrice !== null && point.avgHighPrice !== undefined) {
        high[String(ts)] = Number(point.avgHighPrice);
      }
      if (point.avgLowPrice !== null && point.avgLowPrice !== undefined) {
        low[String(ts)] = Number(point.avgLowPrice);
      }
    }

    graphData.value = { high, low };
  } catch (err) {
    console.error("Failed to load item graph", err);
    error.value = "Failed to load price graph.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (!graphData.value) {
    await fetchGraph();
  }
});

watch(
  () => props.itemId,
  async () => {
    graphData.value = props.graph ?? null;
    await fetchGraph();
  },
);

watch(
  () => range.value,
  async () => {
    await fetchGraph();
  },
);

watch(
  () => graphData.value,
  async () => {
    await nextTick();
  },
);
</script>

<template>
  <div class="w-full">
    <div class="flex items-center gap-3 mb-3 flex-wrap">
      <div class="flex gap-2 items-center text-xs text-osrs-muted">
        <span>Range:</span>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="opt in ranges"
            :key="opt.value"
            class="px-2 py-1 rounded border text-xs transition"
            :class="[
              range === opt.value
                ? 'bg-osrs-accent text-osrs-panel border-osrs-accent'
                : 'bg-osrs-panel text-osrs-muted border-osrs-border hover:border-osrs-accent',
            ]"
            @click="range = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      <label class="flex items-center gap-1 text-xs text-osrs-muted">
        <input type="checkbox" v-model="showBuy" class="accent-osrs-green" />
        Buy (low)
      </label>
      <label class="flex items-center gap-1 text-xs text-osrs-muted">
        <input type="checkbox" v-model="showSell" class="accent-osrs-accent" />
        Sell (high)
      </label>
    </div>
    <div v-if="showLoadingState" class="text-xs text-osrs-muted">Loading graph...</div>
    <div v-else-if="error" class="text-xs text-osrs-red">{{ error }}</div>
    <div v-else-if="!points.base.length" class="text-xs text-osrs-muted">
      No graph data available.
    </div>
    <div v-else class="space-y-1">
      <div
        class="bg-osrs-panel/60 border border-osrs-border rounded-md p-4 h-[360px] sm:h-[520px] md:h-[560px] overflow-hidden"
      >
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
