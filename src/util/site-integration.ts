import type { ResolvedWebSiteIntegration, WebSiteIntegration } from "../types";

function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

export function hostnameMatchesDomain(hostname: string, domain: string): boolean {
  const normalizedHost = normalizeDomain(hostname);
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedHost || !normalizedDomain) return false;
  return (
    normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`)
  );
}

export function resolveWebSiteIntegration(
  integrations: WebSiteIntegration[] | null | undefined,
  hostname: string | null | undefined,
): ResolvedWebSiteIntegration | null {
  const normalizedHost = hostname ? normalizeDomain(hostname) : "";
  if (!normalizedHost || !Array.isArray(integrations) || integrations.length === 0) {
    return null;
  }

  const match = integrations.find((entry) =>
    entry.domains.some((domain) => hostnameMatchesDomain(normalizedHost, domain)),
  );

  if (!match) return null;

  return {
    gtmId: match.gtmId ?? undefined,
    metaPixelId: match.metaPixelId ?? undefined,
    liveSupportSiteKey: match.liveSupportSiteKey ?? undefined,
  };
}

export function mergeSiteIntegrationConfig(
  resolved: ResolvedWebSiteIntegration | null | undefined,
  overrides?: {
    gtmId?: string;
    metaPixelId?: string;
    liveSupportSiteKey?: string;
  },
): ResolvedWebSiteIntegration {
  return {
    gtmId: overrides?.gtmId?.trim() || resolved?.gtmId,
    metaPixelId: overrides?.metaPixelId?.trim() || resolved?.metaPixelId,
    liveSupportSiteKey: overrides?.liveSupportSiteKey?.trim() || resolved?.liveSupportSiteKey,
  };
}
