import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
import type {
  AcademicCycleWalletRecord,
  CreateAcademicCycleWalletDto,
  UpdateAcademicCycleWalletDto,
} from "./academic-cycle-wallet.types";

// ─── Include clause for related entities ────────────────────────────────────

const INCLUDE_RELATIONS = {
  paymentConcept: {
    select: { id: true, name: true, amount: true, allowForgiveness: true },
  },
};

/**
 * Business logic layer for the Academic Cycle Wallet sub-resource.
 */
export class AcademicCycleWalletService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Verifies the parent academic cycle exists */
  private async ensureCycleExists(academicCycleId: string): Promise<void> {
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: academicCycleId },
      select: { id: true },
    });
    if (!cycle) throw new NotFoundError("Academic cycle not found");
  }

  private toRecord(raw: Record<string, unknown>): AcademicCycleWalletRecord {
    const paymentConcept = raw.paymentConcept as Record<string, unknown>;
    return {
      id: raw.id as string,
      academicCycleId: raw.academicCycleId as string,
      paymentConceptId: raw.paymentConceptId as string,
      dueDate: (raw.dueDate as Date).toISOString(),
      amount: Number(raw.amount),
      allowForgiveness: raw.allowForgiveness as boolean,
      paymentConcept: {
        id: paymentConcept.id as string,
        name: paymentConcept.name as string,
        amount: Number(paymentConcept.amount),
        allowForgiveness: paymentConcept.allowForgiveness as boolean,
      },
    };
  }

  /** GET all wallet items for an academic cycle */
  async findAll(academicCycleId: string): Promise<AcademicCycleWalletRecord[]> {
    await this.ensureCycleExists(academicCycleId);

    const results = await this.prisma.academicCycleWallet.findMany({
      where: { academicCycleId },
      include: INCLUDE_RELATIONS,
      orderBy: { dueDate: "asc" },
    });

    return results.map((r) =>
      this.toRecord(r as unknown as Record<string, unknown>),
    );
  }

  /** POST create a new wallet item */
  async create(
    academicCycleId: string,
    dto: CreateAcademicCycleWalletDto,
  ): Promise<AcademicCycleWalletRecord> {
    await this.ensureCycleExists(academicCycleId);

    const created = await this.prisma.academicCycleWallet.create({
      data: {
        academicCycleId,
        paymentConceptId: dto.paymentConceptId,
        dueDate: new Date(dto.dueDate),
        amount: dto.amount,
        allowForgiveness: dto.allowForgiveness ?? false,
      },
      include: INCLUDE_RELATIONS,
    });

    return this.toRecord(created as unknown as Record<string, unknown>);
  }

  /** PATCH update a wallet item */
  async update(
    academicCycleId: string,
    id: string,
    dto: UpdateAcademicCycleWalletDto,
  ): Promise<AcademicCycleWalletRecord> {
    await this.ensureCycleExists(academicCycleId);

    const existing = await this.prisma.academicCycleWallet.findFirst({
      where: { id, academicCycleId },
    });
    if (!existing) {
      throw new NotFoundError("Academic cycle wallet item not found");
    }

    const updateData: Record<string, unknown> = {};
    if (dto.paymentConceptId !== undefined)
      updateData.paymentConceptId = dto.paymentConceptId;
    if (dto.dueDate !== undefined) updateData.dueDate = new Date(dto.dueDate);
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.allowForgiveness !== undefined)
      updateData.allowForgiveness = dto.allowForgiveness;

    const updated = await this.prisma.academicCycleWallet.update({
      where: { id },
      data: updateData,
      include: INCLUDE_RELATIONS,
    });

    return this.toRecord(updated as unknown as Record<string, unknown>);
  }

  /** DELETE hard delete a wallet item */
  async remove(academicCycleId: string, id: string): Promise<void> {
    await this.ensureCycleExists(academicCycleId);

    const existing = await this.prisma.academicCycleWallet.findFirst({
      where: { id, academicCycleId },
    });
    if (!existing) {
      throw new NotFoundError("Academic cycle wallet item not found");
    }

    await this.prisma.academicCycleWallet.delete({ where: { id } });
  }
}
