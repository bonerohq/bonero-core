import type { ArticleFetchParams, ArticlesPageResult, BoneroArticle, BoneroArticleCategory } from "../../types";
import { getArticle, getArticleCategories, getArticles } from "./article.data";

export type ArticleSSRFetchParams = ArticleFetchParams;

type ArticlePageResult = { data: ArticlesPageResult };
type ArticleDetailResult = { data: BoneroArticle | null };
type ArticleCategoriesResult = { data: BoneroArticleCategory[] };

export function useArticle() {
  async function fetch(params: ArticleSSRFetchParams = {}): Promise<ArticlePageResult> {
    return { data: await getArticles(params) };
  }

  async function get(slug: string): Promise<ArticleDetailResult> {
    return { data: await getArticle(slug) };
  }

  async function fetchCategories(): Promise<ArticleCategoriesResult> {
    return { data: await getArticleCategories() };
  }

  return { fetch, get, fetchCategories };
}
