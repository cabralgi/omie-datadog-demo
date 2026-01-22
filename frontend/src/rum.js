import { datadogRum } from "@datadog/browser-rum";

export const initRum = () => {
  const appId = import.meta.env.VITE_DD_RUM_APP_ID;
  const clientToken = import.meta.env.VITE_DD_RUM_CLIENT_TOKEN;
  const site = import.meta.env.VITE_DD_SITE || "datadoghq.com";
  const service = import.meta.env.VITE_DD_SERVICE || "frontend-spa";
  const env = import.meta.env.VITE_DD_ENV || "demo";
  const version = import.meta.env.VITE_DD_VERSION || "1";
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  const replayEnabled =
    (import.meta.env.VITE_DD_RUM_REPLAY || "false").toLowerCase() === "true";
  const replaySampleRate = Number(
    import.meta.env.VITE_DD_RUM_REPLAY_SAMPLE_RATE || (replayEnabled ? 100 : 0)
  );

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
    sessionReplaySampleRate: replaySampleRate,
    startSessionReplayRecordingManually: false,
    defaultPrivacyLevel: "mask-user-input",
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    allowedTracingUrls: apiBase ? [apiBase] : [],
    traceSampleRate: 100
  });

  if (
    replayEnabled &&
    typeof datadogRum.startSessionReplayRecording === "function"
  ) {
    datadogRum.startSessionReplayRecording();
  }
};
