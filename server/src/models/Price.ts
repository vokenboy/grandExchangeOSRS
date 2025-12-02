export type LatestPrice = {
    high: number | null;
    highTime: number | null;
    low: number | null;
    lowTime: number | null;
};

export type PricePoint = {
    timestamp: number;
    avgHighPrice: number | null;
    avgLowPrice: number | null;
};

export type Timestep = "5m" | "1h" | "6h" | "24h";
export type GraphSeries = Record<string, number>;
