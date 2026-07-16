"use client";

import { useCallback, useMemo } from "react";
import { useBoneroContext } from "../../context/bonero.context";
import type { BoneroForm } from "../../types";

const DEFAULT_API_URL = "https://api.bonero.tr";

export function useForm() {
  const { config, data } = useBoneroContext();

  const formsByKey = useMemo(() => {
    const map = new Map<string, BoneroForm>();
    for (const form of data?.forms ?? []) {
      map.set(form.key, form);
    }
    return map;
  }, [data?.forms]);

  const get = useCallback(
    async (formKey: string): Promise<BoneroForm | null> => formsByKey.get(formKey) ?? null,
    [formsByKey],
  );

  const submit = useCallback(
    async (formKey: string, values: Record<string, unknown>): Promise<void> => {
      const baseUrl = `${config.apiUrl ?? DEFAULT_API_URL}/customer`;
      const response = await fetch(`${baseUrl}/forms/${formKey}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
        },
        body: JSON.stringify({ data: values }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(body ? `Form gönderilemedi: ${body.slice(0, 200)}` : "Form gönderilemedi.");
      }
    },
    [config.apiKey, config.apiUrl],
  );

  return {
    get,
    submit,
    forms: data?.forms ?? [],
  };
}
