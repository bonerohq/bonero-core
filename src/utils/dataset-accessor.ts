import type { BoneroDatasetData, DataSetAccessor, DatasetItem } from "../types";

export function createDataSetAccessorMap(
  datasets: Record<string, BoneroDatasetData>,
): Record<string, DataSetAccessor> {
  return Object.fromEntries(
    Object.entries(datasets).map(([key, data]) => [key, createDataSetAccessor(data)]),
  );
}

function matchesWhere(item: DatasetItem, where?: Record<string, string | number | boolean>): boolean {
  if (!where) return true;
  return Object.entries(where).every(([field, value]) => item[field] === value);
}

function sortOrderValue(item: DatasetItem): number {
  const value = item.sortOrder;
  return typeof value === "number" ? value : 0;
}

function sliceItems<T>(items: T[], take?: number, skip?: number): T[] {
  const start = skip ?? 0;
  const end = take !== undefined ? start + take : undefined;
  return items.slice(start, end);
}

export function createDataSetAccessor(
  data: BoneroDatasetData,
  options?: {
    where?: Record<string, string | number | boolean>;
    take?: number;
    skip?: number;
  },
): DataSetAccessor {
  const filtered = sliceItems(
    (data.items ?? []).filter((item) => matchesWhere(item, options?.where)),
    options?.take,
    options?.skip,
  ).sort((a, b) => sortOrderValue(a) - sortOrderValue(b));

  const base = {
    items: filtered,
    key: data.key,
    title: data.title,
    description: data.description,
    at(index: number) {
      return base.items[index];
    },
    filter(predicate: (item: DatasetItem) => boolean) {
      return base.items.filter(predicate);
    },
    get(field: string, index = 0) {
      return base.items[index]?.[field];
    },
  };

  return base;
}
