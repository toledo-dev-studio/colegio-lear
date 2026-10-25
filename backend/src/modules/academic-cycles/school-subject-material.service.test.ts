import { describe, it, expect, beforeEach, vi } from "vitest";
import { SchoolSubjectMaterialService } from "./school-subject-material.service";
import { NotFoundError } from "../../shared/errors/app-error";

/**
 * Unit tests for SchoolSubjectMaterialService — covers the FK-scope
 * validation and the create/delete lifecycle (including the embedded
 * 1:1 attachment).
 */

function createMockPrisma() {
  return {
    academicCycleGroup: { findFirst: vi.fn() },
    academicCycleSchoolSubject: { findFirst: vi.fn() },
    schoolSubjectMaterial: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
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
const PLAIN_SUBJECT_ID = "plain-subject-uuid";
const MATERIAL_ID = "material-uuid";

const BASE_MATERIAL = {
  id: MATERIAL_ID,
  academicCycleId: CYCLE_ID,
  academicCycleSchoolGroupId: GROUP_ID,
  academicCycleSchoolSubjectId: SUBJECT_ID,
  attachmentUrl: "school-subject-materials/a.pdf",
  attachmentName: "material",
  attachmentExtension: "pdf",
  createdAt: new Date("2026-09-10T10:00:00.000Z"),
};

describe("SchoolSubjectMaterialService", () => {
  let prisma: MockPrisma;
  let storage: MockStorage;
  let service: SchoolSubjectMaterialService;

  beforeEach(() => {
    prisma = createMockPrisma();
    storage = createMockStorage();
    service = new SchoolSubjectMaterialService(prisma as any, storage as any);
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

  describe("findAll", () => {
    it("returns materials with attachment.id/relatedRecordId equal to the material's own id", async () => {
      prisma.schoolSubjectMaterial.findMany.mockResolvedValue([BASE_MATERIAL]);

      const result = await service.findAll(CYCLE_ID, GROUP_ID, SUBJECT_ID);

      expect(result[0]!.attachment).toMatchObject({
        id: MATERIAL_ID,
        relatedRecordId: MATERIAL_ID,
        name: "material",
        extension: "pdf",
      });
    });
  });

  describe("create", () => {
    it("uploads the file and creates the material with the embedded attachment fields", async () => {
      storage.upload.mockResolvedValue("school-subject-materials/new.pdf");
      prisma.schoolSubjectMaterial.create.mockResolvedValue(BASE_MATERIAL);

      await service.create(CYCLE_ID, GROUP_ID, SUBJECT_ID, {
        buffer: Buffer.from("x"),
        originalname: "material.pdf",
        mimetype: "application/pdf",
      });

      expect(storage.upload).toHaveBeenCalledWith({
        buffer: expect.any(Buffer),
        fileName: "material.pdf",
        mimeType: "application/pdf",
        subfolder: "school-subject-materials",
      });
      expect(prisma.schoolSubjectMaterial.create).toHaveBeenCalledWith({
        data: {
          academicCycleId: CYCLE_ID,
          academicCycleSchoolGroupId: GROUP_ID,
          academicCycleSchoolSubjectId: SUBJECT_ID,
          attachmentUrl: "school-subject-materials/new.pdf",
          attachmentName: "material",
          attachmentExtension: "pdf",
        },
      });
    });

    it("throws NotFoundError when the scope is invalid", async () => {
      prisma.academicCycleSchoolSubject.findFirst.mockResolvedValue(null);

      await expect(
        service.create(CYCLE_ID, GROUP_ID, SUBJECT_ID, {
          buffer: Buffer.from("x"),
          originalname: "material.pdf",
          mimetype: "application/pdf",
        }),
      ).rejects.toThrow(NotFoundError);
      expect(storage.upload).not.toHaveBeenCalled();
    });
  });

  describe("findAllFlat", () => {
    it("returns a flat record keyed by the plain schoolSubjectId, not nested under attachment", async () => {
      prisma.schoolSubjectMaterial.findMany.mockResolvedValue([BASE_MATERIAL]);

      const result = await service.findAllFlat(CYCLE_ID, GROUP_ID, SUBJECT_ID, PLAIN_SUBJECT_ID);

      expect(result[0]).toEqual({
        id: MATERIAL_ID,
        url: expect.stringContaining("school-subject-materials/a.pdf"),
        name: "material",
        extension: "pdf",
        relatedRecordId: MATERIAL_ID,
        academicCycleSchoolGroupId: GROUP_ID,
        schoolSubjectId: PLAIN_SUBJECT_ID,
      });
      expect(result[0]).not.toHaveProperty("attachment");
      expect(result[0]).not.toHaveProperty("academicCycleId");
      expect(result[0]).not.toHaveProperty("academicCycleSchoolSubjectId");
    });
  });

  describe("createFlat", () => {
    it("uploads the file and returns a flat record keyed by the plain schoolSubjectId", async () => {
      storage.upload.mockResolvedValue("school-subject-materials/new.pdf");
      prisma.schoolSubjectMaterial.create.mockResolvedValue(BASE_MATERIAL);

      const result = await service.createFlat(CYCLE_ID, GROUP_ID, SUBJECT_ID, PLAIN_SUBJECT_ID, {
        buffer: Buffer.from("x"),
        originalname: "material.pdf",
        mimetype: "application/pdf",
      });

      expect(result).toEqual({
        id: MATERIAL_ID,
        url: expect.stringContaining("school-subject-materials/a.pdf"),
        name: "material",
        extension: "pdf",
        relatedRecordId: MATERIAL_ID,
        academicCycleSchoolGroupId: GROUP_ID,
        schoolSubjectId: PLAIN_SUBJECT_ID,
      });
    });

    it("throws NotFoundError when the scope is invalid", async () => {
      prisma.academicCycleSchoolSubject.findFirst.mockResolvedValue(null);

      await expect(
        service.createFlat(CYCLE_ID, GROUP_ID, SUBJECT_ID, PLAIN_SUBJECT_ID, {
          buffer: Buffer.from("x"),
          originalname: "material.pdf",
          mimetype: "application/pdf",
        }),
      ).rejects.toThrow(NotFoundError);
      expect(storage.upload).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("deletes the file in storage and the DB row", async () => {
      prisma.schoolSubjectMaterial.findFirst.mockResolvedValue(BASE_MATERIAL);

      await service.remove(CYCLE_ID, GROUP_ID, SUBJECT_ID, MATERIAL_ID);

      expect(storage.delete).toHaveBeenCalledWith("school-subject-materials/a.pdf");
      expect(prisma.schoolSubjectMaterial.delete).toHaveBeenCalledWith({
        where: { id: MATERIAL_ID },
      });
    });

    it("throws NotFoundError when the material isn't in this scope", async () => {
      prisma.schoolSubjectMaterial.findFirst.mockResolvedValue(null);

      await expect(
        service.remove(CYCLE_ID, GROUP_ID, SUBJECT_ID, MATERIAL_ID),
      ).rejects.toThrow(NotFoundError);
      expect(storage.delete).not.toHaveBeenCalled();
    });
  });
});
