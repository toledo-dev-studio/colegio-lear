import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
import { AcademicCycleSchoolGroupService } from "../academic-cycles/academic-cycle-school-group.service";
import { resolveTeacherGroupScope } from "../academic-cycles/teacher-class-scope.helper";
import type { ChatRecord, ChatMessageRecord, PagedResult } from "./chat.types";

interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Business logic for the student chat module. There is no stored "chat"
 * entity — a conversation is just the pair (enrollment, teacher), and the
 * list of conversations is derived by reusing
 * AcademicCycleSchoolGroupService.findAllTeachers (same data the
 * horario/docentes module already exposes) rather than duplicating that
 * mapping.
 */
export class ChatService {
  private readonly schoolGroupService: AcademicCycleSchoolGroupService;

  constructor(private readonly prisma: PrismaClient) {
    this.schoolGroupService = new AcademicCycleSchoolGroupService(prisma);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toMessageRecord(raw: any): ChatMessageRecord {
    return {
      id: raw.id,
      chatId: raw.teacherId,
      sentBy: raw.sentBy,
      content: raw.content,
      sentAt: raw.sentAt.toISOString(),
    };
  }

  /** Resolves the enrollment and verifies it belongs to this student — 404 either way, never distinguishing "doesn't exist" from "not yours". */
  private async findOwnedEnrollment(studentId: string, enrollmentId: string) {
    const enrollment = await this.prisma.academicCycleEnrollment.findFirst({
      where: { id: enrollmentId, studentId },
    });
    if (!enrollment) {
      throw new NotFoundError("Inscripción del ciclo escolar no encontrada");
    }
    return enrollment;
  }

  /** Verifies teacherId is one of the teachers currently teaching this enrollment's group. */
  private async findOwnedTeacher(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    teacherId: string,
  ) {
    const teachers = await this.schoolGroupService.findAllTeachers(
      academicCycleId,
      academicCycleSchoolGroupId,
      false,
    );
    const found = teachers.find((t) => t.teacherId === teacherId);
    if (!found) {
      throw new NotFoundError("Profesor no encontrado para este grupo escolar");
    }
    return found;
  }

  async findAllChats(studentId: string, enrollmentId: string): Promise<ChatRecord[]> {
    const enrollment = await this.findOwnedEnrollment(studentId, enrollmentId);
    const teachers = await this.schoolGroupService.findAllTeachers(
      enrollment.academicCycleId,
      enrollment.academicCycleSchoolGroupId,
      false,
    );

    return Promise.all(
      teachers.map(async (t) => {
        const [lastMessage, unreadCount] = await Promise.all([
          this.prisma.studentChatMessage.findFirst({
            where: { academicCycleEnrollmentId: enrollmentId, teacherId: t.teacherId },
            orderBy: { sentAt: "desc" },
          }),
          this.prisma.studentChatMessage.count({
            where: {
              academicCycleEnrollmentId: enrollmentId,
              teacherId: t.teacherId,
              sentBy: "teacher",
              read: false,
            },
          }),
        ]);

        const record: ChatRecord = {
          enrollmentId,
          teacherId: t.teacherId,
          teacher: t.teacher,
          schoolSubject: t.schoolSubject,
          lastMessage: lastMessage?.content ?? null,
          lastMessageAt: lastMessage ? lastMessage.sentAt.toISOString() : null,
          unreadCount,
        };
        return record;
      }),
    );
  }

  /**
   * Paginated "from the end of history" — page 1 = most recent messages,
   * same semantics the frontend's own mock implements (get-chat-messages.api.ts).
   * Also marks sentBy: teacher messages as read when the student opens the
   * first page (today always a no-op: nothing creates teacher messages yet).
   */
  async findMessages(
    studentId: string,
    enrollmentId: string,
    teacherId: string,
    pagination: PaginationParams,
  ): Promise<PagedResult<ChatMessageRecord>> {
    const enrollment = await this.findOwnedEnrollment(studentId, enrollmentId);
    await this.findOwnedTeacher(
      enrollment.academicCycleId,
      enrollment.academicCycleSchoolGroupId,
      teacherId,
    );

    const where = { academicCycleEnrollmentId: enrollmentId, teacherId };

    const [data, itemsCount] = await Promise.all([
      this.prisma.studentChatMessage.findMany({
        where,
        orderBy: { sentAt: "desc" },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.studentChatMessage.count({ where }),
    ]);

    const ascending = data.slice().reverse();

    if (pagination.page === 1) {
      await this.prisma.studentChatMessage.updateMany({
        where: { ...where, sentBy: "teacher", read: false },
        data: { read: true },
      });
    }

    return {
      data: ascending.map((r) => this.toMessageRecord(r)),
      totalPages: Math.ceil(itemsCount / pagination.pageSize),
      currentPage: pagination.page,
      itemsCount,
    };
  }

  /**
   * Creates a student-sent message and notifies the teacher through the
   * existing employee notification table (GET /notifications/admin/:id
   * already displays it — no new endpoint needed). No email: this is a
   * bell-only notification, same as how read/unread already works for
   * employees.
   */
  async sendMessage(
    studentId: string,
    enrollmentId: string,
    teacherId: string,
    content: string,
  ): Promise<ChatMessageRecord> {
    const enrollment = await this.findOwnedEnrollment(studentId, enrollmentId);
    await this.findOwnedTeacher(
      enrollment.academicCycleId,
      enrollment.academicCycleSchoolGroupId,
      teacherId,
    );

    const [student, created] = await Promise.all([
      this.prisma.student.findUnique({
        where: { id: studentId },
        select: { name: true, firstLastName: true },
      }),
      this.prisma.studentChatMessage.create({
        data: {
          academicCycleEnrollmentId: enrollmentId,
          teacherId,
          sentBy: "student",
          content,
        },
      }),
    ]);

    const studentName = student ? `${student.name} ${student.firstLastName}` : "Un alumno";
    await this.prisma.notification.create({
      data: {
        employeeId: teacherId,
        title: "Nuevo mensaje",
        message: `${studentName}: ${content.slice(0, 200)}`,
        type: "message",
        relatedRecordId: enrollmentId,
      },
    });

    return this.toMessageRecord(created);
  }

  /**
   * Resolves the enrollment and verifies it belongs to `studentId` AND that
   * `teacherId` actually teaches (any subject) in the enrollment's group —
   * the teacher-facing ("my classes") equivalent of
   * findOwnedEnrollment + findOwnedTeacher above, checked from the other
   * side of the conversation. 404 either way, same posture.
   */
  private async findEnrollmentOwnedByStudentAndTeacher(
    studentId: string,
    enrollmentId: string,
    teacherId: string,
  ) {
    const enrollment = await this.prisma.academicCycleEnrollment.findFirst({
      where: { id: enrollmentId, studentId },
    });
    if (!enrollment) {
      throw new NotFoundError("Inscripción del ciclo escolar no encontrada");
    }

    await resolveTeacherGroupScope(
      this.prisma,
      teacherId,
      enrollment.academicCycleId,
      enrollment.academicCycleSchoolGroupId,
    );

    return enrollment;
  }

  /**
   * Teacher-facing ("my classes") equivalent of findMessages above — same
   * pagination semantics, no "mark as read" side effect: the `read` column
   * only ever tracks whether the student has seen a teacher's message (mis
   * clases' student list has no unread indicator to update in the other
   * direction, see StudentsList.tsx).
   */
  async findMessagesForTeacher(
    teacherId: string,
    studentId: string,
    enrollmentId: string,
    pagination: PaginationParams,
  ): Promise<PagedResult<ChatMessageRecord>> {
    await this.findEnrollmentOwnedByStudentAndTeacher(studentId, enrollmentId, teacherId);

    const where = { academicCycleEnrollmentId: enrollmentId, teacherId };

    const [data, itemsCount] = await Promise.all([
      this.prisma.studentChatMessage.findMany({
        where,
        orderBy: { sentAt: "desc" },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.studentChatMessage.count({ where }),
    ]);

    const ascending = data.slice().reverse();

    return {
      data: ascending.map((r) => this.toMessageRecord(r)),
      totalPages: Math.ceil(itemsCount / pagination.pageSize),
      currentPage: pagination.page,
      itemsCount,
    };
  }

  /**
   * Teacher-facing ("my classes") equivalent of sendMessage above — notifies
   * the student's own bell (Notification row, recipientType: "student"),
   * not their guardian's email — this is an in-app, immediate notification,
   * not the guardian-mediated announcement email flow.
   */
  async sendMessageForTeacher(
    teacherId: string,
    studentId: string,
    enrollmentId: string,
    content: string,
  ): Promise<ChatMessageRecord> {
    await this.findEnrollmentOwnedByStudentAndTeacher(studentId, enrollmentId, teacherId);

    const [teacher, created] = await Promise.all([
      this.prisma.employee.findUnique({
        where: { id: teacherId },
        select: { name: true, firstLastName: true },
      }),
      this.prisma.studentChatMessage.create({
        data: {
          academicCycleEnrollmentId: enrollmentId,
          teacherId,
          sentBy: "teacher",
          content,
        },
      }),
    ]);

    const teacherName = teacher ? `${teacher.name} ${teacher.firstLastName}` : "Un profesor";
    await this.prisma.notification.create({
      data: {
        recipientType: "student",
        studentId,
        title: "Nuevo mensaje",
        message: `${teacherName}: ${content.slice(0, 200)}`,
        type: "message",
        relatedRecordId: enrollmentId,
      },
    });

    return this.toMessageRecord(created);
  }
}
