import { createBoneroClient } from "../util/bonero.client";
import type { BoneroArticleSummary, BoneroConfig } from "../types";

export type SitemapEntry = {
  url: string;
  lastModified?: Date | string;
};

function articlePath(article: BoneroArticleSummary): string | null {
  if (article.type === "CONTENT") return `/blog/${article.slug}`;
  if (article.type === "PROJECT") return `/projeler/${article.slug}`;
  return null;
}

export function buildSitemapFromArticles(
  articles: BoneroArticleSummary[],
  options: { siteUrl: string; staticPaths?: string[] },
): SitemapEntry[] {
  const siteUrl = options.siteUrl.replace(/\/$/, "");
  const staticPaths = options.staticPaths ?? ["/"];
  const lastModified = new Date();

  const staticEntries: SitemapEntry[] = staticPaths.map((path) => ({
    url: path === "/" ? siteUrl : `${siteUrl}${path}`,
    lastModified,
  }));

  const dynamicEntries: SitemapEntry[] = articles
    .map((article) => {
      const path = articlePath(article);
      if (!path) return null;

      return {
        url: `${siteUrl}${path}`,
        lastModified: article.updatedAt ? new Date(article.updatedAt) : lastModified,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return [...staticEntries, ...dynamicEntries];
}

export async function generateBoneroSitemap(
  config: BoneroConfig,
  options: { siteUrl: string; staticPaths?: string[] },
): Promise<SitemapEntry[]> {
  const client = createBoneroClient(config);
  const { articles } = await client.fetchArticlesAll();
  return buildSitemapFromArticles(articles ?? [], options);
}
