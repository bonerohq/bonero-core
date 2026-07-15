"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchFormByKey, fetchForms, submitFormDirect } from "../client.js";
import { useBoneroContext } from "../context.js";
import { boneroKeys } from "../query-keys.js";
import type { BoneroForm } from "../types.js";

export function useForm() {
  const { config } = useBoneroContext();
  const queryClient = useQueryClient();

  const get = useCallback(
    async (key: string): Promise<BoneroForm | null> => {
      const cached = queryClient.getQueryData<{ forms: BoneroForm[] }>(
        boneroKeys.forms.list(),
      );
      const fromCache = cached?.forms.find((form) => form.key === key);
      if (fromCache) return fromCache;

      return queryClient.fetchQuery({
        queryKey: boneroKeys.forms.detail(key),
        queryFn: () => fetchFormByKey(config, key),
      });
    },
    [config, queryClient],
  );

  const useGet = (key: string, enabled = true) =>
    useQuery({
      queryKey: boneroKeys.forms.detail(key),
      queryFn: () => fetchFormByKey(config, key),
      enabled: enabled && Boolean(key),
    });

  const useList = (enabled = true) =>
    useQuery({
      queryKey: boneroKeys.forms.list(),
      queryFn: () => fetchForms(config),
      enabled,
    });

  const submitMutation = useMutation({
    mutationFn: async ({
      key,
      data,
    }: {
      key: string;
      data: Record<string, string>;
    }) => {
      const form = await get(key);
      if (!form) {
        throw new Error(`Form bulunamadı: ${key}`);
      }

      return submitFormDirect(config, form, data);
    },
  });

  const submit = useCallback(
    (key: string, data: Record<string, string>) =>
      submitMutation.mutateAsync({ key, data }),
    [submitMutation],
  );

  return {
    get,
    submit,
    useGet,
    useList,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error,
  };
}

export type { BoneroForm };
