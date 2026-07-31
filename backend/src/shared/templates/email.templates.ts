/**
 * Email HTML templates for Colegio Lear.
 * Uses inline styles for maximum email client compatibility.
 * Mirrors the frontend's design system (frontend/admin-web/src/index.css):
 *   primary #1E6FDB, background #F4F7FB, foreground #0F172A,
 *   headings in "Outfit", body copy in "Figtree", fully-rounded ("pill")
 *   buttons, and the same circular icon-badge lockup as ColegioLearLogo.tsx
 *   (a graduation cap in a solid-color circle), reproduced here as inline
 *   SVG since there's no raster logo file to embed.
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

/**
 * Graduation-cap mark in a translucent circle — the same lockup as
 * ColegioLearLogo.tsx (lucide-react "GraduationCap" in a solid-color
 * circular badge), reproduced as inline SVG for email clients.
 */
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

/** Base layout wrapper for all emails — header lockup, card, footer. */
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

/** Shared heading style used at the top of every email's content area. */
function heading(text: string): string {
  return `<h2 style="margin:0 0 8px;color:${COLOR_FOREGROUND};font-size:21px;font-weight:700;letter-spacing:-0.2px;font-family:${HEADING_FONT};">${text}</h2>`;
}

/** Shared body-copy paragraph style. */
function paragraph(text: string, marginBottom = 28): string {
  return `<p style="margin:0 0 ${marginBottom}px;color:${COLOR_MUTED};font-size:14.5px;line-height:1.65;font-family:${BODY_FONT};">${text}</p>`;
}

/**
 * Shared "info panel" — used for credentials, descriptions, verification
 * codes, etc. accentColor/backgroundColor let callers restyle it for
 * error/warning states (e.g. processNotificationEmail).
 */
function infoBox(
  innerHtml: string,
  accentColor: string = COLOR_PRIMARY,
  backgroundColor = "#EFF6FF",
): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${backgroundColor};border-left:3px solid ${accentColor};border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          ${innerHtml}
        </td>
      </tr>
    </table>`;
}

/** Shared large centered "verification code" display block. */
function codeBlock(code: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFF6FF;border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:28px;text-align:center;">
          <p style="margin:0 0 10px;color:${COLOR_MUTED};font-size:11.5px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;font-family:${HEADING_FONT};">Código de seguridad</p>
          <p style="margin:0;color:${COLOR_PRIMARY};font-size:34px;font-weight:700;letter-spacing:8px;font-family:${HEADING_FONT};">${code}</p>
        </td>
      </tr>
    </table>`;
}

