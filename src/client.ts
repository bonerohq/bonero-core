import type {
  ArticleCategoriesResponse,
  ArticleFetchParams,
  ArticlesListResponse,
  BoneroArticle,
  BoneroConfig,
  BoneroFetchOptions,
  BoneroForm,
  DatasetData,
  DatasetListResponse,
  FormsListResponse,
} from "./types.js";

function readEnv(key: string): string | undefined {
  if (typeof globalThis === "undefined") return undefined;
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env;
  return env?.[key];
}

export function resolveBoneroConfig(
  overrides?: Partial<BoneroConfig>,
): BoneroConfig {
  return {
    apiUrl:
      overrides?.apiUrl ??
      readEnv("NEXT_PUBLIC_BONERO_API_URL") ??
      readEnv("BONERO_API_URL") ??
      "http://localhost:6580",
    tenantHost:
      overrides?.tenantHost ??
      readEnv("NEXT_PUBLIC_BONERO_TENANT_HOST") ??
      readEnv("BONERO_TENANT_HOST") ??
      "link.tafu.tr",
    revalidateSeconds: overrides?.revalidateSeconds ?? 60,
  };
}

export async function boneroFetch<T>(
  config: BoneroConfig,
  path: string,
  init?: RequestInit & BoneroFetchOptions,
): Promise<T> {
  const { revalidate, cache, ...requestInit } = init ?? {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-tenant-host": config.tenantHost,
    ...(requestInit.headers as Record<string, string> | undefined),
  };

  const isServer = typeof window === "undefined";
  const nextInit =
    isServer && revalidate !== false
      ? { next: { revalidate: revalidate ?? config.revalidateSeconds ?? 60 } }
      : {};

  const response = await fetch(`${config.apiUrl}${path}`, {
    ...requestInit,
    ...nextInit,
    cache: cache ?? (isServer ? undefined : "no-store"),
    headers,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Bonero API hatası (${response.status}): ${path}${body ? ` — ${body.slice(0, 200)}` : ""}`,
    );
  }

  return response.json() as Promise<T>;
}

function buildSearchParams(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  return search;
}

export async function fetchDatasetList(config: BoneroConfig) {
  return boneroFetch<DatasetListResponse>(config, "/customer/datasets");
}

export async function fetchDatasetData(config: BoneroConfig, key: string) {
  return boneroFetch<DatasetData>(config, `/customer/datasets/${key}/data`);
}

export async function fetchForms(config: BoneroConfig) {
  return boneroFetch<FormsListResponse>(config, "/customer/forms", {
    revalidate: 300,
  });
}

export async function fetchFormByKey(config: BoneroConfig, key: string) {
  const { forms } = await fetchForms(config);
  return forms.find((form) => form.key === key) ?? null;
}

export async function fetchArticles(
  config: BoneroConfig,
  params: ArticleFetchParams = {},
) {
  const limit = params.limit ?? params.amount ?? 20;
  const search = buildSearchParams({
    page: params.page ?? 1,
    limit,
    type: params.type,
    categorySlug: params.categorySlug,
    search: params.search,
  });

  return boneroFetch<ArticlesListResponse>(
    config,
    `/customer/articles?${search.toString()}`,
  );
}

export async function fetchArticleBySlug(config: BoneroConfig, slug: string) {
  return boneroFetch<BoneroArticle>(config, `/customer/articles/${slug}`);
}

export async function fetchArticleCategories(config: BoneroConfig) {
  return boneroFetch<ArticleCategoriesResponse>(
    config,
    "/customer/article-categories",
  );
}

export function getFormSubmitUrl(config: BoneroConfig, formId: string) {
  return `${config.apiUrl}/api/public/forms/${formId}/submit`;
}

export async function submitFormDirect(
  config: BoneroConfig,
  form: BoneroForm,
  data: Record<string, string>,
) {
  const response = await fetch(getFormSubmitUrl(config, form.id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Form gönderilemedi (${response.status})${body ? `: ${body.slice(0, 200)}` : ""}`,
    );
  }

  return response.json();
}

export async function submitFormViaProxy(
  proxyUrl: string,
  formKey: string,
  data: Record<string, string>,
) {
  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formKey, data }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      payload?.error ?? `Form gönderilemedi (${response.status})`,
    );
  }

  return response.json();
}
