import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Unit tests for the teacher-facing tasks controller. resolveTeacherSubjectScope
 * and SchoolSubjectTaskService are mocked so this only exercises: correct
 * delegation with the translated (academicCycleId, academicCycleSchoolSubjectId)
 * scope, and the upsert branch (absent id -> create, real id -> update).
 */

vi.mock("./teacher-class-scope.helper", () => ({
  resolveTeacherSubjectScope: vi.fn(),
}));

const {
  findAllMock,
  createMock,
  updateMock,
  removeMock,
  addAttachmentRecordMock,
  removeAttachmentMock,
} = vi.hoisted(() => ({
  findAllMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
  removeMock: vi.fn(),
  addAttachmentRecordMock: vi.fn(),
  removeAttachmentMock: vi.fn(),
}));
vi.mock("./school-subject-task.service", () => ({
  SchoolSubjectTaskService: vi.fn().mockImplementation(function () {
    return {
      findAll: findAllMock,
      create: createMock,
      update: updateMock,
      remove: removeMock,
      addAttachmentRecord: addAttachmentRecordMock,
      removeAttachment: removeAttachmentMock,
    };
  }),
}));

import { resolveTeacherSubjectScope } from "./teacher-class-scope.helper";
import { findAll, createOrUpdate, remove, addAttachment } from "./school-subject-task-teacher.controller";

const EMPLOYEE_ID = "11111111-1111-4111-8111-111111111111";
const GROUP_ID = "22222222-2222-4222-8222-222222222222";
const SUBJECT_ID = "33333333-3333-4333-8333-333333333333";
const CYCLE_ID = "44444444-4444-4444-8444-444444444444";
const CYCLE_SUBJECT_ID = "55555555-5555-4555-8555-555555555555";
const TASK_ID = "66666666-6666-4666-8666-666666666666";

const SCOPE = { academicCycleId: CYCLE_ID, academicCycleSchoolSubjectId: CYCLE_SUBJECT_ID };

function buildReqRes(body: unknown = {}, options: { file?: unknown } = {}) {
  const req = {
    user: { employeeId: EMPLOYEE_ID },
    params: { schoolGroupId: GROUP_ID, schoolSubjectId: SUBJECT_ID },
    body,
    file: options.file,
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as any;
  return { req, res };
}

describe("school-subject-task-teacher.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (resolveTeacherSubjectScope as any).mockResolvedValue(SCOPE);
  });

  it("findAll delegates using the resolved scope", async () => {
    findAllMock.mockResolvedValue([{ id: TASK_ID }]);
    const { req, res } = buildReqRes();

    await findAll(req, res);

    expect(resolveTeacherSubjectScope).toHaveBeenCalledWith(
      expect.anything(),
      EMPLOYEE_ID,
      GROUP_ID,
      SUBJECT_ID,
    );
    expect(findAllMock).toHaveBeenCalledWith(CYCLE_ID, GROUP_ID, CYCLE_SUBJECT_ID);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("createOrUpdate creates when id is absent", async () => {
    createMock.mockResolvedValue({ id: TASK_ID });
    const { req, res } = buildReqRes({ title: "Tarea", dueDate: "2026-12-01" });

    await createOrUpdate(req, res);

    expect(createMock).toHaveBeenCalledWith(CYCLE_ID, GROUP_ID, CYCLE_SUBJECT_ID, {
      title: "Tarea",
      dueDate: "2026-12-01",
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("createOrUpdate updates when a real id is present", async () => {
    updateMock.mockResolvedValue({ id: TASK_ID });
    const { req, res } = buildReqRes({ id: TASK_ID, title: "Tarea editada", dueDate: "2026-12-01" });

    await createOrUpdate(req, res);

    expect(updateMock).toHaveBeenCalledWith(CYCLE_ID, GROUP_ID, CYCLE_SUBJECT_ID, TASK_ID, {
      title: "Tarea editada",
      dueDate: "2026-12-01",
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("remove delegates using the resolved scope", async () => {
    const { req, res } = buildReqRes();
    req.params.taskId = TASK_ID;

    await remove(req, res);

    expect(removeMock).toHaveBeenCalledWith(CYCLE_ID, GROUP_ID, CYCLE_SUBJECT_ID, TASK_ID);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  describe("addAttachment", () => {
    it("returns only the new attachment, not the full task", async () => {
      const attachment = {
        id: "attachment-uuid",
        url: "http://localhost:3000/uploads/school-subject-tasks/file.pdf",
        name: "file",
        extension: "pdf",
        relatedRecordId: TASK_ID,
      };
      addAttachmentRecordMock.mockResolvedValue(attachment);
      const { req, res } = buildReqRes(
        {},
        { file: { originalname: "file.pdf", mimetype: "application/pdf", buffer: Buffer.from("x") } },
      );
      req.params.taskId = TASK_ID;

      await addAttachment(req, res);

      expect(addAttachmentRecordMock).toHaveBeenCalledWith(
        CYCLE_ID,
        GROUP_ID,
        CYCLE_SUBJECT_ID,
        TASK_ID,
        { buffer: expect.any(Buffer), originalname: "file.pdf", mimetype: "application/pdf" },
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(attachment);
    });
  });
});
