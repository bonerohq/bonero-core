import "server-only";

import { cache } from "react";
import { getBoneroConfig } from "../config";
import type { BoneroConfig, BoneroInitialDataConfig, BoneroResolvedInitialData } from "../types";
import { createDataSetAccessorMap } from "../utils/dataset-accessor";
import { createBoneroAccessor } from "./accessor";
import { resolveInitialData } from "./initial-data";

export type BoneroRequestStore = {
  config: BoneroConfig;
  initialData: BoneroResolvedInitialData;
  dataSet: ReturnType<typeof createDataSetAccessorMap>;
};

const loadBoneroRequestStore = cache(
  async (apiKey: string, schemaKey: string): Promise<BoneroRequestStore> => {
    const schema = parseSchemaKey(schemaKey);
    const config = getBoneroConfig({ apiKey });
    const accessor = createBoneroAccessor(config);
    const [initialData, datasets] = await Promise.all([
      Object.keys(schema).length > 0
        ? resolveInitialData(config, schema)
        : Promise.resolve({} as BoneroResolvedInitialData),
      accessor.datasets(),
    ]);

    return {
      config,
      initialData,
      dataSet: createDataSetAccessorMap(datasets),
    };
  },
);

type RequestStoreSlot = {
  value: BoneroRequestStore | null;
  inflight: Promise<BoneroRequestStore> | null;
  schema: BoneroInitialDataConfig | null;
  resolveSchema: ((schema: BoneroInitialDataConfig) => void) | null;
  schemaPromise: Promise<BoneroInitialDataConfig>;
};

const getRequestStoreSlot = cache((): RequestStoreSlot => {
  const slot: RequestStoreSlot = {
    value: null,
    inflight: null,
    schema: null,
    resolveSchema: null,
    schemaPromise: Promise.resolve({}),
  };

  slot.schemaPromise = new Promise<BoneroInitialDataConfig>((resolve) => {
    slot.resolveSchema = resolve;
  });

  return slot;
});

function toSchemaKey(schema: BoneroInitialDataConfig): string {
  return JSON.stringify(schema);
}

function parseSchemaKey(schemaKey: string): BoneroInitialDataConfig {
  if (!schemaKey) return {};
  return JSON.parse(schemaKey) as BoneroInitialDataConfig;
}

export function registerBoneroInitialDataSchema(schema: BoneroInitialDataConfig): void {
  const slot = getRequestStoreSlot();
  slot.schema = schema;
  slot.resolveSchema?.(schema);
  slot.resolveSchema = null;
}

export function getRegisteredBoneroInitialDataSchema(): BoneroInitialDataConfig | null {
  return getRequestStoreSlot().schema;
}

/** Provider henüz register etmediyse şemayı bekler (Next.js layout/page paralel render). */
export async function waitForBoneroInitialDataSchema(
  explicit?: BoneroInitialDataConfig,
): Promise<BoneroInitialDataConfig> {
  if (explicit) {
    registerBoneroInitialDataSchema(explicit);
    return explicit;
  }

  const slot = getRequestStoreSlot();
  if (slot.schema) return slot.schema;

  return Promise.race([
    slot.schemaPromise,
    new Promise<BoneroInitialDataConfig>((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            "Bonero.initialData: şema gelmedi. Layout'ta <BoneroProvider initialData={...}> kullanın.",
          ),
        );
      }, 10_000);
    }),
  ]);
}

export async function resolveBoneroRequestStore(
  config: BoneroConfig,
  schema: BoneroInitialDataConfig = {},
): Promise<BoneroRequestStore> {
  const slot = getRequestStoreSlot();
  registerBoneroInitialDataSchema(schema);

  if (slot.value) {
    return slot.value;
  }

  if (!slot.inflight) {
    slot.inflight = loadBoneroRequestStore(config.apiKey, toSchemaKey(schema)).then((store) => {
      slot.value = store;
      return store;
    });
  }

  return slot.inflight;
}

export function getBoneroRequestStore(): BoneroRequestStore | undefined {
  return getRequestStoreSlot().value ?? undefined;
}

export function getBoneroRequestStoreInflight(): Promise<BoneroRequestStore> | null {
  return getRequestStoreSlot().inflight;
}

export function setBoneroRequestStore(next: BoneroRequestStore): void {
  getRequestStoreSlot().value = next;
}
