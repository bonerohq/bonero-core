import type { BoneroConfig } from "./types";

export function getBoneroConfig(overrides?: Partial<BoneroConfig>): BoneroConfig {
  const apiKey =
    overrides?.apiKey ?? process.env.BONERO_API_KEY ?? process.env.NEXT_PUBLIC_BONERO_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Bonero API anahtarı gerekli. apiKey prop'u veya BONERO_API_KEY / NEXT_PUBLIC_BONERO_API_KEY ortam değişkeni ayarlayın.",
    );
  }

  return {
    apiKey,
    apiUrl: overrides?.apiUrl,
  };
}
