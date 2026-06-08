import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
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
  constructor(private readonly prisma: PrismaClient) {}

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
    if (existingCurp) {
      throw new ConflictError("A student with this CURP already exists");
    }

    // Check uniqueness: email
    const existingEmail = await this.prisma.student.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictError("A student with this email already exists");
    }

    const enrollment = await this.generateEnrollment();

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
        status: true,
      },
    });

    return this.toRecord(created as unknown as Record<string, unknown>);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentRecord> {
    const existing = await this.prisma.student.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Student not found");

    // Check uniqueness if curp is changing
    if (dto.curp !== undefined && dto.curp !== existing.curp) {
      const dup = await this.prisma.student.findUnique({
        where: { curp: dto.curp },
      });
      if (dup)
        throw new ConflictError("A student with this CURP already exists");
    }

    // Check uniqueness if email is changing
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
}
