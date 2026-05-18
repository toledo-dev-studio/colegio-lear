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
 * - "smtp": Uses SmtpService placeholder
 */
function createMailService(): IMailService {
  const provider = process.env.MAIL_PROVIDER || "gmail";
  switch (provider) {
    case "smtp":
      return new SmtpService();
    case "gmail":
    default:
      return new GmailService();
  }
}

/** Singleton mail service instance used throughout the application */
export const mailService: IMailService = createMailService();
