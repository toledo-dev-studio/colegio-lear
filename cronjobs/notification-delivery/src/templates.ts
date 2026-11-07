/**
 * Email HTML for this job. Copied from the backend
 * (backend/src/shared/templates/email.templates.ts) so the emails look the
 * same — if the backend's layout or announcement template changes, update
 * this file too.
 */

const APP_VERSION = "1.0.0";
const CURRENT_YEAR = new Date().getFullYear();

const HEADING_FONT = "'Outfit','Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const BODY_FONT = "'Figtree','Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const COLOR_PRIMARY = "#1E6FDB";
const COLOR_PRIMARY_DARK = "#1857B0";
const COLOR_FOREGROUND = "#0F172A";
const COLOR_MUTED = "#64748B";
const COLOR_SUBTLE = "#94A3B8";
const COLOR_BORDER = "#E2E8F0";

const LOGO_MARK = `
  <table role="presentation" cellpadding="0" cellspacing="0" width="40" height="40" style="width:40px;height:40px;background-color:rgba(255,255,255,0.18);border-radius:50%;">
    <tr>
      <td align="center" valign="middle" style="width:40px;height:40px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
          <path d="M22 10v6"/>
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
        </svg>
      </td>
    </tr>
  </table>`;

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Colegio Lear</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F7FB;font-family:${BODY_FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F7FB;padding:48px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,0.06),0 12px 32px rgba(15,23,42,0.09);">
          <!-- Header / logo lockup -->
          <tr>
            <td style="background-color:${COLOR_PRIMARY};background-image:linear-gradient(135deg,${COLOR_PRIMARY} 0%,${COLOR_PRIMARY_DARK} 100%);padding:36px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding-right:14px;vertical-align:middle;">${LOGO_MARK}</td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;color:#FFFFFF;font-size:19px;font-weight:800;letter-spacing:-0.2px;font-family:${HEADING_FONT};">COLEGIO LEAR</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:44px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F8FAFC;padding:28px 40px;text-align:center;border-top:1px solid ${COLOR_BORDER};">
              <p style="margin:0 0 4px;color:${COLOR_MUTED};font-size:12px;font-weight:600;font-family:${HEADING_FONT};">Colegio Lear</p>
              <p style="margin:0 0 14px;color:${COLOR_SUBTLE};font-size:11px;">Este es un mensaje automático — por favor no respondas a este correo.</p>
              <p style="margin:0;color:#CBD5E1;font-size:10px;">© ${CURRENT_YEAR} Colegio Lear · API v${APP_VERSION}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 8px;color:${COLOR_FOREGROUND};font-size:21px;font-weight:700;letter-spacing:-0.2px;font-family:${HEADING_FONT};">${text}</h2>`;
}

function paragraph(text: string, marginBottom = 28): string {
  return `<p style="margin:0 0 ${marginBottom}px;color:${COLOR_MUTED};font-size:14.5px;line-height:1.65;font-family:${BODY_FONT};">${text}</p>`;
}

function infoBox(innerHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFF6FF;border-left:3px solid ${COLOR_PRIMARY};border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          ${innerHtml}
        </td>
      </tr>
    </table>`;
}

function ctaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="border-radius:9999px;background-color:${COLOR_PRIMARY};">
          <a href="${href}" target="_blank" style="display:inline-block;padding:15px 36px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;font-family:${BODY_FONT};border-radius:9999px;">${label}</a>
        </td>
      </tr>
    </table>`;
}

/** Same as the backend's announcementNotificationEmail */
export function announcementNotificationEmail(params: {
  recipientName: string;
  announcementName: string;
  announcementDescription: string | null;
  frontendUrl: string;
  studentName?: string;
}): string {
  const greeting = params.studentName
    ? `Hola ${params.recipientName}, se publicó un nuevo comunicado en Colegio Lear para ${params.studentName}${params.announcementDescription ? ":" : "."}`
    : `Hola ${params.recipientName}, se publicó un nuevo comunicado en Colegio Lear${params.announcementDescription ? ":" : "."}`;

  const content = `
    ${heading(`Nuevo comunicado: ${params.announcementName}`)}
    ${paragraph(greeting)}
    ${params.announcementDescription ? infoBox(`<p style="margin:0;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};">${params.announcementDescription}</p>`) : ""}
    ${ctaButton("Ver comunicado", params.frontendUrl)}`;

  return baseLayout(content);
}

/** Test email sent when CRON_TEST_EMAIL is set */
export function cronTestEmail(params: { ranAt: string; frontendUrl: string }): string {
  const content = `
    ${heading("Prueba del cron job de notificaciones")}
    ${paragraph("Hola:")}
    ${infoBox(`<p style="margin:0;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};">El cron job de entrega de notificaciones se ejecutó correctamente el ${params.ranAt} (hora de México).</p>`)}
    ${paragraph("Este correo se envía porque la variable CRON_TEST_EMAIL está configurada. Déjala vacía para dejar de recibirlo.")}
    ${ctaButton("Ir a la plataforma", params.frontendUrl)}`;

  return baseLayout(content);
}
