const RETRY_STATUSES = [429, 502, 503, 504] as const;
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 500;

function parseRetryAfter(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const seconds = Number(trimmed);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const date = Date.parse(trimmed);
  if (!Number.isNaN(date)) {
    return Math.max(date - Date.now(), 0);
  }

  return null;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchWithRetry(input: RequestInfo, init?: RequestInit) {
  let attempt = 0;

  while (true) {
    const response = await fetch(input, init);
    const shouldRetry = RETRY_STATUSES.includes(response.status as typeof RETRY_STATUSES[number]);

    if (!shouldRetry || attempt >= MAX_RETRIES) {
      return response;
    }

    const retryAfter = parseRetryAfter(response.headers.get("Retry-After"));
    const backoff = retryAfter ?? Math.min(BASE_DELAY_MS * 2 ** attempt, 5000);
    await delay(backoff);
    attempt += 1;
  }
}
