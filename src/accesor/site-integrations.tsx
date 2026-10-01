import { LiveSupportWidget } from "./live-support-widget";
import { SiteAnalytics } from "./site-analytics";

type SiteIntegrationsProps = {
  gtmId?: string;
  metaPixelId?: string;
  liveSupportSiteKey?: string;
  apiUrl?: string;
};

export function SiteIntegrations({
  gtmId,
  metaPixelId,
  liveSupportSiteKey,
  apiUrl,
}: SiteIntegrationsProps) {
  const hasAnalytics = Boolean(gtmId?.trim() || metaPixelId?.trim());
  const hasLiveSupport = Boolean(liveSupportSiteKey?.trim());

  if (!hasAnalytics && !hasLiveSupport) return null;

  return (
    <>
      {hasAnalytics ? <SiteAnalytics gtmId={gtmId} metaPixelId={metaPixelId} /> : null}
      {hasLiveSupport ? (
        <LiveSupportWidget siteKey={liveSupportSiteKey!} apiUrl={apiUrl} />
      ) : null}
    </>
  );
}
