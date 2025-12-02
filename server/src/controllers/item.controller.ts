import { Request, Response } from "express";
import {
    getItemDetail,
    getItemGraph,
    normalizeTimestep,
    searchItems as searchItemsService,
} from "../services/item.service";
import { parseNumericId, parsePositiveInt } from "../utils/validation";
import { ApiError } from "../utils/errors";

const DEFAULT_PAGE_SIZE = 11;
const MAX_PAGE_SIZE = 100;

const sendError = (res: Response, err: unknown) => {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Unexpected error";
    res.status(status).json({ error: message });
};

export const getItemDetailHandler = async (req: Request, res: Response) => {
    try {
        const itemId = parseNumericId(req.params.id, "item id");
        const detail = await getItemDetail(itemId);
        res.json(detail);
    } catch (err) {
        sendError(res, err);
    }
};

export const getItemGraphHandler = async (req: Request, res: Response) => {
    try {
        const itemId = parseNumericId(req.params.id, "item id");
        const timestep = normalizeTimestep(
            typeof req.query.timestep === "string" ? req.query.timestep : undefined
        );
        const graph = await getItemGraph(itemId, timestep);
        res.json(graph);
    } catch (err) {
        sendError(res, err);
    }
};

export const getItemsHandler = async (req: Request, res: Response) => {
    try {
        const rawTerm = String(req.query.q ?? "")
            .toLowerCase()
            .trim();
        const page = parsePositiveInt(req.query.page as string | undefined, 1);
        const pageSize = parsePositiveInt(
            req.query.pageSize as string | undefined,
            DEFAULT_PAGE_SIZE,
            MAX_PAGE_SIZE
        );
        const sortKey = typeof req.query.sortKey === "string" ? req.query.sortKey : undefined;
        const sortDir = typeof req.query.sortDir === "string" ? req.query.sortDir : undefined;

        const result = await searchItemsService(rawTerm, page, pageSize, sortKey, sortDir);
        const { items, page: resolvedPage, total, totalPages } = result;
        res.json({ items, page: resolvedPage, total, totalPages });
    } catch (err) {
        sendError(res, err);
    }
};
