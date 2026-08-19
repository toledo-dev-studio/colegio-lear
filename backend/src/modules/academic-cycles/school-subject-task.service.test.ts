import { describe, it, expect, beforeEach, vi } from "vitest";
import { SchoolSubjectTaskService } from "./school-subject-task.service";
import { NotFoundError } from "../../shared/errors/app-error";

/**
 * Unit tests for SchoolSubjectTaskService — covers the FK-scope validation
 * (group/subject must belong to the cycle) and CRUD + attachment lifecycle.
 * PrismaClient and IStorageService are fully mocked.
 */

function createMockPrisma() {
  return {
    academicCycleGroup: { findFirst: vi.fn() },
    academicCycleSchoolSubject: { findFirst: vi.fn() },
    schoolSubjectTask: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    schoolSubjectTaskAttachment: {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  };
}

function createMockStorage() {
  return { upload: vi.fn(), delete: vi.fn() };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;
type MockStorage = ReturnType<typeof createMockStorage>;

const CYCLE_ID = "cycle-uuid";
const GROUP_ID = "group-uuid";
const SUBJECT_ID = "subject-uuid";
const TASK_ID = "task-uuid";

const BASE_TASK = {
  id: TASK_ID,
  title: "Resolución de problemas",
  description: "Resolver ejercicios 1-10",
  dueDate: new Date("2026-09-15T00:00:00.000Z"),
  academicCycleId: CYCLE_ID,
  academicCycleSchoolGroupId: GROUP_ID,
  academicCycleSchoolSubjectId: SUBJECT_ID,
  createdAt: new Date("2026-09-10T10:00:00.000Z"),
  attachments: [] as unknown[],
};

describe("SchoolSubjectTaskService", () => {
  let prisma: MockPrisma;
  let storage: MockStorage;
  let service: SchoolSubjectTaskService;

  beforeEach(() => {
    prisma = createMockPrisma();
    storage = createMockStorage();
    service = new SchoolSubjectTaskService(prisma as any, storage as any);
    prisma.academicCycleGroup.findFirst.mockResolvedValue({ id: GROUP_ID });
    prisma.academicCycleSchoolSubject.findFirst.mockResolvedValue({ id: SUBJECT_ID });
  });

  describe("ensureScopeExists", () => {
    it("throws NotFoundError when the group doesn't belong to the cycle", async () => {
      prisma.academicCycleGroup.findFirst.mockResolvedValue(null);

      await expect(
        service.ensureScopeExists(CYCLE_ID, GROUP_ID, SUBJECT_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when the subject doesn't belong to the cycle", async () => {
      prisma.academicCycleSchoolSubject.findFirst.mockResolvedValue(null);

      await expect(
        service.ensureScopeExists(CYCLE_ID, GROUP_ID, SUBJECT_ID),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("findAllPaged", () => {
    it("returns paginated tasks ordered by createdAt desc", async () => {
      prisma.schoolSubjectTask.findMany.mockResolvedValue([BASE_TASK]);
      prisma.schoolSubjectTask.count.mockResolvedValue(1);

      const result = await service.findAllPaged(CYCLE_ID, GROUP_ID, SUBJECT_ID, {
        page: 1,
        pageSize: 5,
      });

      expect(prisma.schoolSubjectTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            academicCycleId: CYCLE_ID,
            academicCycleSchoolGroupId: GROUP_ID,
            academicCycleSchoolSubjectId: SUBJECT_ID,
          },
          orderBy: { createdAt: "desc" },
          skip: 0,
          take: 5,
        }),
      );
      expect(result.data[0]!.title).toBe("Resolución de problemas");
      expect(result.itemsCount).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("maps attachments with relatedRecordId = the task's id", async () => {
      prisma.schoolSubjectTask.findMany.mockResolvedValue([
        {
          ...BASE_TASK,
          attachments: [
            { id: "att-1", url: "school-subject-tasks/f.pdf", name: "f", extension: "pdf", schoolSubjectTaskId: TASK_ID },
          ],
        },
      ]);
      prisma.schoolSubjectTask.count.mockResolvedValue(1);

      const result = await service.findAllPaged(CYCLE_ID, GROUP_ID, SUBJECT_ID, {
        page: 1,
        pageSize: 5,
      });

      expect(result.data[0]!.attachments[0]).toMatchObject({
        id: "att-1",
        relatedRecordId: TASK_ID,
      });
    });
  });

  describe("create", () => {
    it("creates a task scoped to cycle/group/subject", async () => {
      prisma.schoolSubjectTask.create.mockResolvedValue(BASE_TASK);

      await service.create(CYCLE_ID, GROUP_ID, SUBJECT_ID, {
        title: "Resolución de problemas",
        description: "Resolver ejercicios 1-10",
        dueDate: "2026-09-15T00:00:00.000Z",
      });

      expect(prisma.schoolSubjectTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Resolución de problemas",
            academicCycleId: CYCLE_ID,
            academicCycleSchoolGroupId: GROUP_ID,
            academicCycleSchoolSubjectId: SUBJECT_ID,
          }),
        }),
      );
    });

    it("throws NotFoundError when the scope is invalid", async () => {
      prisma.academicCycleGroup.findFirst.mockResolvedValue(null);

      await expect(
        service.create(CYCLE_ID, GROUP_ID, SUBJECT_ID, {
          title: "x",
          dueDate: "2026-09-15T00:00:00.000Z",
        }),
      ).rejects.toThrow(NotFoundError);
      expect(prisma.schoolSubjectTask.create).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("throws NotFoundError when the task isn't in this scope", async () => {
      prisma.schoolSubjectTask.findFirst.mockResolvedValue(null);

      await expect(
        service.update(CYCLE_ID, GROUP_ID, SUBJECT_ID, TASK_ID, { title: "x" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("updates only the provided fields", async () => {
      prisma.schoolSubjectTask.findFirst.mockResolvedValue(BASE_TASK);
      prisma.schoolSubjectTask.update.mockResolvedValue({
        ...BASE_TASK,
        title: "Nuevo título",
      });

      await service.update(CYCLE_ID, GROUP_ID, SUBJECT_ID, TASK_ID, {
        title: "Nuevo título",
      });

      expect(prisma.schoolSubjectTask.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: TASK_ID },
          data: { title: "Nuevo título" },
        }),
      );
    });
  });

  describe("remove", () => {
    it("deletes every attachment's file in storage before deleting the task", async () => {
      prisma.schoolSubjectTask.findFirst.mockResolvedValue({
        ...BASE_TASK,
        attachments: [
          { id: "att-1", url: "school-subject-tasks/a.pdf" },
          { id: "att-2", url: "school-subject-tasks/b.pdf" },
        ],
      });

      await service.remove(CYCLE_ID, GROUP_ID, SUBJECT_ID, TASK_ID);

      expect(storage.delete).toHaveBeenCalledWith("school-subject-tasks/a.pdf");
      expect(storage.delete).toHaveBeenCalledWith("school-subject-tasks/b.pdf");
      expect(prisma.schoolSubjectTask.delete).toHaveBeenCalledWith({
        where: { id: TASK_ID },
      });
    });

    it("throws NotFoundError when the task isn't in this scope", async () => {
      prisma.schoolSubjectTask.findFirst.mockResolvedValue(null);

      await expect(
        service.remove(CYCLE_ID, GROUP_ID, SUBJECT_ID, TASK_ID),
      ).rejects.toThrow(NotFoundError);
      expect(prisma.schoolSubjectTask.delete).not.toHaveBeenCalled();
    });
  });

  describe("addAttachment", () => {
    it("uploads the file and creates the attachment row", async () => {
      prisma.schoolSubjectTask.findFirst.mockResolvedValue(BASE_TASK);
      storage.upload.mockResolvedValue("school-subject-tasks/new.pdf");
      prisma.schoolSubjectTask.findUniqueOrThrow.mockResolvedValue(BASE_TASK);

      await service.addAttachment(CYCLE_ID, GROUP_ID, SUBJECT_ID, TASK_ID, {
        buffer: Buffer.from("x"),
        originalname: "ejercicios.pdf",
        mimetype: "application/pdf",
      });

      expect(storage.upload).toHaveBeenCalledWith({
        buffer: expect.any(Buffer),
        fileName: "ejercicios.pdf",
        mimeType: "application/pdf",
        subfolder: "school-subject-tasks",
      });
      expect(prisma.schoolSubjectTaskAttachment.create).toHaveBeenCalledWith({
        data: {
          url: "school-subject-tasks/new.pdf",
          name: "ejercicios",
          extension: "pdf",
          schoolSubjectTaskId: TASK_ID,
        },
      });
    });
  });

  describe("removeAttachment", () => {
    it("throws NotFoundError when the attachment isn't on this task", async () => {
      prisma.schoolSubjectTask.findFirst.mockResolvedValue(BASE_TASK);
      prisma.schoolSubjectTaskAttachment.findFirst.mockResolvedValue(null);

      await expect(
        service.removeAttachment(CYCLE_ID, GROUP_ID, SUBJECT_ID, TASK_ID, "att-1"),
      ).rejects.toThrow(NotFoundError);
    });

    it("deletes the file in storage and the DB row", async () => {
      prisma.schoolSubjectTask.findFirst.mockResolvedValue(BASE_TASK);
      prisma.schoolSubjectTaskAttachment.findFirst.mockResolvedValue({
        id: "att-1",
        url: "school-subject-tasks/a.pdf",
      });

      await service.removeAttachment(CYCLE_ID, GROUP_ID, SUBJECT_ID, TASK_ID, "att-1");

      expect(storage.delete).toHaveBeenCalledWith("school-subject-tasks/a.pdf");
      expect(prisma.schoolSubjectTaskAttachment.delete).toHaveBeenCalledWith({
        where: { id: "att-1" },
      });
    });
  });
});
