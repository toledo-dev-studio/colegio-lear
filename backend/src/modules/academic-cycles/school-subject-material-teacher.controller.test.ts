import { describe, it, expect, beforeEach, vi } from "vitest";
import { ValidationError } from "../../shared/errors/app-error";

/**
 * Unit tests for the teacher-facing materials controller.
 * resolveTeacherSubjectScope and SchoolSubjectMaterialService are mocked so
 * this only exercises delegation with the translated scope and the
 * "file is required" guard.
 */

vi.mock("./teacher-class-scope.helper", () => ({
  resolveTeacherSubjectScope: vi.fn(),
}));

const { findAllFlatMock, createFlatMock, removeMock } = vi.hoisted(() => ({
  findAllFlatMock: vi.fn(),
  createFlatMock: vi.fn(),
  removeMock: vi.fn(),
}));
vi.mock("./school-subject-material.service", () => ({
  SchoolSubjectMaterialService: vi.fn().mockImplementation(function () {
    return { findAllFlat: findAllFlatMock, createFlat: createFlatMock, remove: removeMock };
  }),
}));

import { resolveTeacherSubjectScope } from "./teacher-class-scope.helper";
import { findAll, create, remove } from "./school-subject-material-teacher.controller";

const EMPLOYEE_ID = "11111111-1111-4111-8111-111111111111";
const GROUP_ID = "22222222-2222-4222-8222-222222222222";
const SUBJECT_ID = "33333333-3333-4333-8333-333333333333";
const CYCLE_ID = "44444444-4444-4444-8444-444444444444";
const CYCLE_SUBJECT_ID = "55555555-5555-4555-8555-555555555555";
const MATERIAL_ID = "66666666-6666-4666-8666-666666666666";

const SCOPE = { academicCycleId: CYCLE_ID, academicCycleSchoolSubjectId: CYCLE_SUBJECT_ID };

function buildReqRes(options: { file?: unknown } = {}) {
  const req = {
    user: { employeeId: EMPLOYEE_ID },
    params: { schoolGroupId: GROUP_ID, schoolSubjectId: SUBJECT_ID },
    file: options.file,
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as any;
  return { req, res };
}

describe("school-subject-material-teacher.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (resolveTeacherSubjectScope as any).mockResolvedValue(SCOPE);
  });

  it("findAll delegates using the resolved scope and the plain schoolSubjectId", async () => {
    findAllFlatMock.mockResolvedValue([{ id: MATERIAL_ID }]);
    const { req, res } = buildReqRes();

    await findAll(req, res);

    expect(findAllFlatMock).toHaveBeenCalledWith(CYCLE_ID, GROUP_ID, CYCLE_SUBJECT_ID, SUBJECT_ID);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("create throws ValidationError when no file is attached", async () => {
    const { req, res } = buildReqRes({ file: undefined });

    await expect(create(req, res)).rejects.toThrow(ValidationError);
    expect(resolveTeacherSubjectScope).not.toHaveBeenCalled();
    expect(createFlatMock).not.toHaveBeenCalled();
  });

  it("create delegates with the uploaded file, resolved scope, and the plain schoolSubjectId", async () => {
    createFlatMock.mockResolvedValue({ id: MATERIAL_ID });
    const { req, res } = buildReqRes({
      file: { originalname: "guia.pdf", mimetype: "application/pdf", buffer: Buffer.from("x") },
    });

    await create(req, res);

    expect(createFlatMock).toHaveBeenCalledWith(
      CYCLE_ID,
      GROUP_ID,
      CYCLE_SUBJECT_ID,
      SUBJECT_ID,
      { buffer: expect.any(Buffer), originalname: "guia.pdf", mimetype: "application/pdf" },
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("remove delegates using the resolved scope", async () => {
    const { req, res } = buildReqRes();
    req.params.materialId = MATERIAL_ID;

    await remove(req, res);

    expect(removeMock).toHaveBeenCalledWith(CYCLE_ID, GROUP_ID, CYCLE_SUBJECT_ID, MATERIAL_ID);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
