// Maestro runScript helper for backend test seeding.
// Env vars are injected as globals by Maestro.
const url =
  (typeof API_URL !== "undefined" ? API_URL : "http://localhost:3000") +
  "/api/test/seed";
const key = typeof SEED_KEY !== "undefined" ? SEED_KEY : "full";
const email =
  typeof E2E_TEST_EMAIL !== "undefined"
    ? E2E_TEST_EMAIL
    : "akitanime@gmail.com";

const response = await http.post(url, {
  body: JSON.stringify({ key: key, email: email }),
  headers: { "Content-Type": "application/json" },
});

if (!response.ok) {
  throw new Error("Seed failed: " + response.body);
}

const data = json(response.body);
if (data.success === false) {
  throw new Error("Seed failed: " + data.error);
}

output.success = true;
output.userId = data.userId;
