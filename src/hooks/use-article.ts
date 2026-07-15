"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  fetchArticleBySlug,
  fetchArticleCategories,
  fetchArticles,
} from "../client.js";
import { useBoneroContext } from "../context.js";
import { boneroKeys } from "../query-keys.js";
import type { ArticleFetchParams, BoneroArticle } from "../types.js";

export function useArticle() {
  const { config } = useBoneroContext();
  const queryClient = useQueryClient();

  const fetch = useCallback(
    (params: ArticleFetchParams = {}) =>
      queryClient.fetchQuery({
        queryKey: boneroKeys.articles.list(params),
        queryFn: () => fetchArticles(config, params),
      }),
    [config, queryClient],
  );

  const get = useCallback(
    (slug: string) =>
      queryClient.fetchQuery({
        queryKey: boneroKeys.articles.detail(slug),
        queryFn: () => fetchArticleBySlug(config, slug),
      }),
    [config, queryClient],
  );

  const useList = (params: ArticleFetchParams = {}, enabled = true) =>
    useQuery({
      queryKey: boneroKeys.articles.list(params),
      queryFn: () => fetchArticles(config, params),
      enabled,
    });

  const useDetail = (slug: string, enabled = true) =>
    useQuery({
      queryKey: boneroKeys.articles.detail(slug),
      queryFn: () => fetchArticleBySlug(config, slug),
      enabled: enabled && Boolean(slug),
    });

  const useCategories = (enabled = true) =>
    useQuery({
      queryKey: boneroKeys.articles.categories(),
      queryFn: () => fetchArticleCategories(config),
      enabled,
    });

  return {
    fetch,
    get,
    useList,
    useDetail,
    useCategories,
  };
}

export type { ArticleFetchParams, BoneroArticle };
