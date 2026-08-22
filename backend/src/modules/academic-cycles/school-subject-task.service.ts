import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
import { toPublicFileUrl } from "../../shared/helpers/file-url.helper";
import type { IStorageService } from "../../shared/services/storage.service";
import type {
  SchoolSubjectTaskRecord,
  SchoolSubjectTaskAttachmentRecord,
  CreateSchoolSubjectTaskDto,
  UpdateSchoolSubjectTaskDto,
  FileUpload,
  PagedResult,
} from "./school-subject-task.types";

interface PaginationParams {
  page: number;
  pageSize: number;
}

const TASK_INCLUDE = { attachments: true };

/**
 * Business logic for the school-subject tasks sub-resource. Shared by both
 * the employee CRUD controller and the student-portal read-only controller
 * (see school-subject-task-student.controller.ts) — the student side only
 * ever calls findAllPaged, with its own ownership check layered on top.
 */
export class SchoolSubjectTaskService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: IStorageService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toAttachmentRecord(raw: any): SchoolSubjectTaskAttachmentRecord {
    return {
      id: raw.id,
      url: toPublicFileUrl(raw.url),
      name: raw.name,
      extension: raw.extension,
      relatedRecordId: raw.schoolSubjectTaskId,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toRecord(raw: any): SchoolSubjectTaskRecord {
    return {
      id: raw.id,
      academicCycleId: raw.academicCycleId,
      academicCycleSchoolGroupId: raw.academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId: raw.academicCycleSchoolSubjectId,
      title: raw.title,
      description: raw.description,
      dueDate: raw.dueDate.toISOString(),
      createdAt: raw.createdAt.toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attachments: raw.attachments.map((a: any) => this.toAttachmentRecord(a)),
    };
  }

  /**
   * Verifies the group and subject both actually belong to the given
   * academic cycle before any read/write against a task scoped to them.
   */
  async ensureScopeExists(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
  ): Promise<void> {
    const [group, subject] = await Promise.all([
      this.prisma.academicCycleGroup.findFirst({
        where: { id: academicCycleSchoolGroupId, academicCycleId },
      }),
      this.prisma.academicCycleSchoolSubject.findFirst({
        where: { id: academicCycleSchoolSubjectId, academicCycleId },
      }),
    ]);

    if (!group) {
      throw new NotFoundError(
        "Academic cycle school group not found in this academic cycle",
      );
    }
    if (!subject) {
      throw new NotFoundError(
        "Academic cycle school subject not found in this academic cycle",
      );
    }
  }

  /** Full (non-paginated) list — used by the teacher-facing "my classes" endpoint. */
  async findAll(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
  ): Promise<SchoolSubjectTaskRecord[]> {
    await this.ensureScopeExists(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
    );

    const results = await this.prisma.schoolSubjectTask.findMany({
      where: { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId },
      include: TASK_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    return results.map((r) => this.toRecord(r));
  }

  async findAllPaged(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    pagination: PaginationParams,
  ): Promise<PagedResult<SchoolSubjectTaskRecord>> {
    await this.ensureScopeExists(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
    );

    const where = {
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
    };

    const [data, itemsCount] = await Promise.all([
      this.prisma.schoolSubjectTask.findMany({
        where,
        include: TASK_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.schoolSubjectTask.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toRecord(r)),
      totalPages: Math.ceil(itemsCount / pagination.pageSize),
      currentPage: pagination.page,
      itemsCount,
    };
  }

  private async findOwnedTask(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    taskId: string,
  ) {
    const task = await this.prisma.schoolSubjectTask.findFirst({
      where: {
        id: taskId,
        academicCycleId,
        academicCycleSchoolGroupId,
        academicCycleSchoolSubjectId,
      },
      include: TASK_INCLUDE,
    });
    if (!task) throw new NotFoundError("School subject task not found");
    return task;
  }

  async create(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    dto: CreateSchoolSubjectTaskDto,
  ): Promise<SchoolSubjectTaskRecord> {
    await this.ensureScopeExists(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
    );

    const created = await this.prisma.schoolSubjectTask.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        dueDate: new Date(dto.dueDate),
        academicCycleId,
        academicCycleSchoolGroupId,
        academicCycleSchoolSubjectId,
      },
      include: TASK_INCLUDE,
    });

    return this.toRecord(created);
  }

  async update(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    taskId: string,
    dto: UpdateSchoolSubjectTaskDto,
  ): Promise<SchoolSubjectTaskRecord> {
    await this.findOwnedTask(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
      taskId,
    );

    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.dueDate !== undefined) updateData.dueDate = new Date(dto.dueDate);

    const updated = await this.prisma.schoolSubjectTask.update({
      where: { id: taskId },
      data: updateData,
      include: TASK_INCLUDE,
    });

    return this.toRecord(updated);
  }

  /** Deletes the task, its attachment rows (DB cascade), and their files in storage. */
  async remove(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    taskId: string,
  ): Promise<void> {
    const task = await this.findOwnedTask(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
      taskId,
    );

    await Promise.all(task.attachments.map((a) => this.storage.delete(a.url)));
    await this.prisma.schoolSubjectTask.delete({ where: { id: taskId } });
  }

  /** Uploads the file and creates the attachment row; returns the raw created row. */
  private async uploadTaskAttachment(taskId: string, file: FileUpload) {
    const url = await this.storage.upload({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      subfolder: "school-subject-tasks",
    });

    const nameParts = file.originalname.split(".");
    const extension = nameParts.length > 1 ? nameParts.pop()! : "";
    const name = nameParts.join(".");

    return this.prisma.schoolSubjectTaskAttachment.create({
      data: { url, name, extension, schoolSubjectTaskId: taskId },
    });
  }

  /** Employee-facing: returns the full task (with all its attachments). */
  async addAttachment(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    taskId: string,
    file: FileUpload,
  ): Promise<SchoolSubjectTaskRecord> {
    await this.findOwnedTask(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
      taskId,
    );

    await this.uploadTaskAttachment(taskId, file);

    const updated = await this.prisma.schoolSubjectTask.findUniqueOrThrow({
      where: { id: taskId },
      include: TASK_INCLUDE,
    });
    return this.toRecord(updated);
  }

  /** Teacher-facing ("my classes"): returns only the newly created attachment. */
  async addAttachmentRecord(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    taskId: string,
    file: FileUpload,
  ): Promise<SchoolSubjectTaskAttachmentRecord> {
    await this.findOwnedTask(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
      taskId,
    );

    const created = await this.uploadTaskAttachment(taskId, file);
    return this.toAttachmentRecord(created);
  }

  async removeAttachment(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    taskId: string,
    attachmentId: string,
  ): Promise<void> {
    await this.findOwnedTask(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
      taskId,
    );

    const attachment = await this.prisma.schoolSubjectTaskAttachment.findFirst({
      where: { id: attachmentId, schoolSubjectTaskId: taskId },
    });
    if (!attachment) throw new NotFoundError("Attachment not found");

    await this.storage.delete(attachment.url);
    await this.prisma.schoolSubjectTaskAttachment.delete({
      where: { id: attachmentId },
    });
  }
}
