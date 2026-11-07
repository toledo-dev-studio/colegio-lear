# Cron job: entrega de notificaciones

App pequeña e independiente del backend que corre como **Render Cron Job**. En cada ejecución:

1. (Opcional) Envía un correo de prueba a `CRON_TEST_EMAIL`.
2. Busca las notificaciones con `sent = false` cuya fecha programada (`scheduled_for`) ya llegó.
3. Envía el correo de cada una por **Microsoft Graph**: a los empleados directo, y a los alumnos a través de su(s) tutor(es) principal(es).
4. Las marca como enviadas (`sent = true`). Si un correo falla, se reintenta en la siguiente ejecución, hasta 3 intentos. Después se marca como enviada sin correo, para que al menos aparezca en la campanita.
5. Termina. El código de salida es `0` si todo salió bien, o `1` si algo falló (correo de prueba, base de datos o algún correo de notificación).

Usa SQL directo con `pg` y `fetch` para Graph. No depende del código del backend.

> **Mantener en sincronía con el backend:**
> - `src/release.ts` replica `NotificationService.releaseDueNotifications` (`backend/src/modules/notifications/notification.service.ts`).
> - `src/templates.ts` copia la plantilla `announcementNotificationEmail` (`backend/src/shared/templates/email.templates.ts`).
>
> Si cambia la lógica o la plantilla en el backend, o el schema de esas tablas, hay que actualizar aquí también.

## Variables de entorno

Solo estas. Si falta alguna obligatoria, el job se detiene al arrancar indicando cuáles faltan.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | ✅ | La misma del web service del backend |
| `MAIL_FROM` | ✅ | Buzón de Microsoft 365 que envía, ej. `noreply@colegiolear.mx` |
| `MAIL_GRAPH_TENANT_ID` | ✅ | Del App Registration (el mismo del backend) |
| `MAIL_GRAPH_CLIENT_ID` | ✅ | Del App Registration |
| `MAIL_GRAPH_CLIENT_SECRET` | ✅ | Del App Registration (permiso `Mail.Send` de tipo Application) |
| `FRONTEND_URL_ADMIN` | ✅ | Link del botón en correos a empleados |
| `FRONTEND_URL_STUDENT` | ✅ | Link del botón en correos a tutores |
| `CRON_TEST_EMAIL` | — | Si tiene un correo, cada ejecución le envía un correo de prueba. **Dejar vacío en operación normal.** |

Ver [`.env.example`](.env.example).

## Configuración en Render (New → Cron Job)

| Campo | Valor |
|---|---|
| **Language** | `Docker` |
| **Branch** | la misma rama que el web service |
| **Root Directory** | `cronjobs/notification-delivery`. Así solo se reconstruye cuando cambia esta carpeta. |
| **Dockerfile Path** | `./Dockerfile`, relativo al Root Directory. Si Render no lo encuentra, usar `./cronjobs/notification-delivery/Dockerfile`. |
| **Docker Command** | vacío: usa el `CMD` del Dockerfile |
| **Schedule** | `0 12 * * *` → Render usa **UTC**; equivale a las 6:00 am de México (UTC-6) |
| **Environment** | las variables de la tabla de arriba |

**Importante, en el web service del backend:** definir `ENABLE_IN_PROCESS_JOBS=false`. Si el job corre en los dos lugares a la vez, se duplican los correos.

## Validar en Render

1. Pon `CRON_TEST_EMAIL` con tu correo y da **Trigger Run**.
2. En los logs de la ejecución deben aparecer `Test email sent to …` y `Notification delivery finished: X due, X released, 0 failed`, y debe llegarte el correo.
3. Borra `CRON_TEST_EMAIL` o déjala vacía.

Render garantiza **una sola ejecución activa a la vez** y corta las que pasan de 12 h. Se cobra por segundo de ejecución, con un **mínimo de US$1 al mes**.

## Desarrollo local

```sh
cd cronjobs/notification-delivery
npm install
npm run build
# con las variables definidas en el entorno:
npm start

# o con Docker (contexto = esta carpeta):
docker build -t colegio-lear-cron-notifications .
docker run --rm --env-file .env colegio-lear-cron-notifications
```

> `docker run --env-file` **no quita comillas**: en ese archivo escribe `MAIL_FROM=noreply@colegiolear.mx`, no `MAIL_FROM="..."`.
>
> Con una `DATABASE_URL` real, el job **envía correos de verdad** a los destinatarios de las notificaciones pendientes.
