import { LatestPrice } from "./Price";

export interface ItemDetail {
    id: number;
    name: string;
    description: string;
    icon: string;
    type: string;
    typeIcon: string;
    current: { trend: string; price: number };
    today: { trend: string; price: number };
    members: string;
    buyPrice?: number | null;
    sellPrice?: number | null;
    latestSell?: number | null;
    latestSellTime?: number | null;
    latestBuyTime?: number | null;
    highAlch?: number | null;
    lowAlch?: number | null;
    limit?: number | null;
    value?: number | null;
}

export type ItemDetailResult = {
    item: ItemDetail;
    latest: LatestPrice | null;
};
