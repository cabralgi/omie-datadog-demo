import { datadogRum } from "@datadog/browser-rum";

export const initRum = () => {
  const appId = import.meta.env.VITE_DD_RUM_APP_ID;
  const clientToken = import.meta.env.VITE_DD_RUM_CLIENT_TOKEN;
  const site = import.meta.env.VITE_DD_SITE || "datadoghq.com";
  const service = import.meta.env.VITE_DD_SERVICE || "frontend-spa";
  const env = import.meta.env.VITE_DD_ENV || "demo";
  const version = import.meta.env.VITE_DD_VERSION || "1";
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";

  if (!appId || !clientToken) {
    console.warn("Datadog RUM not configured: missing app id or client token.");
    return;
  }

  datadogRum.init({
    applicationId: appId,
    clientToken,
    site,
    service,
    env,
    version,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 0,
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    allowedTracingUrls: apiBase ? [apiBase] : [],
    traceSampleRate: 100
  });

  // Session Replay requires the replay package; keep disabled by default.
};
