import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
import { AcademicCycleSchoolGroupService } from "../academic-cycles/academic-cycle-school-group.service";
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
      throw new NotFoundError("Academic cycle enrollment not found");
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
      throw new NotFoundError("Teacher not found for this school group");
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
}
