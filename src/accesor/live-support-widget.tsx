import Script from "next/script";
import { BONERO_API_URL } from "../constants";

type LiveSupportWidgetProps = {
  siteKey: string;
  apiUrl?: string;
};

export function LiveSupportWidget({ siteKey, apiUrl }: LiveSupportWidgetProps) {
  const trimmedKey = siteKey.trim();
  if (!trimmedKey) return null;

  const baseUrl = (apiUrl ?? BONERO_API_URL).replace(/\/$/, "");

  return (
    <Script
      id="bonero-live-support"
      src={`${baseUrl}/widget/live-support.js`}
      strategy="afterInteractive"
      data-site-key={trimmedKey}
      async
    />
  );
}
