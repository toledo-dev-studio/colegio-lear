import { config } from "./config";

/**
 * Sends email through Microsoft Graph over HTTPS (OAuth2 client credentials,
 * POST /users/{MAIL_FROM}/sendMail) — same provider and app registration as
 * the backend's GraphMailService. The Azure app registration needs the
 * Mail.Send *application* permission with admin consent.
 */

let token: string | null = null;
let tokenExpiresAt = 0;

/** Returns a cached access token, requesting a new one shortly before it expires */
async function getToken(): Promise<string> {
  if (token && Date.now() < tokenExpiresAt) return token;

  const res = await fetch(
    `https://login.microsoftonline.com/${config.mail.tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.mail.clientId,
        client_secret: config.mail.clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  );
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(
      `Microsoft Graph token request failed (${res.status}): ${data.error_description ?? "unknown error"}`,
    );
  }

  token = data.access_token;
  // Refresh one minute early to avoid using a token that expires mid-request
  tokenExpiresAt = Date.now() + ((data.expires_in ?? 3600) - 60) * 1000;
  return token;
}

export async function sendMail(options: { to: string; subject: string; html: string }): Promise<void> {
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.mail.from)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: options.subject,
          body: { contentType: "HTML", content: options.html },
          toRecipients: [{ emailAddress: { address: options.to } }],
        },
        saveToSentItems: false,
      }),
    },
  );

  // Success is 202 Accepted with an empty body
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { code?: string; message?: string };
    } | null;
    throw new Error(
      `Microsoft Graph sendMail failed (${res.status}): ${body?.error?.code ?? ""} ${body?.error?.message ?? ""}`.trim(),
    );
  }
}
