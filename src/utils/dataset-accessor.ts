import type { DataSetAccessor, DatasetData, DatasetItem } from "../types.js";

/** kebab-case → camelCase: youtube-playlists → youtubePlaylists */
export function datasetKeyToAlias(key: string): string {
  return key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

/** camelCase → kebab-case: youtubePlaylists → youtube-playlists */
export function aliasToDatasetKey(alias: string): string {
  return alias.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

export function createDataSetAccessor(data: DatasetData): DataSetAccessor {
  const base = {
    items: data.items ?? [],
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

  return new Proxy(base, {
    get(target, prop, receiver) {
      if (prop in target || typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }

      const field = String(prop);
      const first = target.items[0];
      if (first && field in first) {
        return first[field];
      }

      return undefined;
    },
  }) as DataSetAccessor;
}

export function buildDataSetStore(
  datasets: Record<string, DatasetData>,
  meta: { isLoading: boolean; isReady: boolean },
): Record<string, DataSetAccessor> & {
  keys: string[];
  isLoading: boolean;
  isReady: boolean;
} {
  const accessors: Record<string, DataSetAccessor> = {};
  const shortAliases = new Map<string, string>();

  for (const [key, data] of Object.entries(datasets)) {
    const accessor = createDataSetAccessor(data);
    accessors[key] = accessor;
    accessors[datasetKeyToAlias(key)] = accessor;

    const shortKey = key.split("-")[0];
    if (shortKey && shortKey !== key && !shortAliases.has(shortKey)) {
      shortAliases.set(shortKey, key);
    }
  }

  for (const [shortKey, fullKey] of shortAliases) {
    if (!accessors[shortKey]) {
      accessors[shortKey] = accessors[fullKey];
    }
  }

  return Object.assign(accessors, {
    keys: Object.keys(datasets),
    isLoading: meta.isLoading,
    isReady: meta.isReady,
  });
}
