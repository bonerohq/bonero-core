import Script from "next/script";

type SiteAnalyticsProps = {
  gtmId?: string;
  metaPixelId?: string;
};

function isGa4MeasurementId(id: string): boolean {
  return /^G-[A-Z0-9]+$/i.test(id);
}

function isGtmContainerId(id: string): boolean {
  return /^GTM-[A-Z0-9]+$/i.test(id);
}

export function SiteAnalytics({ gtmId, metaPixelId }: SiteAnalyticsProps) {
  const googleTag = gtmId?.trim() ? gtmId.trim() : undefined;
  const pixel = metaPixelId?.trim() ? metaPixelId.trim() : undefined;

  if (!googleTag && !pixel) return null;

  const ga4Id = googleTag && isGa4MeasurementId(googleTag) ? googleTag : undefined;
  const gtmContainerId = googleTag && isGtmContainerId(googleTag) ? googleTag : undefined;

  return (
    <>
      {ga4Id ? (
        <>
          <Script
            id="google-analytics-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`}
          />
          <Script
            id="google-analytics-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`,
            }}
          />
        </>
      ) : null}
      {gtmContainerId ? (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmContainerId}');`,
          }}
        />
      ) : null}
      {pixel ? (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixel}');
fbq('track', 'PageView');`,
          }}
        />
      ) : null}
      <noscript>
        {gtmContainerId ? (
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmContainerId)}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        ) : null}
        {pixel ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixel)}&ev=PageView&noscript=1`}
            alt=""
          />
        ) : null}
      </noscript>
    </>
  );
}
