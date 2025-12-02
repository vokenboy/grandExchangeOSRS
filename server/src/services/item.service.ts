import axios from "axios";
import {
    GraphSeries,
    Item,
    ItemDetail,
    ItemDetailResult,
    LatestPrice,
    PricePoint,
    Timestep,
} from "../models";
import { NotFoundError, UpstreamError } from "../utils/errors";
import { DerivedStats, deriveStats, resolveIcons } from "../utils/itemUtils";

// exposed via environment variables for flexibility
const WIKI_BASE_URL = process.env.OSRS_WIKI_BASE_URL || "https://prices.runescape.wiki/api/v1/osrs";
const WIKI_ICON_BASE_URL =
    process.env.OSRS_WIKI_ICON_BASE_URL || "https://oldschool.runescape.wiki/images/";
const WIKI_USER_AGENT =
    process.env.OSRS_WIKI_USER_AGENT || "osrsweb-dev/1.0 (+https://oldschool.runescape.wiki/)";

const WIKI_MAPPING_TTL_MS = 6 * 60 * 60 * 1000;
const WIKI_LATEST_TTL_MS = 2 * 60 * 1000;
const ALLOWED_TIMESTEPS = new Set<Timestep>(["5m", "1h", "6h", "24h"]);

const api = axios.create({
    baseURL: WIKI_BASE_URL,
    timeout: 2000,
    headers: {
        "User-Agent": WIKI_USER_AGENT,
    },
});

type SortKey = "name" | "sell" | "buy" | "margin" | "tax" | "profit" | "roi";
type SortDir = "asc" | "desc";

const SORT_KEYS = new Set<SortKey>(["name", "sell", "buy", "margin", "tax", "profit", "roi"]);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const upstreamMsg =
                (error.response?.data as { error?: string } | undefined)?.error ||
                error.message ||
                "Upstream error";

            if (status === 404) {
                return Promise.reject(new NotFoundError("Resource not found"));
            }
            if (status === 429) {
                return Promise.reject(new UpstreamError("Rate limited by OSRS Wiki", status));
            }
            if (status && status >= 500) {
                return Promise.reject(new UpstreamError("OSRS Wiki service unavailable", status));
            }

            return Promise.reject(new UpstreamError(upstreamMsg, status));
        }

        return Promise.reject(error);
    }
);

let itemCache: Item[] | null = null;
let itemCacheFetchedAt = 0;
let latestPriceCache: Record<string, LatestPrice> = {};
let latestPriceFetchedAt = 0;

export const normalizeTimestep = (raw?: string): Timestep =>
    ALLOWED_TIMESTEPS.has(raw as Timestep) ? (raw as Timestep) : "6h";

export const getItems = async (): Promise<Item[]> => {
    const now = Date.now();

    if (itemCache && now - itemCacheFetchedAt < WIKI_MAPPING_TTL_MS) {
        return itemCache;
    }

    try {
        const { data } = await api.get<Item[]>("/mapping");

        if (!Array.isArray(data)) {
            throw new Error("Unexpected mapping response from OSRS Wiki");
        }

        itemCache = data;
        itemCacheFetchedAt = now;

        return itemCache;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to fetch wiki mapping");
    }
};

export const getItem = async (id: number): Promise<Item | null> => {
    const items = await getItems();
    return items.find((item) => item.id === id) ?? null;
};

export const getLatestPrices = async (): Promise<Record<string, LatestPrice>> => {
    const now = Date.now();

    if (latestPriceFetchedAt && now - latestPriceFetchedAt < WIKI_LATEST_TTL_MS) {
        return latestPriceCache;
    }

    try {
        const { data } = await api.get("/latest");

        if (!data || !data.data) {
            throw new Error("Unexpected latest price response from OSRS Wiki");
        }

        latestPriceCache = data.data as Record<string, LatestPrice>;
        latestPriceFetchedAt = now;

        return latestPriceCache;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to fetch latest prices");
    }
};

