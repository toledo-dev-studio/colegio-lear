/**
 * Environment variables this job needs — and nothing else. Missing required
 * values stop the run immediately, listing every missing name at once.
 */
const REQUIRED = [
  "DATABASE_URL",
  "MAIL_FROM",
  "MAIL_GRAPH_TENANT_ID",
  "MAIL_GRAPH_CLIENT_ID",
  "MAIL_GRAPH_CLIENT_SECRET",
  "FRONTEND_URL_ADMIN",
  "FRONTEND_URL_STUDENT",
] as const;

const missing = REQUIRED.filter((name) => !process.env[name]?.trim());
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const read = (name: (typeof REQUIRED)[number]) => process.env[name]!.trim();

export const config = {
  databaseUrl: read("DATABASE_URL"),
  mail: {
    /** Microsoft 365 mailbox the emails are sent from (e.g. noreply@colegiolear.mx) */
    from: read("MAIL_FROM"),
    tenantId: read("MAIL_GRAPH_TENANT_ID"),
    clientId: read("MAIL_GRAPH_CLIENT_ID"),
    clientSecret: read("MAIL_GRAPH_CLIENT_SECRET"),
  },
  /** Links in the emails: employees go to the admin portal, guardians to the student portal */
  frontendUrlAdmin: read("FRONTEND_URL_ADMIN"),
  frontendUrlStudent: read("FRONTEND_URL_STUDENT"),
  /** Optional: when set, every run first sends a test email here (to validate the job) */
  testEmail: process.env.CRON_TEST_EMAIL?.trim() || null,
};
