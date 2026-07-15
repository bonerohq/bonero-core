# @linqon/bonero-core

Bonero Customer API için React client paketi. TanStack Query, nuqs ve provider tabanlı dataset önbelleği ile makale, form ve dataset yönetimini tek yerden sağlar.

## Kurulum

```bash
npm install @linqon/bonero-core @tanstack/react-query nuqs
```

Peer bağımlılıklar:

- `react` / `react-dom` ^18 veya ^19
- `@tanstack/react-query` ^5
- `nuqs` ^2

## Hızlı başlangıç

### Provider

Uygulamayı `BoneroProvider` ile sarın. Provider tüm dataset'leri ve form listesini önceden yükler.

```tsx
// app/layout.tsx veya client wrapper
import { BoneroProvider } from "@linqon/bonero-core";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <BoneroProvider
      apiUrl={process.env.NEXT_PUBLIC_BONERO_API_URL}
      tenantHost={process.env.NEXT_PUBLIC_BONERO_TENANT_HOST}
      datasetKeys={["team", "faqs", "youtube-playlists", "youtube-videos"]}
      formSubmitProxyUrl="/api/forms/submit"
      staleTime={60_000}
    >
      {children}
    </BoneroProvider>
  );
}
```

Ortam değişkenleri (provider prop verilmezse otomatik okunur):

| Değişken | Açıklama |
|---|---|
| `NEXT_PUBLIC_BONERO_API_URL` | Bonero API taban URL'i |
| `NEXT_PUBLIC_BONERO_TENANT_HOST` | `x-tenant-host` header değeri |

### Dataset erişimi

Provider yüklendikten sonra dataset verilerine doğrudan erişin:

```tsx
"use client";

import { useBonero } from "@linqon/bonero-core";

export function SiteFooter() {
  const { dataSet } = useBonero();

  const youtubeUrl = dataSet.youtube?.get("url") as string | undefined;
  const team = dataSet.team?.items ?? [];

  return (/* ... */);
}
```

**Alias kuralları**

- `youtube-playlists` → `youtubePlaylists`, `youtube`
- `youtube-videos` → `youtubeVideos`
- İlk item alanlarına kısayol: `dataSet.youtube.url` (proxy ile)

```tsx
const faqs = dataSet.faqs?.items;
const url = dataSet.youtubePlaylists?.get("url", 0);
```

### useDataSet

Belirli bir dataset için reaktif erişim:

```tsx
import { useDataSet } from "@linqon/bonero-core";

const dataset = useDataSet("faqs");
// dataset.items, dataset.isLoading, dataset.refetch

const all = useDataSet();
await all.get("team");
```

### useArticle

```tsx
import { useArticle } from "@linqon/bonero-core";

const article = useArticle();

// Imperatif
const list = await article.fetch({ page: 1, limit: 10, type: "CONTENT" });
const post = await article.get("makale-slug");

// Reaktif
const { data } = article.useList({ type: "PROJECT", page: 1, limit: 50 });
const { data: detail } = article.useDetail("proje-slug");
const { data: categories } = article.useCategories();
```

### useForm

```tsx
import { useForm } from "@linqon/bonero-core";

const form = useForm();

const definition = await form.get("iletisim");
await form.submit("iletisim", { ad: "Ali", email: "ali@ornek.com" });

const { data } = form.useGet("kariyer");
const { data: forms } = form.useList();
```

`formSubmitProxyUrl` verilmişse istemci tarafında proxy üzerinden gönderir; aksi halde doğrudan Bonero API'ye POST atar.

## Server Components (Next.js)

React hook'ları içermeyen server entry:

```tsx
import {
  resolveBoneroConfig,
  fetchDatasetData,
  fetchArticles,
} from "@linqon/bonero-core/server";

const config = resolveBoneroConfig();

export default async function Page() {
  const faqs = await fetchDatasetData(config, "faqs");
  const articles = await fetchArticles(config, { type: "CONTENT", page: 1, limit: 10 });

  return (/* ... */);
}
```

## API özeti

### Client (`@linqon/bonero-core`)

| Export | Açıklama |
|---|---|
| `BoneroProvider` | TanStack Query + nuqs + dataset prefetch |
| `useBonero()` | `{ config, dataSet, formSubmitProxyUrl }` |
| `useArticle()` | Makale listesi / detay |
| `useDataSet()` | Dataset erişimi |
| `useForm()` | Form tanımı ve gönderim |
| `boneroFetch` | Düşük seviye HTTP client |
| `boneroKeys` | TanStack Query key fabrikası |
| `createDataSetAccessor` | Dataset proxy oluşturucu |

### Server (`@linqon/bonero-core/server`)

`boneroFetch`, `fetchDatasetData`, `fetchDatasetList`, `fetchArticles`, `fetchArticleBySlug`, `fetchForms`, `fetchFormByKey`, `submitFormDirect`, `resolveBoneroConfig` ve ilgili tipler.

## Next.js monorepo notu

Yerel `file:` bağımlılığı ile Turbopack kullanırken `next.config.ts` örneği:

```ts
import path from "node:path";
import type { NextConfig } from "next";

const repoRoot = path.resolve(process.cwd(), "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@linqon/bonero-core"],
  turbopack: {
    root: repoRoot,
    resolveAlias: {
      "@linqon/bonero-core": "bony/bonero-core/dist/index.js",
      "@linqon/bonero-core/server": "bony/bonero-core/dist/server.js",
    },
  },
};

export default nextConfig;
```

## Geliştirme

```bash
npm install
npm run build
npm run dev      # tsup watch
npm run typecheck
```

## Lisans

MIT
