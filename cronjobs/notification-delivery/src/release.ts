import { pool } from "./db";
import { config } from "./config";
import { sendMail } from "./mail";
import { announcementNotificationEmail } from "./templates";

/**
 * Same behavior as the backend's NotificationService.releaseDueNotifications,
 * in plain SQL: every notification with sent=false whose scheduled_for has
 * arrived gets its email sent and is flipped to sent=true (so it shows in the
 * bell). On email failure it retries on the next run (delivery_attempts+1);
 * after MAX_DELIVERY_ATTEMPTS it gives up on the email but still marks it
 * sent. Students are emailed through their principal guardian(s).
 */

const MAX_DELIVERY_ATTEMPTS = 3;

interface DueNotification {
  id: string;
  employee_id: string | null;
  student_id: string | null;
  related_record_id: string;
  type: string;
  delivery_attempts: number;
}

interface Announcement {
  id: string;
  name: string;
  description: string | null;
}

interface Recipient {
  email: string;
  recipientName: string;
  /** Set for guardian recipients: the student the email is about */
  studentName?: string;
}

export interface ReleaseSummary {
  due: number;
  released: number;
  failed: number;
}

async function markSent(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await pool.query(`UPDATE core.notifications SET sent = true WHERE id = ANY($1::uuid[])`, [ids]);
}

/** Principal guardians with an email, grouped by student id */
async function guardianRecipientsByStudent(studentIds: string[]): Promise<Map<string, Recipient[]>> {
  const byStudent = new Map<string, Recipient[]>();
  if (studentIds.length === 0) return byStudent;

  const { rows: students } = await pool.query<{ id: string; name: string; first_last_name: string }>(
    `SELECT id, name, first_last_name FROM core.students WHERE id = ANY($1::uuid[])`,
    [studentIds],
  );
  if (students.length === 0) return byStudent;
  const studentById = new Map(students.map((s) => [s.id, s]));

  const { rows: guardians } = await pool.query<{ student_id: string; full_name: string; email: string | null }>(
    `SELECT student_id, full_name, email FROM core.student_guardians
     WHERE student_id = ANY($1::uuid[]) AND is_principal = true`,
    [students.map((s) => s.id)],
  );
  for (const g of guardians) {
    if (!g.email) continue;
    const student = studentById.get(g.student_id);
    const list = byStudent.get(g.student_id) ?? [];
    list.push({
      email: g.email,
      recipientName: g.full_name,
      ...(student ? { studentName: `${student.name} ${student.first_last_name}` } : {}),
    });
    byStudent.set(g.student_id, list);
  }
  return byStudent;
}

/** Emails one notification's recipients and marks it sent (or counts a failed attempt) */
async function releaseOne(
  notification: DueNotification,
  announcement: Announcement,
  recipients: Recipient[],
  summary: ReleaseSummary,
): Promise<void> {
  if (recipients.length === 0) {
    await markSent([notification.id]);
    summary.released++;
    return;
  }

  try {
    await Promise.all(
      recipients.map((r) =>
        sendMail({
          to: r.email,
          subject: `Nuevo comunicado: ${announcement.name}`,
          html: announcementNotificationEmail({
            recipientName: r.recipientName,
            announcementName: announcement.name,
            announcementDescription: announcement.description,
            frontendUrl: r.studentName ? config.frontendUrlStudent : config.frontendUrlAdmin,
            ...(r.studentName ? { studentName: r.studentName } : {}),
          }),
        }),
      ),
    );
    await markSent([notification.id]);
    summary.released++;
  } catch (error) {
    const attempts = notification.delivery_attempts + 1;
    const giveUp = attempts >= MAX_DELIVERY_ATTEMPTS;
    summary.failed++;
    console.error(
      `Failed to send a scheduled announcement email (announcement ${announcement.id}, notification ${notification.id}, attempt ${attempts}${giveUp ? ", giving up" : ""}):`,
      (error as Error).message,
    );
    await pool.query(
      `UPDATE core.notifications SET delivery_attempts = $2, sent = $3 WHERE id = $1`,
      [notification.id, attempts, giveUp],
    );
  }
}

export async function releaseDueNotifications(): Promise<ReleaseSummary> {
  // scheduled_for is a TIMESTAMP without time zone holding UTC (Prisma's convention)
  const { rows: due } = await pool.query<DueNotification>(
    `SELECT id, employee_id, student_id, related_record_id, type::text AS type, delivery_attempts
     FROM core.notifications
     WHERE sent = false AND scheduled_for <= (now() AT TIME ZONE 'UTC')`,
  );
  const summary: ReleaseSummary = { due: due.length, released: 0, failed: 0 };
  if (due.length === 0) return summary;

  // Announcements are the only type created with sent=false today; anything
  // else is released plainly rather than dropped.
  const byAnnouncement = new Map<string, DueNotification[]>();
  const nonAnnouncement: string[] = [];
  for (const n of due) {
    if (n.type !== "announcement") {
      nonAnnouncement.push(n.id);
      continue;
    }
    const list = byAnnouncement.get(n.related_record_id) ?? [];
    list.push(n);
    byAnnouncement.set(n.related_record_id, list);
  }
  await markSent(nonAnnouncement);
  summary.released += nonAnnouncement.length;

  for (const [announcementId, notifications] of byAnnouncement) {
    try {
      const { rows } = await pool.query<Announcement>(
        `SELECT id, name, description FROM core.announcements WHERE id = $1`,
        [announcementId],
      );
      const announcement = rows[0];
      if (!announcement) {
        // Announcement gone (shouldn't happen) — release without emailing
        await markSent(notifications.map((n) => n.id));
        summary.released += notifications.length;
        continue;
      }

      const employeeIds = notifications.map((n) => n.employee_id).filter((id): id is string => id !== null);
      const { rows: employees } = employeeIds.length
        ? await pool.query<{ id: string; email: string; name: string }>(
            `SELECT id, email, name FROM core.employees WHERE id = ANY($1::uuid[])`,
            [employeeIds],
          )
        : { rows: [] };
      const employeeById = new Map(employees.map((e) => [e.id, e]));

      const studentIds = notifications.map((n) => n.student_id).filter((id): id is string => id !== null);
      const guardiansByStudent = await guardianRecipientsByStudent(studentIds);

      await Promise.all(
        notifications.map(async (n) => {
          if (n.employee_id) {
            const employee = employeeById.get(n.employee_id);
            if (!employee) {
              await markSent([n.id]);
              summary.released++;
              return;
            }
            await releaseOne(n, announcement, [{ email: employee.email, recipientName: employee.name }], summary);
          } else if (n.student_id) {
            await releaseOne(n, announcement, guardiansByStudent.get(n.student_id) ?? [], summary);
          }
        }),
      );
    } catch (error) {
      // Leave sent=false — the next run retries this announcement
      summary.failed += notifications.length;
      console.error(`Failed to release scheduled notifications for announcement ${announcementId}:`, (error as Error).message);
    }
  }

  return summary;
}
