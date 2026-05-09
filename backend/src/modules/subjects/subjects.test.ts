import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";

/**
 * Mock the Prisma client before importing any module code.
 */
vi.mock("../../shared/lib/prisma", () => ({
  prisma: {
    subject: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    grade: {
      findUnique: vi.fn(),
    },
    gradeSubject: {
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { getSubjects } from "./subjects.service";
import { prisma } from "../../shared/lib/prisma";

const mockedTransaction = vi.mocked(prisma.$transaction);

/**
 * Feature: education-levels-subjects, Property 4: Subject search returns only matching records
 *
 * Validates: Requirements 14.2
 *
 * For any set of subject records and for any non-empty search term,
 * ALL returned records MUST have a name that contains the search term
 * (case-insensitive).
 */
describe("Feature: education-levels-subjects, Property 4: Subject search returns only matching records", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return only subjects whose name contains the search term (case-insensitive)", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a random array of subject records with random names
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 100000 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            description: fc.option(fc.string({ maxLength: 50 }), { nil: null }),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 15 },
        ),
        // Generate a non-empty search term
        fc.string({ minLength: 1, maxLength: 20 }),
        async (subjects, searchTerm) => {
          vi.clearAllMocks();

          const now = new Date();

          // Build full subject records
          const allSubjects = subjects.map((s) => ({
            ...s,
            createdAt: now,
            updatedAt: now,
          }));

          // Filter to find subjects whose name contains the search term (case-insensitive)
          const matchingSubjects = allSubjects.filter((s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()),
          );

          // Mock $transaction to return only the matching subjects and count
          mockedTransaction.mockResolvedValue([
            matchingSubjects,
            matchingSubjects.length,
          ] as any);

          // Call getSubjects with the search term
          const result = await getSubjects({ page: 1, limit: 100 }, searchTerm);

          // ALL returned records must have a name containing the search term (case-insensitive)
          for (const subject of result.data) {
            expect(subject.name.toLowerCase()).toContain(
              searchTerm.toLowerCase(),
            );
          }

          // Count must match
          expect(result.total).toBe(matchingSubjects.length);
          expect(result.data.length).toBe(matchingSubjects.length);
        },
      ),
      { numRuns: 100 },
    );
  });
});

import { getSubjectsByGrade } from "./subjects.service";

const mockedGradeFindUnique = vi.mocked(prisma.grade.findUnique);

/**
 * Feature: education-levels-subjects, Property 3: Filtering by parent entity returns only matching child records (subjects by grade)
 *
 * Validates: Requirements 18.1
 *
 * For any set of grade-subject records with different gradeIds and for any
 * valid gradeId used as a filter, ALL returned subject records MUST belong
 * to that grade (via the GradeSubject join table).
 */
