import type { BoneroArticle } from "../../types";
import {
  getArticleBySlug,
  getArticleCategories,
  getArticlePage,
  type ArticlePageParams,
} from "./article.data";

export type ArticleSSRFetchParams = ArticlePageParams;

type ArticlePageResult = { data: Awaited<ReturnType<typeof getArticlePage>> };
type ArticleDetailResult = { data: BoneroArticle | null };
type ArticleCategoriesResult = { data: Awaited<ReturnType<typeof getArticleCategories>> };

export function useArticle() {
  async function fetch(params: ArticleSSRFetchParams = {}): Promise<ArticlePageResult> {
    return { data: await getArticlePage(params) };
  }

  async function get(slug: string, type?: BoneroArticle["type"]): Promise<ArticleDetailResult> {
    return { data: await getArticleBySlug(slug, type) };
  }

  async function fetchCategories(): Promise<ArticleCategoriesResult> {
    return { data: await getArticleCategories() };
  }

  return { fetch, get, fetchCategories };
}
