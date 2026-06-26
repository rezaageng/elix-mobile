// Maestro runScript helper for backend test seeding.
// Env vars are injected as globals by Maestro.
const url = (typeof API_URL !== "undefined" ? API_URL : "http://localhost:3000") + "/api/test/seed";
const key = typeof SEED_KEY !== "undefined" ? SEED_KEY : "full";
const rawParams = typeof SEED_PARAMS !== "undefined" ? SEED_PARAMS : "{}";

let params = {};
try {
  params = JSON.parse(rawParams);
} catch {
  params = {};
}

const response = await http.post(url, {
  key: key,
  params: params,
});

if (response.status >= 400) {
  throw new Error("Seed failed: " + JSON.stringify(response.body));
}

output.success = true;
