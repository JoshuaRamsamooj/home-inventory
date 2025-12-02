import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

export function getRangeArray(min, max) {
    if (min === null || max === null) return [];
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

export function getBinsForArea(areaConfig) {
    if (!areaConfig || areaConfig.bin_start === null) return [];
    return getRangeArray(areaConfig.bin_start, areaConfig.bin_end);
}

export function getShelvesForArea(areaConfig) {
    if (!areaConfig || areaConfig.shelf_start === null) return [];
    return getRangeArray(areaConfig.shelf_start, areaConfig.shelf_end);
}

export function formatLocation(item) {
    if (!item) return 'Unknown';
    const parts = [item.area];
    const details = [];
    if (item.bin) details.push(`Bin ${item.bin}`);
    if (item.shelf) details.push(`Shelf ${item.shelf}`);

    if (details.length > 0) {
        return `${item.area} - ${details.join(', ')}`;
    }
    return item.area;
}
