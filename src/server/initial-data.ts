import type {
  BoneroConfig,
  BoneroInitialDataArticleEntry,
  BoneroInitialDataConfig,
  BoneroInitialDataDatasetEntry,
  BoneroResolvedInitialData,
} from "../types";
import { createDataSetAccessor } from "../utils/dataset-accessor";
import { createBoneroAccessor } from "./accessor";

function sliceArticles<T>(items: T[], take?: number, skip?: number): T[] {
  const start = skip ?? 0;
  const end = take !== undefined ? start + take : undefined;
  return items.slice(start, end);
}

async function resolveArticleEntry(
  accessor: ReturnType<typeof createBoneroAccessor>,
  entry: BoneroInitialDataArticleEntry,
) {
  if (entry.all && entry.articleType) {
    const articles = await accessor.allArticles(entry.articleType);
    return {
      articles: sliceArticles(articles, entry.take, entry.skip),
    };
  }

  const take = entry.take ?? 20;
  const skip = entry.skip ?? 0;
  const page = Math.floor(skip / take) + 1;
  const result = await accessor.articles({
    type: entry.articleType,
    categorySlug: entry.category || undefined,
    limit: take + (skip % take),
    page,
  });

  return {
    articles: sliceArticles(result.articles, take, skip % take),
    pagination: result.pagination,
  };
}

async function resolveDatasetEntry(
  accessor: ReturnType<typeof createBoneroAccessor>,
  entry: BoneroInitialDataDatasetEntry,
) {
  const dataset = await accessor.dataset(entry.source);
  if (!dataset) {
    return createDataSetAccessor(
      { key: entry.source, title: entry.source, items: [] },
      { where: entry.where, take: entry.take, skip: entry.skip },
    );
  }

  return createDataSetAccessor(dataset, {
    where: entry.where,
    take: entry.take,
    skip: entry.skip,
  });
}

export async function resolveInitialData<T extends BoneroInitialDataConfig>(
  config: BoneroConfig,
  schema: T,
): Promise<BoneroResolvedInitialData<T>> {
  const accessor = createBoneroAccessor(config);
  const entries = await Promise.all(
    Object.entries(schema).map(async ([key, entry]) => {
      if (entry.type === "article") {
        return [key, await resolveArticleEntry(accessor, entry)] as const;
      }

      return [key, await resolveDatasetEntry(accessor, entry)] as const;
    }),
  );

  return Object.fromEntries(entries) as BoneroResolvedInitialData<T>;
}
