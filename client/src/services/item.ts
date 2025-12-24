import api from "./api";
import { type Timestep } from "../types/Timestep";
import { type SortDir } from "../types/SortDir";
import { type SortKey } from "../types/SortKey";
import { type ItemGraphPoint } from "../types/ItemGraph";
import type { Item } from "@/types/Item";

export interface ItemGraphSeries {
  data: ItemGraphPoint[];
  itemId: number;
}

export const getItems = async (
  query: string,
  page = 1,
  pageSize: number = 11,
  sortKey: SortKey = null,
  sortDir: SortDir = null,
) => {
  const term = query.trim();
  const { data } = await api.get<Item[]>("/api/items", {
    params: {
      q: term,
      page,
      pageSize,
      sortKey: sortKey,
      sortDir: sortDir,
    },
  });
  return data;
};

export const getItem = async (itemId: number) => {
  const { data } = await api.get<Item>(`/api/item/${itemId}/detail`);
  return data;
};

export const getItemGraph = async (itemId: number, timestep: Timestep = "5m") => {
  const { data } = await api.get<ItemGraphSeries>(`/api/item/${itemId}/graph`, {
    params: { timestep },
  });
  return data;
};
