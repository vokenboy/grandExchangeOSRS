import { type ItemPrice } from "@/types/ItemPrice";

export interface Item {
  id: number;
  name: string;
  examine?: string;
  description?: string;
  value?: number | null;
  highalch?: number | null;
  lowalch?: number | null;
  highAlch?: number | null;
  lowAlch?: number | null;
  limit?: number | null;
  icon: string;
  icon_large?: string;
  type?: string;
  typeIcon?: string;
  current?: ItemPrice;
  today?: ItemPrice;
  members: string | boolean;
  buyPrice?: number | string | null;
  sellPrice?: number | string | null;
  latestSell?: number | string | null;
  latestSellTime?: number | null;
  margin?: number | null;
  tax?: number | null;
  profit?: number | null;
  roi?: number | null;
}
