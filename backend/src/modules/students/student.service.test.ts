import { describe, it, expect, beforeEach, vi } from "vitest";
import { StudentService } from "./student.service";
import { NotFoundError } from "../../shared/errors/app-error";

/**
 * Unit tests for StudentService.uploadAvatar — the only new logic added to
 * this service for the student-portal "Mi cuenta" module (the rest of the
 * class is pre-existing, unmodified, and already exercised via the admin
 * panel). PrismaClient and IStorageService are fully mocked, same approach
 * as scholarship.test.ts.
 */

function createMockPrisma() {
  return {
    student: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
}

function createMockStorage() {
  return {
    upload: vi.fn(),
    delete: vi.fn(),
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;
type MockStorage = ReturnType<typeof createMockStorage>;

const BASE_STUDENT = {
  id: "student-uuid",
  name: "Valentina",
  firstLastName: "Hernández",
  secondLastName: "Ramírez",
  dateOfBirth: new Date("2012-05-14T00:00:00.000Z"),
  curp: "HERV120514MDFRMR01",
  enrollment: "LR-2026-0001",
  avatar: "students/old-avatar.jpg",
  observations: null,
  isActive: true,
  isDeleted: false,
  bloodType: "O_POSITIVE",
  medicalNotes: null,
  email: "valentina@colegiolear.com.mx",
  phoneNumber: "5551234567",
  address: "Calle Falsa 123",
  state: "Ciudad de México",
  municipality: "Benito Juárez",
  postalCode: "03900",
};

const FILE = {
  buffer: Buffer.from("fake-image-bytes"),
  originalname: "avatar.jpg",
  mimetype: "image/jpeg",
};

describe("StudentService.uploadAvatar", () => {
  let prisma: MockPrisma;
  let storage: MockStorage;
  let service: StudentService;

  beforeEach(() => {
    prisma = createMockPrisma();
    storage = createMockStorage();
    service = new StudentService(prisma as any, storage as any, {} as any);
  });

  it("should upload the file to the 'students' subfolder and update the student's avatar", async () => {
    prisma.student.findUnique.mockResolvedValue(BASE_STUDENT);
    storage.upload.mockResolvedValue("students/new-avatar.jpg");
    prisma.student.update.mockResolvedValue({
      ...BASE_STUDENT,
      avatar: "students/new-avatar.jpg",
    });

    const result = await service.uploadAvatar("student-uuid", FILE);

    expect(storage.upload).toHaveBeenCalledWith({
      buffer: FILE.buffer,
      fileName: FILE.originalname,
      mimeType: FILE.mimetype,
      subfolder: "students",
    });
    expect(prisma.student.update).toHaveBeenCalledWith({
      where: { id: "student-uuid" },
      data: { avatar: "students/new-avatar.jpg" },
    });
    expect(result.avatar).toContain("students/new-avatar.jpg");
  });

  it("should delete the previous avatar when one already existed", async () => {
    prisma.student.findUnique.mockResolvedValue(BASE_STUDENT);
    storage.upload.mockResolvedValue("students/new-avatar.jpg");
    prisma.student.update.mockResolvedValue({
      ...BASE_STUDENT,
      avatar: "students/new-avatar.jpg",
    });

    await service.uploadAvatar("student-uuid", FILE);

    expect(storage.delete).toHaveBeenCalledWith("students/old-avatar.jpg");
  });

  it("should not attempt to delete anything when there was no previous avatar", async () => {
    prisma.student.findUnique.mockResolvedValue({
      ...BASE_STUDENT,
      avatar: null,
    });
    storage.upload.mockResolvedValue("students/new-avatar.jpg");
    prisma.student.update.mockResolvedValue({
      ...BASE_STUDENT,
      avatar: "students/new-avatar.jpg",
    });

    await service.uploadAvatar("student-uuid", FILE);

    expect(storage.delete).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when the student does not exist", async () => {
    prisma.student.findUnique.mockResolvedValue(null);

    await expect(service.uploadAvatar("gone-uuid", FILE)).rejects.toThrow(
      NotFoundError,
    );
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when the student is deleted", async () => {
    prisma.student.findUnique.mockResolvedValue({
      ...BASE_STUDENT,
      isDeleted: true,
    });

    await expect(
      service.uploadAvatar("student-uuid", FILE),
    ).rejects.toThrow(NotFoundError);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when the student is inactive", async () => {
    prisma.student.findUnique.mockResolvedValue({
      ...BASE_STUDENT,
      isActive: false,
    });

    await expect(
      service.uploadAvatar("student-uuid", FILE),
    ).rejects.toThrow(NotFoundError);
    expect(storage.upload).not.toHaveBeenCalled();
  });
});
