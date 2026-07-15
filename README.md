# @linqon/bonero-core

Bonero Customer API için React client paketi. TanStack Query, nuqs ve provider tabanlı dataset önbelleği ile makale, form ve dataset yönetimini tek yerden sağlar.

**API adresi:** `https://api.bonero.tr` (sabit — yalnızca local geliştirmede override edilir)

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

Uygulamayı `BoneroProvider` ile sarın. Provider API'den tüm dataset anahtarlarını listeler, verilerini ve form listesini önceden yükler.

```tsx
// app/layout.tsx veya client wrapper
import { BoneroProvider } from "@linqon/bonero-core";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <BoneroProvider apiKey={process.env.NEXT_PUBLIC_BONERO_API_KEY}>
      {children}
    </BoneroProvider>
  );
}
```

### Yapılandırma

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `apiKey` | Evet | Tenant API anahtarı (`x-api-key` header) |
| `apiUrl` | Hayır | Yalnızca local test. Varsayılan: `https://api.bonero.tr` |

Ortam değişkenleri:

| Değişken | Açıklama |
|---|---|
| `NEXT_PUBLIC_BONERO_API_KEY` | Client tarafı API anahtarı |
| `BONERO_API_KEY` | Server Components için API anahtarı |
| `BONERO_API_URL` / `NEXT_PUBLIC_BONERO_API_URL` | **Yalnızca local geliştirme** — örn. `http://localhost:6580` |

```bash
# .env.local — yalnızca local Bonero API kullanırken
BONERO_API_URL=http://localhost:6580
NEXT_PUBLIC_BONERO_API_KEY=bnr_...
```

Üretimde `apiUrl` vermenize gerek yok; paket her zaman `https://api.bonero.tr` kullanır.

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
- İlk item alanlarına kısayol: `dataSet.youtube.get("url")`

### useDataSet

```tsx
import { useDataSet } from "@linqon/bonero-core";

const dataset = useDataSet("faqs");
const all = useDataSet();
await all.get("team");
```

### useArticle

```tsx
import { useArticle } from "@linqon/bonero-core";

const article = useArticle();

const list = await article.fetch({ page: 1, limit: 10, type: "CONTENT" });
const post = await article.get("makale-slug");

const { data } = article.useList({ type: "PROJECT", page: 1, limit: 50 });
```

### useForm

Formlar doğrudan `https://api.bonero.tr` üzerinden gönderilir (proxy yok):

```tsx
import { useForm } from "@linqon/bonero-core";

const form = useForm();

const definition = await form.get("iletisim");
await form.submit("iletisim", { ad: "Ali", email: "ali@ornek.com" });
```

## Server Components (Next.js)

```tsx
import {
  resolveBoneroConfig,
  fetchDatasetData,
} from "@linqon/bonero-core/server";

const config = resolveBoneroConfig({
  apiKey: process.env.BONERO_API_KEY,
});

export default async function Page() {
  const faqs = await fetchDatasetData(config, "faqs");
  return (/* ... */);
}
```

## Bonero API kimlik doğrulama

Customer endpoint'leri (`/customer/*`) tenant'ı `x-api-key` header'ı ile çözer:

```http
GET https://api.bonero.tr/customer/datasets
x-api-key: bnr_...
```

API anahtarı Bonero panelinden veya seed script'lerinden alınır.

## API özeti

| Export | Açıklama |
|---|---|
| `BoneroProvider` | TanStack Query + nuqs + tüm dataset prefetch |
| `useBonero()` | `{ config, dataSet }` |
| `useArticle()` | Makale listesi / detay |
| `useDataSet()` | Dataset erişimi |
| `useForm()` | Form tanımı ve doğrudan gönderim |
| `BONERO_API_URL` | `https://api.bonero.tr` sabiti |

### Server (`@linqon/bonero-core/server`)

`boneroFetch`, `fetchDatasetData`, `fetchArticles`, `resolveBoneroConfig` ve ilgili tipler — React hook'ları içermez.

## Geliştirme

```bash
npm install
npm run build
npm run dev
npm run typecheck
```

## Lisans

MIT
