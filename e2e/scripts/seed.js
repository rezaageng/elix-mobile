// Maestro runScript helper for backend test seeding.
// Env vars are injected as globals by Maestro.
const url =
  (typeof API_URL !== "undefined" ? API_URL : "http://localhost:3000") +
  "/api/test/seed";
const key = typeof SEED_KEY !== "undefined" ? SEED_KEY : "full";
const rawParams = typeof SEED_PARAMS !== "undefined" ? SEED_PARAMS : "{}";

let params = {};
try {
  params = JSON.parse(rawParams);
} catch {
  params = {};
}

// Retry until the user finishes manual OAuth and a session cookie is available.
// The app may open an OAuth browser, so this call can fail with 401 briefly.
const start = Date.now();
const maxWait = 10 * 60 * 1000; // 10 minutes
const interval = 2000;

let lastResponse = null;

while (Date.now() - start < maxWait) {
  lastResponse = await http.post(url, {
    key: key,
    params: params,
  });

  if (lastResponse.status === 200) {
    output.success = true;
    output.userId = lastResponse.body?.userId;
    break;
  }

  // 401 = not authenticated yet (OAuth in progress). Retry.
  // 403 = not in development mode. Fail immediately.
  if (lastResponse.status === 403) {
    throw new Error("Seed disabled: " + JSON.stringify(lastResponse.body));
  }

  // Busy-wait; Maestro's JS runtime may not provide setTimeout.
  const waitStart = Date.now();
  while (Date.now() - waitStart < interval) {}
}

if (output.success !== true) {
  throw new Error(
    "Seed failed after retrying: " + JSON.stringify(lastResponse?.body),
  );
}
