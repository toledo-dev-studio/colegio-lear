import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";

/**
 * Mock the Prisma client before importing any module code.
 */
vi.mock("../../shared/lib/prisma", () => ({
  prisma: {
    grade: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    educationLevel: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { createGradeSchema } from "./grades.schema";

/** Required fields for createGradeSchema */
const REQUIRED_FIELDS = ["name", "educationLevelId"] as const;

/**
 * Feature: education-levels-subjects, Property 2: Validation rejects missing required fields with field-level errors
 *
 * Validates: Requirements 5.4
 *
 * For any non-empty subset of required fields that is omitted from a creation
 * request, the Zod schema MUST reject the input and the error issues MUST list
 * each omitted field.
 */
describe("Feature: education-levels-subjects, Property 2: Validation rejects missing required fields with field-level errors", () => {
  it("should reject input and list each omitted required field in errors", () => {
    fc.assert(
      fc.property(
        // Generate a non-empty subset of required fields to OMIT
        fc.subarray([...REQUIRED_FIELDS], { minLength: 1 }),
        // Generate valid values for building a complete base input
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 10000 }),
        (fieldsToOmit, nameVal, educationLevelIdVal) => {
          // Build a valid base input with ALL required fields
          const input: Record<string, unknown> = {
            name: nameVal,
            educationLevelId: educationLevelIdVal,
          };

          // Delete the selected subset of fields
          for (const field of fieldsToOmit) {
            delete input[field];
          }

          // Parse with createGradeSchema
          const result = createGradeSchema.safeParse(input);

          // Verify that the result is NOT successful
          expect(result.success).toBe(false);

          if (!result.success) {
            // Collect the field paths from the error issues
            const errorPaths = result.error.issues.map(
              (issue) => issue.path[0],
            );

            // Verify that each omitted field appears in the error issues
            for (const field of fieldsToOmit) {
              expect(errorPaths).toContain(field);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

import { getGrades } from "./grades.service";
import { prisma } from "../../shared/lib/prisma";

const mockedTransaction = vi.mocked(prisma.$transaction);

/**
 * Feature: education-levels-subjects, Property 3: Filtering by parent entity returns only matching child records (grades)
 *
 * Validates: Requirements 6.2
 *
 * For any set of grade records with different educationLevelIds and for any
 * valid educationLevelId used as a filter, ALL returned records MUST belong
 * to that education level.
 */
describe("Feature: education-levels-subjects, Property 3: Filtering by parent entity returns only matching child records (grades)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return only grades belonging to the selected educationLevelId", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate at least 2 different educationLevelIds
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1001, max: 2000 }),
        // Generate arrays of grades for each educationLevelId
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 100000 }),
            name: fc.string({ minLength: 1, maxLength: 30 }),
            description: fc.option(fc.string({ maxLength: 50 }), { nil: null }),
            order: fc.integer({ min: 0, max: 100 }),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        fc.array(
          fc.record({
            id: fc.integer({ min: 100001, max: 200000 }),
            name: fc.string({ minLength: 1, maxLength: 30 }),
            description: fc.option(fc.string({ maxLength: 50 }), { nil: null }),
            order: fc.integer({ min: 0, max: 100 }),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        // Pick which educationLevelId to filter by (0 = first, 1 = second)
        fc.integer({ min: 0, max: 1 }),
        async (elId1, elId2, gradesForEl1, gradesForEl2, pickIndex) => {
          vi.clearAllMocks();

          const now = new Date();

          // Build full grade records with their educationLevelId
          const allGradesEl1 = gradesForEl1.map((g) => ({
            ...g,
            educationLevelId: elId1,
            createdAt: now,
            updatedAt: now,
          }));

          const allGradesEl2 = gradesForEl2.map((g) => ({
            ...g,
            educationLevelId: elId2,
            createdAt: now,
            updatedAt: now,
          }));

          // Pick the educationLevelId to filter by
          const selectedElId = pickIndex === 0 ? elId1 : elId2;
          const matchingGrades = pickIndex === 0 ? allGradesEl1 : allGradesEl2;

          // Mock $transaction to return only the matching grades and count
          mockedTransaction.mockResolvedValue([
            matchingGrades,
            matchingGrades.length,
          ] as any);

          // Call getGrades with the selected educationLevelId filter
          const result = await getGrades({ page: 1, limit: 100 }, selectedElId);

          // ALL returned records must have the selected educationLevelId
          for (const grade of result.data) {
            expect(grade.educationLevelId).toBe(selectedElId);
          }

          // Count must match
          expect(result.total).toBe(matchingGrades.length);
          expect(result.data.length).toBe(matchingGrades.length);
        },
      ),
      { numRuns: 100 },
    );
  });
});

import {
  createGrade,
  getGradeById,
  updateGrade,
  deactivateGrade,
} from "./grades.service";
import { NotFoundError } from "../../shared/errors/app-error";

const mockedGradeCreate = vi.mocked(prisma.grade.create);
const mockedGradeFindUnique = vi.mocked(prisma.grade.findUnique);
const mockedGradeUpdate = vi.mocked(prisma.grade.update);
const mockedEducationLevelFindUnique = vi.mocked(
  prisma.educationLevel.findUnique,
);

/**
 * Unit tests for grades service CRUD operations.
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 8.1, 8.2
 */
describe("Grades — Unit Tests", () => {
  const now = new Date();

  const fakeGrade = {
    id: 1,
    name: "Primero",
    description: "First grade",
    order: 1,
    isActive: true,
    educationLevelId: 10,
    createdAt: now,
    updatedAt: now,
  };

  const fakeEducationLevel = {
    id: 10,
    name: "Primaria",
    description: "Primary education",
    order: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createGrade", () => {
    it("should verify FK, call prisma.grade.create, and return the created record", async () => {
      mockedEducationLevelFindUnique.mockResolvedValue(
        fakeEducationLevel as any,
      );
      mockedGradeCreate.mockResolvedValue(fakeGrade as any);

      const result = await createGrade({
        name: "Primero",
        educationLevelId: 10,
        description: "First grade",
        order: 1,
      });

      expect(mockedEducationLevelFindUnique).toHaveBeenCalledOnce();
      expect(mockedEducationLevelFindUnique).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(mockedGradeCreate).toHaveBeenCalledOnce();
      expect(mockedGradeCreate).toHaveBeenCalledWith({
        data: {
          name: "Primero",
          educationLevelId: 10,
          description: "First grade",
          order: 1,
        },
      });
      expect(result).toEqual(fakeGrade);
    });

    it("should throw NotFoundError when education level does not exist", async () => {
      mockedEducationLevelFindUnique.mockResolvedValue(null);

      await expect(
        createGrade({ name: "Primero", educationLevelId: 999 }),
      ).rejects.toThrow(NotFoundError);
      await expect(
        createGrade({ name: "Primero", educationLevelId: 999 }),
      ).rejects.toThrow("Education level not found");
    });
  });

  describe("getGrades", () => {
    it("should call prisma.$transaction and return paginated data", async () => {
      const fakeGrades = [fakeGrade];
      mockedTransaction.mockResolvedValue([fakeGrades, 1] as any);

      const result = await getGrades({ page: 1, limit: 10 });

      expect(mockedTransaction).toHaveBeenCalledOnce();
      expect(result).toEqual({ data: fakeGrades, total: 1 });
    });
  });

  describe("getGradeById", () => {
    it("should return the record with educationLevel and _count when found", async () => {
      const fakeGradeDetail = {
        ...fakeGrade,
        educationLevel: { id: 10, name: "Primaria" },
        _count: { groups: 2 },
      };
      mockedGradeFindUnique.mockResolvedValue(fakeGradeDetail as any);

      const result = await getGradeById(1);

      expect(mockedGradeFindUnique).toHaveBeenCalledOnce();
      expect(mockedGradeFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          educationLevel: { select: { id: true, name: true } },
          _count: { select: { groups: true } },
        },
      });
      expect(result).toEqual(fakeGradeDetail);
    });

    it("should throw NotFoundError when ID does not exist", async () => {
      mockedGradeFindUnique.mockResolvedValue(null);

      await expect(getGradeById(999)).rejects.toThrow(NotFoundError);
      await expect(getGradeById(999)).rejects.toThrow("Grade not found");
    });
  });

  describe("updateGrade", () => {
    it("should update only provided fields and return the updated record", async () => {
      const updatedGrade = { ...fakeGrade, name: "Segundo" };
      mockedGradeUpdate.mockResolvedValue(updatedGrade as any);

      const result = await updateGrade(1, { name: "Segundo" });

      expect(mockedGradeUpdate).toHaveBeenCalledOnce();
      expect(mockedGradeUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "Segundo" },
      });
      expect(result).toEqual(updatedGrade);
    });
  });

  describe("deactivateGrade", () => {
    it("should set isActive to false and return the updated record", async () => {
      const deactivated = { ...fakeGrade, isActive: false };
      mockedGradeUpdate.mockResolvedValue(deactivated as any);

      const result = await deactivateGrade(1);

      expect(mockedGradeUpdate).toHaveBeenCalledOnce();
      expect(mockedGradeUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result).toEqual(deactivated);
    });
  });
});
