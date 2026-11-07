import { config } from "./config";
import { pool } from "./db";
import { sendMail } from "./mail";
import { cronTestEmail } from "./templates";
import { releaseDueNotifications } from "./release";

/**
 * Render Cron Job entry point: runs once and exits.
 * Exit code 0 = everything delivered; 1 = something failed (the test email,
 * the database, or at least one notification email), so Render marks the
 * run as failed and the details stay in that run's logs.
 */
async function main(): Promise<number> {
  try {
    if (config.testEmail) {
      const ranAt = new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" });
      await sendMail({
        to: config.testEmail,
        subject: "Prueba del cron job de notificaciones - Colegio Lear",
        html: cronTestEmail({ ranAt, frontendUrl: config.frontendUrlAdmin }),
      });
      console.log(`Test email sent to ${config.testEmail}`);
    }

    const summary = await releaseDueNotifications();
    console.log(
      `Notification delivery finished: ${summary.due} due, ${summary.released} released, ${summary.failed} failed`,
    );
    return summary.failed > 0 ? 1 : 0;
  } catch (error) {
    console.error("Notification delivery job failed:", error);
    return 1;
  } finally {
    await pool.end();
  }
}

main().then((code) => process.exit(code));