/** Shared fully-rounded ("pill") call-to-action button, matching .pill-btn-primary. */
function ctaButton(label: string, href: string, color: string = COLOR_PRIMARY): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="border-radius:9999px;background-color:${color};">
          <a href="${href}" target="_blank" style="display:inline-block;padding:15px 36px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;font-family:${BODY_FONT};border-radius:9999px;">${label}</a>
        </td>
      </tr>
    </table>`;
}

/**
 * Invitation email — sent when a new employee is created.
 * mustChangePassword:true routes the first login through
 * /auth/reset-password, the same screen forgot-password uses — which
 * always asks for a security code — so this includes one too, not just
 * the temporary password.
 */
export function invitationEmail(params: {
  name: string;
  username: string;
  tempPassword: string;
  code: string;
  frontendUrl: string;
}): string {
  const content = `
    ${heading(`¡Bienvenido/a, ${params.name}!`)}
    ${paragraph("Se ha creado tu cuenta en la plataforma de Colegio Lear. A continuación encontrarás tus credenciales de acceso:")}
    ${infoBox(`
      <p style="margin:0 0 12px;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};"><strong>Usuario:</strong> <span style="color:${COLOR_PRIMARY};font-weight:600;">${params.username}</span></p>
      <p style="margin:0;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};"><strong>Contraseña temporal:</strong> <code style="background:#FFFFFF;padding:4px 10px;border-radius:6px;font-size:14px;color:${COLOR_PRIMARY};border:1px solid ${COLOR_BORDER};">${params.tempPassword}</code></p>
    `)}
    ${paragraph("Al iniciar sesión por primera vez, el sistema te pedirá cambiar tu contraseña — ahí mismo ingresa este código de seguridad:")}
    ${codeBlock(params.code)}
    ${ctaButton("Acceder a la plataforma", params.frontendUrl)}`;

  return baseLayout(content);
}

/** Resend invitation email — same shape as invitationEmail, new credentials. */
export function resendInvitationEmail(params: {
  name: string;
  username: string;
  tempPassword: string;
  code: string;
  frontendUrl: string;
}): string {
  const content = `
    ${heading(`Hola, ${params.name}`)}
    ${paragraph("Se ha generado una nueva contraseña temporal para tu cuenta. Usa las siguientes credenciales para acceder:")}
    ${infoBox(`
      <p style="margin:0 0 12px;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};"><strong>Usuario:</strong> <span style="color:${COLOR_PRIMARY};font-weight:600;">${params.username}</span></p>
      <p style="margin:0;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};"><strong>Contraseña temporal:</strong> <code style="background:#FFFFFF;padding:4px 10px;border-radius:6px;font-size:14px;color:${COLOR_PRIMARY};border:1px solid ${COLOR_BORDER};">${params.tempPassword}</code></p>
    `)}
    ${paragraph("Al iniciar sesión, el sistema te pedirá cambiar tu contraseña — ahí mismo ingresa este código de seguridad:")}
    ${codeBlock(params.code)}
    ${ctaButton("Acceder a la plataforma", params.frontendUrl)}`;

  return baseLayout(content);
}

/**
 * Forgot password email — sent when an employee requests a password reset.
 * Contains a brand-new temporary password (to log in with) and a 6-digit
 * confirmation code (to complete the reset after logging in).
 */
export function forgotPasswordEmail(params: {
  name: string;
  tempPassword: string;
  code: string;
}): string {
  const content = `
    ${heading("Recuperación de contraseña")}
    ${paragraph(`Hola ${params.name}, recibimos una solicitud para restablecer tu contraseña. Generamos una contraseña temporal para que puedas ingresar:`)}
    ${infoBox(`<p style="margin:0;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};"><strong>Contraseña temporal:</strong> <code style="background:#FFFFFF;padding:4px 10px;border-radius:6px;font-size:14px;color:${COLOR_PRIMARY};border:1px solid ${COLOR_BORDER};">${params.tempPassword}</code></p>`)}
    ${paragraph("Inicia sesión con esta contraseña temporal y, cuando el sistema te lo pida, ingresa el siguiente código de seguridad junto con tu nueva contraseña definitiva:")}
    ${codeBlock(params.code)}
    ${paragraph("La contraseña temporal y el código expiran en 15 minutos. Si no solicitaste este cambio, ignora este correo.", 0)}`;

  return baseLayout(content);
}

/** Student credentials email — sent to principal guardians */
export function studentCredentialsEmail(params: {
  guardianName: string;
  studentName: string;
  enrollment: string;
  tempPassword: string;
  portalUrl: string;
}): string {
  const content = `
    ${heading("Credenciales de acceso al portal")}
    ${paragraph(`Hola ${params.guardianName}, se han generado las credenciales de acceso al portal para el alumno <strong>${params.studentName}</strong>.`)}
    ${infoBox(`
      <p style="margin:0 0 12px;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};"><strong>Matrícula:</strong> <span style="color:${COLOR_PRIMARY};font-weight:600;">${params.enrollment}</span></p>
      <p style="margin:0;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};"><strong>Contraseña:</strong> <code style="background:#FFFFFF;padding:4px 10px;border-radius:6px;font-size:14px;color:${COLOR_PRIMARY};border:1px solid ${COLOR_BORDER};">${params.tempPassword}</code></p>
    `)}
    ${paragraph("⚠️ Al iniciar sesión por primera vez se pedirá cambiar la contraseña.", 28)}
    ${ctaButton("Acceder al portal", params.portalUrl)}`;

  return baseLayout(content);
}

/** Announcement notification email — sent to each resolved recipient when an announcement is created */
export function announcementNotificationEmail(params: {
  employeeName: string;
  announcementName: string;
  announcementDescription: string | null;
  frontendUrl: string;
}): string {
  const content = `
    ${heading(`Nuevo comunicado: ${params.announcementName}`)}
    ${paragraph(`Hola ${params.employeeName}, se publicó un nuevo comunicado en Colegio Lear${params.announcementDescription ? ":" : "."}`)}
    ${params.announcementDescription ? infoBox(`<p style="margin:0;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};">${params.announcementDescription}</p>`) : ""}
    ${ctaButton("Ver comunicado", params.frontendUrl)}`;

  return baseLayout(content);
}

/**
 * Generic "process status" email — mirrors the in-app info/error
 * notifications used for background jobs (e.g. academic cycle activation's
 * wallet-catalog copy). Reused for any started/completed/failed
 * notification sent to the single employee who triggered the action.
 */
export function processNotificationEmail(params: {
  employeeName: string;
  title: string;
  message: string;
  frontendUrl: string;
  isError?: boolean;
}): string {
  const accentColor = params.isError ? "#DC2626" : COLOR_PRIMARY;
  const backgroundColor = params.isError ? "#FEF2F2" : "#EFF6FF";

  const content = `
    ${heading(params.title)}
    ${paragraph(`Hola ${params.employeeName}:`)}
    ${infoBox(`<p style="margin:0;color:${COLOR_FOREGROUND};font-size:14px;font-family:${BODY_FONT};">${params.message}</p>`, accentColor, backgroundColor)}
    ${ctaButton("Ir a la plataforma", params.frontendUrl, accentColor)}`;

  return baseLayout(content);
}
