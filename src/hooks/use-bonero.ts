"use client";

import { useBoneroContext } from "../context.js";

/** Bonero context'ine doğrudan erişim — dataSet, config vb. */
export function useBonero() {
  const { config, dataSet } = useBoneroContext();
  return { config, dataSet };
}
