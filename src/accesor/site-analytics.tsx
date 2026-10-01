import Script from "next/script";

type SiteAnalyticsProps = {
  gtmId?: string;
  metaPixelId?: string;
};

export function SiteAnalytics({ gtmId, metaPixelId }: SiteAnalyticsProps) {
  const gtm = gtmId?.trim() ? gtmId.trim() : undefined;
  const pixel = metaPixelId?.trim() ? metaPixelId.trim() : undefined;

  if (!gtm && !pixel) return null;

  return (
    <>
      {gtm ? (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`,
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
        {gtm ? (
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
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
            src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
            alt=""
          />
        ) : null}
      </noscript>
    </>
  );
}
