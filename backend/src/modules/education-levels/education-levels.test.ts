import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";

/**
 * Mock the Prisma client before importing the service.
 * The service imports prisma from "../../shared/lib/prisma".
 */
vi.mock("../../shared/lib/prisma", () => ({
  prisma: {
    educationLevel: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "../../shared/lib/prisma";
import { updateEducationLevel } from "./education-levels.service";

const mockedUpdate = vi.mocked(prisma.educationLevel.update);

/** All updatable fields for an EducationLevel */
const UPDATABLE_FIELDS = ["name", "description", "order"] as const;

/**
 * Feature: education-levels-subjects, Property 1: Partial update preserves unchanged fields
 *
 * Validates: Requirements 3.1
 *
 * For any non-empty subset of updatable fields (name, description, order),
 * calling updateEducationLevel with only those fields should result in
 * prisma.educationLevel.update being called with ONLY those keys in `data`.
 */
describe("Feature: education-levels-subjects, Property 1: Partial update preserves unchanged fields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should pass only provided fields to prisma update — no extra keys", () => {
    fc.assert(
      fc.property(
        // Generate a non-empty subset of updatable field names
        fc.subarray(["name", "description", "order"] as const, {
          minLength: 1,
        }),
        // Generate values for each possible field
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ maxLength: 100 }),
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 10000 }),
        (fieldSubset, nameVal, descVal, orderVal, id) => {
          vi.clearAllMocks();

          // Build the input object with ONLY the selected fields
          const input: Record<string, unknown> = {};
          for (const field of fieldSubset) {
            if (field === "name") input.name = nameVal;
            if (field === "description") input.description = descVal;
            if (field === "order") input.order = orderVal;
          }

          // Mock prisma to return a fake merged record
          mockedUpdate.mockResolvedValue({
            id,
            name: nameVal,
            description: descVal,
            order: orderVal,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any);

          // Call the service function
          updateEducationLevel(id, input);

          // Verify prisma.educationLevel.update was called exactly once
          expect(mockedUpdate).toHaveBeenCalledOnce();

          const callArgs = mockedUpdate.mock.calls[0]![0] as {
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
            if (field === "order") expect(callArgs.data.order).toBe(orderVal);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

import {
  createEducationLevel,
  getEducationLevels,
  getEducationLevelById,
  deactivateEducationLevel,
} from "./education-levels.service";
import { NotFoundError } from "../../shared/errors/app-error";

const mockedCreate = vi.mocked(prisma.educationLevel.create);
const mockedFindMany = vi.mocked(prisma.educationLevel.findMany);
const mockedFindUnique = vi.mocked(prisma.educationLevel.findUnique);
const mockedCount = vi.mocked(prisma.educationLevel.count);
const mockedTransaction = vi.mocked(prisma.$transaction);

/**
 * Unit tests for education-levels service CRUD operations.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2
 */
describe("Education Levels — Unit Tests", () => {
  const now = new Date();

  const fakeLevel = {
    id: 1,
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

  describe("createEducationLevel", () => {
    it("should call prisma.educationLevel.create with correct data and return the created record", async () => {
      mockedCreate.mockResolvedValue(fakeLevel as any);

      const result = await createEducationLevel({
        name: "Primaria",
        description: "Primary education",
        order: 1,
      });

      expect(mockedCreate).toHaveBeenCalledOnce();
      expect(mockedCreate).toHaveBeenCalledWith({
        data: {
          name: "Primaria",
          description: "Primary education",
          order: 1,
        },
      });
      expect(result).toEqual(fakeLevel);
    });
  });

  describe("getEducationLevels", () => {
    it("should call prisma.$transaction with findMany and count, and return paginated data", async () => {
      const fakeLevels = [fakeLevel];
      mockedTransaction.mockResolvedValue([fakeLevels, 1] as any);

      const result = await getEducationLevels({ page: 1, limit: 10 });

      expect(mockedTransaction).toHaveBeenCalledOnce();
      expect(result).toEqual({ data: fakeLevels, total: 1 });
    });
  });

  describe("getEducationLevelById", () => {
    it("should return the record with _count when found", async () => {
      const fakeLevelWithCount = {
        ...fakeLevel,
        _count: { grades: 3 },
      };
      mockedFindUnique.mockResolvedValue(fakeLevelWithCount as any);

      const result = await getEducationLevelById(1);

      expect(mockedFindUnique).toHaveBeenCalledOnce();
      expect(mockedFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { _count: { select: { grades: true } } },
      });
      expect(result).toEqual(fakeLevelWithCount);
    });

    it("should throw NotFoundError when ID does not exist", async () => {
      mockedFindUnique.mockResolvedValue(null);

      await expect(getEducationLevelById(999)).rejects.toThrow(NotFoundError);
      await expect(getEducationLevelById(999)).rejects.toThrow(
        "Education level not found",
      );
    });
  });

  describe("updateEducationLevel", () => {
    it("should update only provided fields and return the updated record", async () => {
      const updatedLevel = { ...fakeLevel, name: "Secundaria" };
      mockedUpdate.mockResolvedValue(updatedLevel as any);

      const result = await updateEducationLevel(1, { name: "Secundaria" });

      expect(mockedUpdate).toHaveBeenCalledOnce();
      expect(mockedUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "Secundaria" },
      });
      expect(result).toEqual(updatedLevel);
    });
  });

  describe("deactivateEducationLevel", () => {
    it("should set isActive to false and return the updated record", async () => {
      const deactivated = { ...fakeLevel, isActive: false };
      mockedUpdate.mockResolvedValue(deactivated as any);

      const result = await deactivateEducationLevel(1);

      expect(mockedUpdate).toHaveBeenCalledOnce();
      expect(mockedUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result).toEqual(deactivated);
    });
  });
});