const mapItemToDetail = (itemInfo: Item, latest?: LatestPrice | null): ItemDetailResult => {
    const baseValue = itemInfo.value ?? itemInfo.highalch ?? itemInfo.lowalch ?? 0;
    const buyPrice = typeof latest?.low === "number" ? latest.low : null;
    const sellPrice = typeof latest?.high === "number" ? latest.high : null;
    const priceFallback = sellPrice ?? buyPrice ?? baseValue ?? 0;

    const { icon } = resolveIcons(itemInfo, WIKI_ICON_BASE_URL);

    const item: ItemDetail = {
        id: itemInfo.id,
        name: itemInfo.name,
        description: itemInfo.examine ?? "",
        icon,
        type: "",
        typeIcon: "",
        current: { trend: "neutral", price: priceFallback },
        today: { trend: "neutral", price: priceFallback },
        members: itemInfo.members ? "true" : "false",
        buyPrice,
        sellPrice,
        latestSell: sellPrice,
        latestSellTime: latest?.highTime ?? null,
        latestBuyTime: latest?.lowTime ?? null,
        highAlch: itemInfo.highalch ?? null,
        lowAlch: itemInfo.lowalch ?? null,
        limit: itemInfo.limit ?? null,
        value: itemInfo.value ?? null,
    };

    return { item, latest: latest ?? null };
};

const getPriceSeries = async (id: number, timestep: Timestep): Promise<PricePoint[]> => {
    try {
        const { data } = await api.get("/timeseries", {
            params: { id, timestep },
        });
        return (data?.data ?? []) as PricePoint[];
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to fetch timeseries");
    }
};

export const getItemDetail = async (id: number): Promise<ItemDetailResult> => {
    const [item, latestPrices] = await Promise.all([getItem(id), getLatestPrices()]);

    if (!item) {
        throw new NotFoundError("Item not found");
    }

    const latest = latestPrices[String(id)] ?? null;
    return mapItemToDetail(item, latest);
};

export const getItemGraph = async (id: number, timestep: Timestep) => {
    const series = await getPriceSeries(id, timestep);
    return { data: series, itemId: id };
};

export const searchItems = async (
    term: string,
    page: number,
    pageSize: number,
    sortKey?: string | null,
    sortDir?: string | null
) => {
    const [items, latestPrices] = await Promise.all([getItems(), getLatestPrices()]);

    const filtered = term
        ? items.filter((item) => item.name.toLowerCase().includes(term.toLowerCase()))
        : items;

    const key = SORT_KEYS.has(sortKey as SortKey) ? (sortKey as SortKey) : null;
    const dir: SortDir = sortDir === "asc" ? "asc" : "desc";
    const dirMult = dir === "asc" ? 1 : -1;

    const statsMap = new Map<number, DerivedStats>();
    for (const item of filtered) {
        const latest = latestPrices[String(item.id)] ?? null;
        statsMap.set(item.id, deriveStats(item, latest));
    }

    const sorted =
        key === null
            ? [...filtered].sort((a, b) => a.name.localeCompare(b.name, "en"))
            : [...filtered].sort((a, b) => {
                  if (key === "name") {
                      return a.name.localeCompare(b.name, "en") * dirMult;
                  }
                  const aStats = statsMap.get(a.id)!;
                  const bStats = statsMap.get(b.id)!;
                  const aVal = (aStats as Record<string, number | null>)[key];
                  const bVal = (bStats as Record<string, number | null>)[key];
                  const av = aVal === null ? -Infinity : (aVal as number);
                  const bv = bVal === null ? -Infinity : (bVal as number);
                  if (av < bv) return -1 * dirMult;
                  if (av > bv) return 1 * dirMult;
                  return 0;
              });

    const total = sorted.length;
    const totalPages = total ? Math.ceil(total / pageSize) : 0;
    const effectivePage = totalPages && page > totalPages ? totalPages : page;

    const start = (effectivePage - 1) * pageSize;
    const pagedItems = sorted.slice(start, start + pageSize).map((item) => {
        const { icon } = resolveIcons(item, WIKI_ICON_BASE_URL);
        const stats =
            statsMap.get(item.id) ?? deriveStats(item, latestPrices[String(item.id)] ?? null);
        return {
            ...item,
            icon,
            buyPrice: stats.buy,
            sellPrice: stats.sell,
            latestSell: stats.sell,
            margin: stats.margin,
            tax: stats.tax,
            profit: stats.profit,
            roi: stats.roi,
        } as Item;
    });

    return { items: pagedItems, page: effectivePage, pageSize, total, totalPages };
};