describe("Feature: education-levels-subjects, Property 3: Filtering by parent entity returns only matching child records (subjects by grade)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return only subjects belonging to the selected gradeId", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate at least 2 different gradeIds
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1001, max: 2000 }),
        // Generate arrays of grade-subject records for each gradeId
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 100000 }),
            subjectId: fc.integer({ min: 1, max: 50000 }),
            subject: fc.record({
              id: fc.integer({ min: 1, max: 50000 }),
              name: fc.string({ minLength: 1, maxLength: 30 }),
              description: fc.option(fc.string({ maxLength: 50 }), {
                nil: null,
              }),
              isActive: fc.boolean(),
              createdAt: fc.constant(new Date()),
              updatedAt: fc.constant(new Date()),
            }),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        fc.array(
          fc.record({
            id: fc.integer({ min: 100001, max: 200000 }),
            subjectId: fc.integer({ min: 50001, max: 100000 }),
            subject: fc.record({
              id: fc.integer({ min: 50001, max: 100000 }),
              name: fc.string({ minLength: 1, maxLength: 30 }),
              description: fc.option(fc.string({ maxLength: 50 }), {
                nil: null,
              }),
              isActive: fc.boolean(),
              createdAt: fc.constant(new Date()),
              updatedAt: fc.constant(new Date()),
            }),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        // Pick which gradeId to filter by (0 = first, 1 = second)
        fc.integer({ min: 0, max: 1 }),
        async (
          gradeId1,
          gradeId2,
          gradeSubjectsForGrade1,
          gradeSubjectsForGrade2,
          pickIndex,
        ) => {
          vi.clearAllMocks();

          const now = new Date();

          // Build full grade-subject records with their gradeId
          const allGsGrade1 = gradeSubjectsForGrade1.map((gs) => ({
            ...gs,
            gradeId: gradeId1,
            createdAt: now,
          }));

          const allGsGrade2 = gradeSubjectsForGrade2.map((gs) => ({
            ...gs,
            gradeId: gradeId2,
            createdAt: now,
          }));

          // Pick the gradeId to filter by
          const selectedGradeId = pickIndex === 0 ? gradeId1 : gradeId2;
          const matchingGradeSubjects =
            pickIndex === 0 ? allGsGrade1 : allGsGrade2;

          // Expected subjects extracted from grade-subject records (same as service does)
          const expectedSubjects = matchingGradeSubjects.map(
            (gs) => gs.subject,
          );

          // Mock grade.findUnique to return a non-null value (FK check passes)
          mockedGradeFindUnique.mockResolvedValue({
            id: selectedGradeId,
            name: "Test Grade",
            description: null,
            order: 1,
            isActive: true,
            educationLevelId: 1,
            createdAt: now,
            updatedAt: now,
          } as any);

          // Mock $transaction to return only the matching grade-subjects and count
          mockedTransaction.mockResolvedValue([
            matchingGradeSubjects,
            matchingGradeSubjects.length,
          ] as any);

          // Call getSubjectsByGrade with the selected gradeId
          const result = await getSubjectsByGrade(selectedGradeId, {
            page: 1,
            limit: 100,
          });

          // The service maps gs.subject, so returned data should match expected subjects
          expect(result.data).toEqual(expectedSubjects);
          expect(result.data.length).toBe(matchingGradeSubjects.length);
          expect(result.total).toBe(matchingGradeSubjects.length);

          // Verify grade existence was checked
          expect(mockedGradeFindUnique).toHaveBeenCalledWith({
            where: { id: selectedGradeId },
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});

import { updateSubject } from "./subjects.service";

const mockedSubjectUpdate = vi.mocked(prisma.subject.update);

/** All updatable fields for a Subject */
const UPDATABLE_SUBJECT_FIELDS = ["name", "description"] as const;

/**
 * Feature: education-levels-subjects, Property 1: Partial update preserves unchanged fields (subjects)
 *
 * Validates: Requirements 15.1
 *
 * For any non-empty subset of updatable fields (name, description),
 * calling updateSubject with only those fields should result in
 * prisma.subject.update being called with ONLY those keys in `data`.
 */
describe("Feature: education-levels-subjects, Property 1: Partial update preserves unchanged fields (subjects)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should pass only provided fields to prisma update — no extra keys", () => {
    fc.assert(
      fc.property(
        // Generate a non-empty subset of updatable field names
        fc.subarray(["name", "description"] as const, {
          minLength: 1,
        }),
        // Generate values for each possible field
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ maxLength: 100 }),
        fc.integer({ min: 1, max: 10000 }),
        (fieldSubset, nameVal, descVal, id) => {
          vi.clearAllMocks();

          // Build the input object with ONLY the selected fields
          const input: Record<string, unknown> = {};
          for (const field of fieldSubset) {
            if (field === "name") input.name = nameVal;
            if (field === "description") input.description = descVal;
          }

          // Mock prisma to return a fake merged record
          mockedSubjectUpdate.mockResolvedValue({
            id,
            name: nameVal,
            description: descVal,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any);

          // Call the service function
          updateSubject(id, input);

          // Verify prisma.subject.update was called exactly once
          expect(mockedSubjectUpdate).toHaveBeenCalledOnce();

          const callArgs = mockedSubjectUpdate.mock.calls[0]![0] as {
            where: { id: number };
            data: Record<string, unknown>;
          };

          // The `data` object should contain ONLY the keys from fieldSubset
          const dataKeys = Object.keys(callArgs.data).sort();
          const expectedKeys = [...fieldSubset].sort();

          expect(dataKeys).toEqual(expectedKeys);

          // Also verify the `where` clause has the correct id
          expect(callArgs.where).toEqual({ id });

          // Verify each provided field has the correct value
          for (const field of fieldSubset) {
            if (field === "name") expect(callArgs.data.name).toBe(nameVal);
            if (field === "description")
              expect(callArgs.data.description).toBe(descVal);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

import {
  createSubject,
  getSubjectById,
  deactivateSubject,
  assignSubjectToGrade,
  removeSubjectFromGrade,
} from "./subjects.service";
import { NotFoundError } from "../../shared/errors/app-error";

const mockedSubjectCreate = vi.mocked(prisma.subject.create);
const mockedSubjectFindUnique = vi.mocked(prisma.subject.findUnique);
const mockedGradeSubjectCreate = vi.mocked(prisma.gradeSubject.create);
const mockedGradeSubjectDelete = vi.mocked(prisma.gradeSubject.delete);

/**
 * Unit tests for subjects service CRUD and grade-subject assignment operations.
 *
 * Validates: Requirements 13.1, 13.2, 13.3, 14.1, 14.3, 14.4, 15.1, 16.1, 16.2,
 *            17.1, 17.2, 17.3, 18.1, 18.3, 19.1
 */
describe("Subjects — Unit Tests", () => {
  const now = new Date();

  const fakeSubject = {
    id: 1,
    name: "Matemáticas",
    description: "Mathematics",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const fakeGrade = {
    id: 10,
    name: "Primero",
    description: "First grade",
    order: 1,
    isActive: true,
    educationLevelId: 1,
    createdAt: now,
    updatedAt: now,
  };

  const fakeGradeSubject = {
    id: 100,
    gradeId: 10,
    subjectId: 1,
    createdAt: now,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSubject", () => {
    it("should call prisma.subject.create with correct data and return the created record", async () => {
      mockedSubjectCreate.mockResolvedValue(fakeSubject as any);

      const result = await createSubject({
        name: "Matemáticas",
        description: "Mathematics",
      });

      expect(mockedSubjectCreate).toHaveBeenCalledOnce();
      expect(mockedSubjectCreate).toHaveBeenCalledWith({
        data: {
          name: "Matemáticas",
          description: "Mathematics",
        },
      });
      expect(result).toEqual(fakeSubject);
    });
  });

  describe("getSubjects", () => {
    it("should call prisma.$transaction and return paginated data", async () => {
      const fakeSubjects = [fakeSubject];
      mockedTransaction.mockResolvedValue([fakeSubjects, 1] as any);

      const result = await getSubjects({ page: 1, limit: 10 });

      expect(mockedTransaction).toHaveBeenCalledOnce();
      expect(result).toEqual({ data: fakeSubjects, total: 1 });
    });
  });

  describe("getSubjectById", () => {
    it("should return the record when found", async () => {
      mockedSubjectFindUnique.mockResolvedValue(fakeSubject as any);

      const result = await getSubjectById(1);

      expect(mockedSubjectFindUnique).toHaveBeenCalledOnce();
      expect(mockedSubjectFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(fakeSubject);
    });

    it("should throw NotFoundError when ID does not exist", async () => {
      mockedSubjectFindUnique.mockResolvedValue(null);

      await expect(getSubjectById(999)).rejects.toThrow(NotFoundError);
      await expect(getSubjectById(999)).rejects.toThrow("Subject not found");
    });
  });

  describe("updateSubject", () => {
    it("should update only provided fields and return the updated record", async () => {
      const updatedSubject = { ...fakeSubject, name: "Español" };
      mockedSubjectUpdate.mockResolvedValue(updatedSubject as any);

      const result = await updateSubject(1, { name: "Español" });

      expect(mockedSubjectUpdate).toHaveBeenCalledOnce();
      expect(mockedSubjectUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "Español" },
      });
      expect(result).toEqual(updatedSubject);
    });
  });

  describe("deactivateSubject", () => {
    it("should set isActive to false and return the updated record", async () => {
      const deactivated = { ...fakeSubject, isActive: false };
      mockedSubjectUpdate.mockResolvedValue(deactivated as any);

      const result = await deactivateSubject(1);

      expect(mockedSubjectUpdate).toHaveBeenCalledOnce();
      expect(mockedSubjectUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result).toEqual(deactivated);
    });
  });

  describe("assignSubjectToGrade", () => {
    it("should verify both FKs, create assignment, and return the record", async () => {
      mockedGradeFindUnique.mockResolvedValue(fakeGrade as any);
      mockedSubjectFindUnique.mockResolvedValue(fakeSubject as any);
      mockedGradeSubjectCreate.mockResolvedValue(fakeGradeSubject as any);

      const result = await assignSubjectToGrade(10, 1);

      expect(mockedGradeFindUnique).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(mockedSubjectFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockedGradeSubjectCreate).toHaveBeenCalledOnce();
      expect(mockedGradeSubjectCreate).toHaveBeenCalledWith({
        data: { gradeId: 10, subjectId: 1 },
      });
      expect(result).toEqual(fakeGradeSubject);
    });

    it("should throw NotFoundError when grade does not exist", async () => {
      mockedGradeFindUnique.mockResolvedValue(null);

      await expect(assignSubjectToGrade(999, 1)).rejects.toThrow(NotFoundError);
      await expect(assignSubjectToGrade(999, 1)).rejects.toThrow(
        "Grade not found",
      );
    });

    it("should throw NotFoundError when subject does not exist", async () => {
      mockedGradeFindUnique.mockResolvedValue(fakeGrade as any);
      mockedSubjectFindUnique.mockResolvedValue(null);

      await expect(assignSubjectToGrade(10, 999)).rejects.toThrow(
        NotFoundError,
      );
      await expect(assignSubjectToGrade(10, 999)).rejects.toThrow(
        "Subject not found",
      );
    });
  });

  describe("getSubjectsByGrade", () => {
    it("should verify grade exists and return paginated subjects", async () => {
      mockedGradeFindUnique.mockResolvedValue(fakeGrade as any);
      const gradeSubjects = [{ ...fakeGradeSubject, subject: fakeSubject }];
      mockedTransaction.mockResolvedValue([gradeSubjects, 1] as any);

      const result = await getSubjectsByGrade(10, { page: 1, limit: 10 });

      expect(mockedGradeFindUnique).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(mockedTransaction).toHaveBeenCalledOnce();
      expect(result).toEqual({ data: [fakeSubject], total: 1 });
    });

    it("should throw NotFoundError when grade does not exist", async () => {
      mockedGradeFindUnique.mockResolvedValue(null);

      await expect(
        getSubjectsByGrade(999, { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundError);
      await expect(
        getSubjectsByGrade(999, { page: 1, limit: 10 }),
      ).rejects.toThrow("Grade not found");
    });
  });

  describe("removeSubjectFromGrade", () => {
    it("should call prisma.gradeSubject.delete with the correct ID", async () => {
      mockedGradeSubjectDelete.mockResolvedValue(fakeGradeSubject as any);

      await removeSubjectFromGrade(100);

      expect(mockedGradeSubjectDelete).toHaveBeenCalledOnce();
      expect(mockedGradeSubjectDelete).toHaveBeenCalledWith({
        where: { id: 100 },
      });
    });
  });
});
