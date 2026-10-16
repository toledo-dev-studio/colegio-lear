import nodemailer from "nodemailer";

// ─── Interfaces ─────────────────────────────────────────────────────────────────

/** Options required to send an email */
export interface MailOptions {
  /** Recipient email address */
  to: string;
  /** Email subject line */
  subject: string;
  /** HTML body content */
  html: string;
}

/**
 * Abstract mail service interface.
 * Implementations handle the actual transport (Gmail SMTP, generic SMTP, etc.).
 */
export interface IMailService {
  /** Send an email with the given options */
  sendMail(options: MailOptions): Promise<void>;
}

// ─── Implementations ────────────────────────────────────────────────────────────

/**
 * Gmail SMTP implementation using nodemailer.
 * Configured via environment variables: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_FROM.
 */
export class GmailService implements IMailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT) || 587,
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: process.env.MAIL_USER || "",
        pass: process.env.MAIL_PASSWORD || "",
      },
    });
  }

  /** Send an email using Gmail SMTP transport */
  async sendMail(options: MailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || "noreply@colegiolear.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}

/**
 * Microsoft Graph implementation (sends over HTTPS)
 */
export class GraphMailService implements IMailService {
  private token: string | null = null;
  private tokenExpiresAt = 0;

  /** Returns a cached access token, requesting a new one shortly before it expires */
  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) return this.token;

    const tenantId = process.env.MAIL_GRAPH_TENANT_ID || "";
    const res = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.MAIL_GRAPH_CLIENT_ID || "",
          client_secret: process.env.MAIL_GRAPH_CLIENT_SECRET || "",
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

    this.token = data.access_token;
    // Refresh one minute early to avoid using a token that expires mid-request
    this.tokenExpiresAt = Date.now() + ((data.expires_in ?? 3600) - 60) * 1000;
    return this.token;
  }

  /** Send an email through Microsoft Graph's sendMail endpoint */
  async sendMail(options: MailOptions): Promise<void> {
    const from = process.env.MAIL_FROM || "";
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
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
}

/**
 * Generic SMTP placeholder implementation.
 * Throws an error indicating it is not yet configured.
 * Reserved for future use with an alternative SMTP provider.
 */
export class SmtpService implements IMailService {
  /** Not implemented — throws an error */
  async sendMail(_options: MailOptions): Promise<void> {
    throw new Error("SmtpService not implemented. Configure SMTP credentials.");
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────────

/**
 * Factory function that returns the active mail service implementation
 * based on the MAIL_PROVIDER environment variable.
 *
 * Supported values:
 * - "gmail" (default): Uses GmailService with nodemailer
 * - "graph": Uses GraphMailService (Microsoft Graph over HTTPS)
 * - "smtp": Uses SmtpService placeholder
 */
function createMailService(): IMailService {
  const provider = process.env.MAIL_PROVIDER || "gmail";
  switch (provider) {
    case "graph":
      return new GraphMailService();
    case "smtp":
      return new SmtpService();
    case "gmail":
    default:
      return new GmailService();
  }
}

/** Singleton mail service instance used throughout the application */
export const mailService: IMailService = createMailService();
