import { Item, LatestPrice } from "../models";

export type DerivedStats = {
    buy: number;
    sell: number;
    margin: number;
    tax: number;
    profit: number;
    roi: number | null;
    base: number;
};

const SPRITE_BASE_URL = "https://secure.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=";

export const getWikiIconUrl = (icon: string | undefined, baseUrl: string): string => {
    if (!icon) return "";
    const file = icon.replace(/ /g, "_");
    return `${baseUrl}${encodeURIComponent(file)}`;
};

export const resolveIcons = (item: Item, iconBaseUrl: string): { icon: string } => {
    const wikiIcon = getWikiIconUrl(item.icon, iconBaseUrl);
    const sprite = `${SPRITE_BASE_URL}${item.id}`;
    const icon = wikiIcon || sprite;
    return { icon };
};

export const deriveStats = (item: Item, latest?: LatestPrice | null): DerivedStats => {
    const base = item.value ?? item.highalch ?? item.lowalch ?? 0;
    const buy = typeof latest?.low === "number" ? latest.low : typeof item.lowalch === "number" ? item.lowalch : base;
    const sell = typeof latest?.high === "number" ? latest.high : typeof item.highalch === "number" ? item.highalch : base;
    const margin = sell - buy;
    const tax = sell * 0.01;
    const profit = margin - tax;
    const roi = buy > 0 ? Number(((profit / buy) * 100).toFixed(2)) : null;

    return { base, buy, sell, margin, tax, profit, roi };
};
