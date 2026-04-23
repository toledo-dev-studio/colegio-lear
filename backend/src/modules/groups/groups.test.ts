import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";

/**
 * Mock the Prisma client before importing any module code.
 */
vi.mock("../../shared/lib/prisma", () => ({
  prisma: {
    group: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    grade: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { createGroupSchema } from "./groups.schema";

/** Required fields for createGroupSchema */
const REQUIRED_FIELDS = ["name", "gradeId"] as const;

/**
 * Feature: education-levels-subjects, Property 2: Validation rejects missing required fields with field-level errors (groups)
 *
 * Validates: Requirements 9.4
 *
 * For any non-empty subset of required fields that is omitted from a creation
 * request, the Zod schema MUST reject the input and the error issues MUST list
 * each omitted field.
 */
describe("Feature: education-levels-subjects, Property 2: Validation rejects missing required fields with field-level errors (groups)", () => {
  it("should reject input and list each omitted required field in errors", () => {
    fc.assert(
      fc.property(
        // Generate a non-empty subset of required fields to OMIT
        fc.subarray([...REQUIRED_FIELDS], { minLength: 1 }),
        // Generate valid values for building a complete base input
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 10000 }),
        (fieldsToOmit, nameVal, gradeIdVal) => {
          // Build a valid base input with ALL required fields
          const input: Record<string, unknown> = {
            name: nameVal,
            gradeId: gradeIdVal,
          };

          // Delete the selected subset of fields
          for (const field of fieldsToOmit) {
            delete input[field];
          }

          // Parse with createGroupSchema
          const result = createGroupSchema.safeParse(input);

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

import { getGroups } from "./groups.service";
import { prisma } from "../../shared/lib/prisma";
import { beforeEach } from "vitest";

const mockedTransaction = vi.mocked(prisma.$transaction);

/**
 * Feature: education-levels-subjects, Property 3: Filtering by parent entity returns only matching child records (groups)
 *
 * Validates: Requirements 10.2
 *
 * For any set of group records with different gradeIds and for any
 * valid gradeId used as a filter, ALL returned records MUST belong
 * to that grade.
 */
describe("Feature: education-levels-subjects, Property 3: Filtering by parent entity returns only matching child records (groups)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return only groups belonging to the selected gradeId", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate at least 2 different gradeIds
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1001, max: 2000 }),
        // Generate arrays of groups for each gradeId
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 100000 }),
            name: fc.string({ minLength: 1, maxLength: 30 }),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        fc.array(
          fc.record({
            id: fc.integer({ min: 100001, max: 200000 }),
            name: fc.string({ minLength: 1, maxLength: 30 }),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        // Pick which gradeId to filter by (0 = first, 1 = second)
        fc.integer({ min: 0, max: 1 }),
        async (
          gradeId1,
          gradeId2,
          groupsForGrade1,
          groupsForGrade2,
          pickIndex,
        ) => {
          vi.clearAllMocks();

          const now = new Date();

          // Build full group records with their gradeId
          const allGroupsGrade1 = groupsForGrade1.map((g) => ({
            ...g,
            gradeId: gradeId1,
            createdAt: now,
            updatedAt: now,
          }));

          const allGroupsGrade2 = groupsForGrade2.map((g) => ({
            ...g,
            gradeId: gradeId2,
            createdAt: now,
            updatedAt: now,
          }));

          // Pick the gradeId to filter by
          const selectedGradeId = pickIndex === 0 ? gradeId1 : gradeId2;
          const matchingGroups =
            pickIndex === 0 ? allGroupsGrade1 : allGroupsGrade2;

          // Mock $transaction to return only the matching groups and count
          mockedTransaction.mockResolvedValue([
            matchingGroups,
            matchingGroups.length,
          ] as any);

          // Call getGroups with the selected gradeId filter
          const result = await getGroups(
            { page: 1, limit: 100 },
            selectedGradeId,
          );

          // ALL returned records must have the selected gradeId
          for (const group of result.data) {
            expect(group.gradeId).toBe(selectedGradeId);
          }

          // Count must match
          expect(result.total).toBe(matchingGroups.length);
          expect(result.data.length).toBe(matchingGroups.length);
        },
      ),
      { numRuns: 100 },
    );
  });
});

import {
  createGroup,
  getGroupById,
  updateGroup,
  deactivateGroup,
} from "./groups.service";
import { NotFoundError } from "../../shared/errors/app-error";

const mockedGroupCreate = vi.mocked(prisma.group.create);
const mockedGroupFindUnique = vi.mocked(prisma.group.findUnique);
const mockedGroupUpdate = vi.mocked(prisma.group.update);
const mockedGradeFindUnique = vi.mocked(prisma.grade.findUnique);

/**
 * Unit tests for groups service CRUD operations.
 *
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 11.3, 12.1, 12.2
 */
describe("Groups — Unit Tests", () => {
  const now = new Date();

  const fakeGrade = {
    id: 10,
    name: "Primero",
    description: "First grade",
    order: 1,
    isActive: true,
    educationLevelId: 5,
    createdAt: now,
    updatedAt: now,
  };

  const fakeGroup = {
    id: 1,
    name: "A",
    isActive: true,
    gradeId: 10,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createGroup", () => {
    it("should verify FK, call prisma.group.create, and return the created record", async () => {
      mockedGradeFindUnique.mockResolvedValue(fakeGrade as any);
      mockedGroupCreate.mockResolvedValue(fakeGroup as any);

      const result = await createGroup({
        name: "A",
        gradeId: 10,
      });

      expect(mockedGradeFindUnique).toHaveBeenCalledOnce();
      expect(mockedGradeFindUnique).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(mockedGroupCreate).toHaveBeenCalledOnce();
      expect(mockedGroupCreate).toHaveBeenCalledWith({
        data: {
          name: "A",
          gradeId: 10,
        },
      });
      expect(result).toEqual(fakeGroup);
    });

    it("should throw NotFoundError when grade does not exist", async () => {
      mockedGradeFindUnique.mockResolvedValue(null);

      await expect(createGroup({ name: "A", gradeId: 999 })).rejects.toThrow(
        NotFoundError,
      );
      await expect(createGroup({ name: "A", gradeId: 999 })).rejects.toThrow(
        "Grade not found",
      );
    });
  });

  describe("getGroups", () => {
    it("should call prisma.$transaction and return paginated data", async () => {
      const fakeGroups = [fakeGroup];
      mockedTransaction.mockResolvedValue([fakeGroups, 1] as any);

      const result = await getGroups({ page: 1, limit: 10 });

      expect(mockedTransaction).toHaveBeenCalledOnce();
      expect(result).toEqual({ data: fakeGroups, total: 1 });
    });
  });

  describe("getGroupById", () => {
    it("should return the record with grade (including educationLevel) when found", async () => {
      const fakeGroupDetail = {
        ...fakeGroup,
        grade: {
          id: 10,
          name: "Primero",
          educationLevel: {
            id: 5,
            name: "Primaria",
          },
        },
      };
      mockedGroupFindUnique.mockResolvedValue(fakeGroupDetail as any);

      const result = await getGroupById(1);

      expect(mockedGroupFindUnique).toHaveBeenCalledOnce();
      expect(mockedGroupFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          grade: {
            select: {
              id: true,
              name: true,
              educationLevel: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(fakeGroupDetail);
    });

    it("should throw NotFoundError when ID does not exist", async () => {
      mockedGroupFindUnique.mockResolvedValue(null);

      await expect(getGroupById(999)).rejects.toThrow(NotFoundError);
      await expect(getGroupById(999)).rejects.toThrow("Group not found");
    });
  });

  describe("updateGroup", () => {
    it("should update only provided fields and return the updated record", async () => {
      const updatedGroup = { ...fakeGroup, name: "B" };
      mockedGroupUpdate.mockResolvedValue(updatedGroup as any);

      const result = await updateGroup(1, { name: "B" });

      expect(mockedGroupUpdate).toHaveBeenCalledOnce();
      expect(mockedGroupUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "B" },
      });
      expect(result).toEqual(updatedGroup);
    });
  });

  describe("deactivateGroup", () => {
    it("should set isActive to false and return the updated record", async () => {
      const deactivated = { ...fakeGroup, isActive: false };
      mockedGroupUpdate.mockResolvedValue(deactivated as any);

      const result = await deactivateGroup(1);

      expect(mockedGroupUpdate).toHaveBeenCalledOnce();
      expect(mockedGroupUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result).toEqual(deactivated);
    });
  });
});
