import "server-only";

import type { ReactNode } from "react";
import type { BoneroInitialDataConfig } from "./types";
import { getBoneroConfig } from "./config";
import { Bonero } from "./server/bonero";
import { BoneroProviderClient } from "./bonero.provider";

type BoneroProviderProps = {
  children: ReactNode;
  initialData?: BoneroInitialDataConfig;
  apiKey?: string;
  apiUrl?: string;
  pixelId?: string;
  tagManagerId?: string;
};

function readClientApiKey(serverApiKey: string): string {
  return process.env.NEXT_PUBLIC_BONERO_API_KEY ?? serverApiKey;
}

export async function BoneroProvider({
  children,
  initialData = {},
  apiKey,
  apiUrl,
  pixelId,
  tagManagerId,
}: BoneroProviderProps) {
  const config = getBoneroConfig({ apiKey, apiUrl });

  await Bonero.prepareInitialData(config, initialData);

  return (
    <BoneroProviderClient
      apiKey={readClientApiKey(config.apiKey)}
      apiUrl={config.apiUrl}
      pixelId={pixelId ?? process.env.NEXT_PUBLIC_BONERO_META_PIXEL_ID}
      tagManagerId={tagManagerId ?? process.env.NEXT_PUBLIC_BONERO_GTM_ID}
    >
      {children}
    </BoneroProviderClient>
  );
}
