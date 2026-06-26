// Maestro runScript helper for dev email/password sign-in.
// Computes the test email from USER_ID or uses EMAIL directly.
const userId = typeof USER_ID !== "undefined" ? USER_ID : "";
let email = typeof EMAIL !== "undefined" ? EMAIL : "";

if (!email) {
  if (userId.startsWith("e2e-user-")) {
    email = userId.replace("e2e-user-", "e2e-") + "@elix.app";
  } else if (userId) {
    email = userId + "@elix.app";
  } else {
    email = "e2e-with-class@elix.app";
  }
}

output.email = email;
output.password = typeof PASSWORD !== "undefined" ? PASSWORD : "password123";
