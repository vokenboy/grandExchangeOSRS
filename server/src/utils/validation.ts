import { BadRequestError } from "./errors";

export function parseNumericId(value: string | undefined, fieldName: string): number {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        throw new BadRequestError(`Missing or invalid ${fieldName}`);
    }
    return numericValue;
}

export function parsePositiveInt(value: string | number | undefined, fallback: number, max?: number): number {
    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return fallback;
    }
    const intValue = Math.floor(numericValue);
    if (typeof max === "number") {
        return Math.min(intValue, max);
    }
    return intValue;
}
