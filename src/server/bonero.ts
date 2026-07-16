import "server-only";

import type {
  BoneroConfig,
  BoneroInitialDataConfig,
  BoneroResolvedInitialData,
  DataSetAccessor,
} from "../types";
import { createBoneroAccessor, type BoneroAccessor } from "./accessor";
import { getBoneroRequestStore, resolveBoneroRequestStore, type BoneroRequestStore } from "./request-store";

let currentConfig: BoneroConfig | null = null;
let currentAccessor: BoneroAccessor | null = null;

function ensureConfigured(): BoneroConfig {
  if (!currentConfig) {
    throw new Error(
      "Bonero.configure çağrılmamış. BoneroRoot veya layout'ta apiKey ile yapılandırın.",
    );
  }
  return currentConfig;
}

export const Bonero = {
  configure(config: BoneroConfig): void {
    currentConfig = config;
    currentAccessor = createBoneroAccessor(config);
  },

  get accessor(): BoneroAccessor {
    if (!currentAccessor) {
      currentAccessor = createBoneroAccessor(ensureConfigured());
    }
    return currentAccessor;
  },

  get config(): BoneroConfig | null {
    return currentConfig;
  },

  /** Layout'ta önceden yüklenmiş veri — önce `prepareInitialData` veya `resolveBoneroRequestStore` çağrılmalı. */
  get initialData(): BoneroResolvedInitialData {
    const requestStore = getBoneroRequestStore();
    if (!requestStore) {
      throw new Error(
        "Bonero.initialData henüz hazır değil. Layout'ta Bonero.prepareInitialData çağırın veya sayfada await getTafuBoneroStore() kullanın.",
      );
    }
    return requestStore.initialData;
  },

  get dataSet(): Record<string, DataSetAccessor> {
    const requestStore = getBoneroRequestStore();
    if (!requestStore) {
      throw new Error(
        "Bonero.dataSet henüz hazır değil. Layout'ta Bonero.prepareInitialData çağırın veya sayfada await getTafuBoneroStore() kullanın.",
      );
    }
    return requestStore.dataSet;
  },

  async prepareInitialData(
    config: BoneroConfig,
    schema: BoneroInitialDataConfig = {},
  ): Promise<BoneroRequestStore> {
    Bonero.configure(config);
    return resolveBoneroRequestStore(config, schema);
  },

  resolveRequestStore(
    config: BoneroConfig,
    schema: BoneroInitialDataConfig = {},
  ): Promise<BoneroRequestStore> {
    return resolveBoneroRequestStore(config, schema);
  },

  reset(): void {
    currentConfig = null;
    currentAccessor = null;
  },
};
