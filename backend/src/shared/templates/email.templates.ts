/**
 * Email HTML templates for Colegio Lear.
 * Uses inline styles for maximum email client compatibility.
 * Brand colors from frontend: primary #1E6FDB, background #F4F7FB, foreground #0F172A
 */

const APP_VERSION = "1.0.0";
const CURRENT_YEAR = new Date().getFullYear();

/** Base layout wrapper for all emails */
function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F4F7FB;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F7FB;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1E6FDB;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Colegio Lear</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F0F4F8;padding:24px 40px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="margin:0 0 8px;color:#64748B;font-size:12px;">© ${CURRENT_YEAR} Colegio Lear. Todos los derechos reservados.</p>
              <p style="margin:0;color:#94A3B8;font-size:11px;">API v${APP_VERSION}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Invitation email — sent when a new employee is created */
export function invitationEmail(params: {
  name: string;
  username: string;
  tempPassword: string;
  frontendUrl: string;
}): string {
  const content = `
    <h2 style="margin:0 0 8px;color:#0F172A;font-size:20px;font-weight:600;">¡Bienvenido/a, ${params.name}!</h2>
    <p style="margin:0 0 24px;color:#64748B;font-size:14px;line-height:1.6;">Se ha creado tu cuenta en la plataforma de Colegio Lear. A continuación encontrarás tus credenciales de acceso:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFF6FF;border-radius:8px;padding:20px;margin-bottom:24px;">
      <tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 12px;color:#0F172A;font-size:14px;"><strong>Usuario:</strong> <span style="color:#1E6FDB;font-weight:600;">${params.username}</span></p>
          <p style="margin:0;color:#0F172A;font-size:14px;"><strong>Contraseña temporal:</strong> <code style="background:#FFFFFF;padding:4px 8px;border-radius:4px;font-size:14px;color:#1E6FDB;border:1px solid #E2E8F0;">${params.tempPassword}</code></p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;color:#64748B;font-size:13px;line-height:1.5;">⚠️ Al iniciar sesión por primera vez se te pedirá cambiar tu contraseña.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="border-radius:8px;background-color:#1E6FDB;">
          <a href="${params.frontendUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;">Acceder a la plataforma</a>
        </td>
      </tr>
    </table>`;

  return baseLayout(content);
}

/** Resend invitation email */
export function resendInvitationEmail(params: {
  name: string;
  username: string;
  tempPassword: string;
  frontendUrl: string;
}): string {
  const content = `
    <h2 style="margin:0 0 8px;color:#0F172A;font-size:20px;font-weight:600;">Hola, ${params.name}</h2>
    <p style="margin:0 0 24px;color:#64748B;font-size:14px;line-height:1.6;">Se ha generado una nueva contraseña temporal para tu cuenta. Usa las siguientes credenciales para acceder:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFF6FF;border-radius:8px;padding:20px;margin-bottom:24px;">
      <tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 12px;color:#0F172A;font-size:14px;"><strong>Usuario:</strong> <span style="color:#1E6FDB;font-weight:600;">${params.username}</span></p>
          <p style="margin:0;color:#0F172A;font-size:14px;"><strong>Contraseña temporal:</strong> <code style="background:#FFFFFF;padding:4px 8px;border-radius:4px;font-size:14px;color:#1E6FDB;border:1px solid #E2E8F0;">${params.tempPassword}</code></p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;color:#64748B;font-size:13px;line-height:1.5;">⚠️ Al iniciar sesión se te pedirá cambiar tu contraseña.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="border-radius:8px;background-color:#1E6FDB;">
          <a href="${params.frontendUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;">Acceder a la plataforma</a>
        </td>
      </tr>
    </table>`;

  return baseLayout(content);
}

/** Forgot password email — sends 6-digit code + reset link */
export function forgotPasswordEmail(params: {
  name: string;
  code: string;
  resetLink: string;
}): string {
  const content = `
    <h2 style="margin:0 0 8px;color:#0F172A;font-size:20px;font-weight:600;">Recuperación de contraseña</h2>
    <p style="margin:0 0 24px;color:#64748B;font-size:14px;line-height:1.6;">Hola ${params.name}, recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código de verificación:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFF6FF;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;text-align:center;">
          <p style="margin:0 0 8px;color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Código de verificación</p>
          <p style="margin:0;color:#1E6FDB;font-size:32px;font-weight:700;letter-spacing:6px;">${params.code}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;color:#64748B;font-size:13px;line-height:1.5;">O haz clic en el siguiente botón para ir directamente a la página de cambio de contraseña:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="border-radius:8px;background-color:#1E6FDB;">
          <a href="${params.resetLink}" target="_blank" style="display:inline-block;padding:14px 32px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;">Cambiar contraseña</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#94A3B8;font-size:12px;line-height:1.5;">Este código expira en 10 minutos. Si no solicitaste este cambio, ignora este correo.</p>`;

  return baseLayout(content);
}
