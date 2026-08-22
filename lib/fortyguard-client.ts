/**
 * FortyGuard Temperature API client.
 * Implements the async submit -> poll pattern used by every analysis endpoint.
 * Docs: https://docs-api.fortyguard.com/docs/introduction
 *
 * IMPORTANT: The Hackathon plan's exact heatmap AOI area limit is not
 * documented publicly (only Basic ~10 mi^2 / Premium ~50 mi^2 are). Run the
 * empirical AOI test (see notebooks/01) before relying on a specific value in
 * route-segmentation logic (app/api/tools/segment-route.ts).
 */

const BASE_URL = "https://api.fortyguard.com";

interface PollOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

interface StatusResponse {
  error: boolean;
  status_code: number;
  message: string;
  data: {
    activity_id: string;
    status: string;
    result?: any;
  };
}

/**
 * Polls GET /v1/status/{activity_id} with exponential backoff
 * (per handbook best practice: 3s -> 6s -> 12s ...) until the task
 * reaches a terminal state.
 */
async function pollStatus(
  activityId: string,
  apiKey: string,
  opts: PollOptions = {}
): Promise<any> {
  const { maxAttempts = 12, initialDelayMs = 3000, maxDelayMs = 30000 } = opts;
  let delay = initialDelayMs;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(`${BASE_URL}/v1/status/${activityId}`, {
      headers: { "api-key": apiKey },
    });
    const json: StatusResponse = await res.json();
    const status = json?.data?.status?.toLowerCase();

    if (status === "completed" || status === "succeeded") {
      return json.data.result;
    }
    if (status === "failed" || status === "error") {
      // Failed tasks don't consume credits (per handbook) - safe to retry
      // the whole submission if needed at the call site.
      throw new Error(`FortyGuard task ${activityId} failed: ${json.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 2, maxDelayMs);
  }

  throw new Error(
    `FortyGuard task ${activityId} did not complete after ${maxAttempts} polls`
  );
}

export interface HeatmapParams {
  apiKey: string;
  polygonAoi: GeoJSON.FeatureCollection;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  filterType?: 1 | 2 | 3 | 4 | 5;
  endTime?: string; // required if filterType === 2
  granularity?: 60 | 80 | 100;
}

/**
 * POST /v1/heatmap - submit + poll in one call.
 * Coverage: U.S. locations only. Dates: 2021-01-01 to now (+12h for forecasting).
 */
export async function createHeatmap(params: HeatmapParams) {
  const {
    apiKey,
    polygonAoi,
    startDate,
    startTime,
    filterType = 1,
    endTime,
    granularity = 100,
  } = params;

  const date_time: Record<string, unknown> = {
    start_date: startDate,
    start_time: startTime,
    filter_type: filterType,
  };
  if (endTime) date_time.end_time = endTime;

  const submitRes = await fetch(`${BASE_URL}/v1/heatmap`, {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ polygon_aoi: polygonAoi, date_time, granularity }),
  });
  const submitJson = await submitRes.json();
  const activityId = submitJson?.data?.activity_id;

  if (!activityId) {
    throw new Error(`Heatmap submission failed: ${JSON.stringify(submitJson)}`);
  }
  return pollStatus(activityId, apiKey);
}

export interface EnvParamsRequest {
  apiKey: string;
  latitude: number;
  longitude: number;
  startDate: string;
  startTime: string;
}

/**
 * POST /v1/env_params - heat index, apparent temp, humidity, AQI, etc. at a point.
 */
export async function getEnvironmentalParams(params: EnvParamsRequest) {
  const { apiKey, latitude, longitude, startDate, startTime } = params;

  const submitRes = await fetch(`${BASE_URL}/v1/env_params`, {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      latitude,
      longitude,
      date_time: { start_date: startDate, start_time: startTime, filter_type: 1 },
    }),
  });
  const submitJson = await submitRes.json();
  const activityId = submitJson?.data?.activity_id;

  if (!activityId) {
    throw new Error(`Env params submission failed: ${JSON.stringify(submitJson)}`);
  }
  return pollStatus(activityId, apiKey);
}

/**
 * GET /v1/system/fetch-api-key-usage - check remaining credits.
 */
export async function getApiKeyUsage(apiKey: string) {
  const res = await fetch(`${BASE_URL}/v1/system/fetch-api-key-usage`, {
    headers: { "api-key": apiKey },
  });
  return res.json();
}
