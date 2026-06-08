import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcrypt";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import { env } from "../../shared/config/env.config";
import { logger } from "../../shared/lib/logger";
import type { IMailService } from "../../shared/services/mail.service";
import { studentCredentialsEmail } from "../../shared/templates/email.templates";
import type {
  StudentFilters,
  StudentRecord,
  PagedResult,
  CreateStudentDto,
  UpdateStudentDto,
} from "./student.types";

interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Business logic layer for the Students module.
 */
export class StudentService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mail: IMailService,
  ) {}

  private buildWhereClause(filters: StudentFilters) {
    const where: Record<string, unknown> = { isDeleted: false };
    const andConditions: unknown[] = [];

    if (filters.q) {
      andConditions.push({
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { firstLastName: { contains: filters.q, mode: "insensitive" } },
          { secondLastName: { contains: filters.q, mode: "insensitive" } },
          { email: { contains: filters.q, mode: "insensitive" } },
          { curp: { contains: filters.q, mode: "insensitive" } },
          { enrollment: { contains: filters.q, mode: "insensitive" } },
        ],
      });
    }

    if (filters.name) {
      andConditions.push({
        OR: [
          { name: { contains: filters.name, mode: "insensitive" } },
          { firstLastName: { contains: filters.name, mode: "insensitive" } },
          { secondLastName: { contains: filters.name, mode: "insensitive" } },
        ],
      });
    }

    if (filters.curp) {
      andConditions.push({
        curp: { contains: filters.curp, mode: "insensitive" },
      });
    }

    if (filters.enrollment) {
      andConditions.push({
        enrollment: { contains: filters.enrollment, mode: "insensitive" },
      });
    }

    if (filters.email) {
      andConditions.push({
        email: { contains: filters.email, mode: "insensitive" },
      });
    }

    if (filters.phoneNumber) {
      andConditions.push({
        phoneNumber: { contains: filters.phoneNumber, mode: "insensitive" },
      });
    }

    if (filters.status !== undefined) {
      andConditions.push({ status: filters.status });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  private toRecord(raw: Record<string, unknown>): StudentRecord {
    return {
      id: raw.id as string,
      name: raw.name as string,
      firstLastName: raw.firstLastName as string,
      secondLastName: raw.secondLastName as string,
      dateOfBirth: (raw.dateOfBirth as Date).toISOString(),
      curp: raw.curp as string,
      enrollment: raw.enrollment as string,
      image: raw.image as string | null,
      observations: raw.observations as string | null,
      status: raw.status as boolean,
      email: raw.email as string,
      phoneNumber: raw.phoneNumber as string,
      address: raw.address as string,
      state: raw.state as string,
      municipality: raw.municipality as string,
      postalCode: raw.postalCode as string,
    };
  }

  /** Generate enrollment like LR-2025-0001 */
  private async generateEnrollment(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `LR-${year}-`;

    const lastStudent = await this.prisma.student.findFirst({
      where: { enrollment: { startsWith: prefix } },
      orderBy: { enrollment: "desc" },
      select: { enrollment: true },
    });

    let nextNumber = 1;
    if (lastStudent) {
      const lastNumber = parseInt(
        lastStudent.enrollment.slice(prefix.length),
        10,
      );
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, "0")}`;
  }

  /** Generate 8-character alphanumeric password */
  private generateTempPassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async findAll(filters: StudentFilters): Promise<StudentRecord[]> {
    const where = this.buildWhereClause(filters);
    const results = await this.prisma.student.findMany({ where });
    return results.map((r) =>
      this.toRecord(r as unknown as Record<string, unknown>),
    );
  }

  async findAllPaged(
    filters: StudentFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<StudentRecord>> {
    const where = this.buildWhereClause(filters);

    const [data, itemsCount] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.student.count({ where }),
    ]);

    const totalPages = Math.ceil(itemsCount / pagination.pageSize);

    return {
      data: data.map((r) =>
        this.toRecord(r as unknown as Record<string, unknown>),
      ),
      totalPages,
      currentPage: pagination.page,
      itemsCount,
    };
  }

  async findById(id: string): Promise<StudentRecord> {
    const student = await this.prisma.student.findUnique({ where: { id } });

    if (!student || student.isDeleted) {
      throw new NotFoundError("Student not found");
    }

    return this.toRecord(student as unknown as Record<string, unknown>);
  }

  async create(dto: CreateStudentDto): Promise<StudentRecord> {
    // Check uniqueness: curp
    const existingCurp = await this.prisma.student.findUnique({
      where: { curp: dto.curp },
    });
    if (existingCurp)
      throw new ConflictError("A student with this CURP already exists");

    // Check uniqueness: email
    const existingEmail = await this.prisma.student.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail)
      throw new ConflictError("A student with this email already exists");

    const enrollment = await this.generateEnrollment();
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(
      tempPassword,
      env.BCRYPT_SALT_ROUNDS,
    );

    const created = await this.prisma.student.create({
      data: {
        name: dto.name,
        firstLastName: dto.firstLastName,
        secondLastName: dto.secondLastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        curp: dto.curp,
        enrollment,
        image: dto.image ?? null,
        observations: dto.observations ?? null,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        state: dto.state,
        municipality: dto.municipality,
        postalCode: dto.postalCode,
        password: hashedPassword,
        mustChangePassword: true,
        status: true,
      },
    });

    return this.toRecord(created as unknown as Record<string, unknown>);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentRecord> {
    const existing = await this.prisma.student.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Student not found");

    if (dto.curp !== undefined && dto.curp !== existing.curp) {
      const dup = await this.prisma.student.findUnique({
        where: { curp: dto.curp },
      });
      if (dup)
        throw new ConflictError("A student with this CURP already exists");
    }

    if (dto.email !== undefined && dto.email !== existing.email) {
      const dup = await this.prisma.student.findUnique({
        where: { email: dto.email },
      });
      if (dup)
        throw new ConflictError("A student with this email already exists");
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.firstLastName !== undefined)
      updateData.firstLastName = dto.firstLastName;
    if (dto.secondLastName !== undefined)
      updateData.secondLastName = dto.secondLastName;
    if (dto.dateOfBirth !== undefined)
      updateData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.curp !== undefined) updateData.curp = dto.curp;
    if (dto.image !== undefined) updateData.image = dto.image;
    if (dto.observations !== undefined)
      updateData.observations = dto.observations;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phoneNumber !== undefined) updateData.phoneNumber = dto.phoneNumber;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.state !== undefined) updateData.state = dto.state;
    if (dto.municipality !== undefined)
      updateData.municipality = dto.municipality;
    if (dto.postalCode !== undefined) updateData.postalCode = dto.postalCode;
    if (dto.status !== undefined) updateData.status = dto.status;

    const updated = await this.prisma.student.update({
      where: { id },
      data: updateData,
    });

    return this.toRecord(updated as unknown as Record<string, unknown>);
  }

  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.student.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Student not found");
    if (existing.isDeleted)
      throw new ConflictError("Student is already deleted");

    await this.prisma.student.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  /**
   * Send credentials to all principal guardians of a student.
   * Generates a new temp password, updates the student record, and sends emails.
   */
  async sendCredentials(studentId: string): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || student.isDeleted)
      throw new NotFoundError("Student not found");

    // Get principal guardians
    const guardians = await this.prisma.studentGuardian.findMany({
      where: { studentId, isPrincipal: true },
    });

    if (guardians.length === 0) {
      throw new ConflictError("No principal guardians found for this student");
    }

    // Generate new temp password and hash it
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(
      tempPassword,
      env.BCRYPT_SALT_ROUNDS,
    );

    // Update student password
    await this.prisma.student.update({
      where: { id: studentId },
      data: { password: hashedPassword, mustChangePassword: true },
    });

    const studentFullName = `${student.name} ${student.firstLastName} ${student.secondLastName}`;
    const portalUrl = env.FRONTEND_URL; // Will be the student portal URL in the future

    // Send email to each principal guardian (fire and forget)
    for (const guardian of guardians) {
      this.mail
        .sendMail({
          to: guardian.email,
          subject: "Credenciales de acceso al portal - Colegio Lear",
          html: studentCredentialsEmail({
            guardianName: guardian.fullName,
            studentName: studentFullName,
            enrollment: student.enrollment,
            tempPassword,
            portalUrl,
          }),
        })
        .catch((error) => {
          logger.error("Failed to send student credentials email", {
            error,
            studentId,
            guardianId: guardian.id,
          });
        });
    }
  }
}
