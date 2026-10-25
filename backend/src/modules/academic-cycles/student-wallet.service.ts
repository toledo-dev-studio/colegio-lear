import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  StudentWalletRecord,
  StudentWalletItemRecord,
  StudentWalletPaymentRecord,
  StudentWalletStatus,
  UpdateStudentWalletItemDto,
  CreateStudentWalletPaymentDto,
} from "./student-wallet.types";

/** Frontend enum values ("online-payment") vs Prisma enum member names ("online_payment") */
const PAYMENT_METHOD_MAP: Record<string, string> = {
  "online-payment": "online_payment",
  cash: "cash",
  forgiven: "forgiven",
};
const PAYMENT_METHOD_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(PAYMENT_METHOD_MAP).map(([k, v]) => [v, k]),
);

function computeStatus(item: {
  outstandingAmount: unknown;
  isForgiven: boolean;
  dueDate: Date;
  extensionDate: Date | null;
}): StudentWalletStatus {
  if (item.isForgiven) return "forgiven";
  if (Number(item.outstandingAmount) <= 0) return "paid";
  const reference = item.extensionDate ?? item.dueDate;
  if (new Date() > reference) return "overdue";
  return "pending";
}

/**
 * Business logic layer for the Student Wallet sub-resource (items + payments).
 * Items have no create endpoint — they're snapshotted from the academic
 * cycle's wallet catalog when the student enrolls (see
 * AcademicCycleEnrollmentService.create()). `status` is computed here on
 * every read, never persisted.
 */
export class StudentWalletService {
  constructor(private readonly prisma: PrismaClient) {}

  private async ensureEnrollmentExists(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
  ) {
    const enrollment = await this.prisma.academicCycleEnrollment.findFirst({
      where: { id: academicCycleEnrollmentId, academicCycleId },
    });
    if (!enrollment) {
      throw new NotFoundError("Inscripción al ciclo escolar no encontrada");
    }
    return enrollment;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toItemRecord(raw: any): StudentWalletItemRecord {
    return {
      id: raw.id,
      name: raw.name,
      code: raw.code,
      description: raw.description,
      dueDate: raw.dueDate.toISOString(),
      amount: Number(raw.amount),
      allowForgiveness: raw.allowForgiveness,
      outstandingAmount: Number(raw.outstandingAmount),
      isForgiven: raw.isForgiven,
      extensionDate: raw.extensionDate ? raw.extensionDate.toISOString() : null,
      status: computeStatus(raw),
      academicCycleEnrollmentId: raw.academicCycleEnrollmentId,
      academicCycleId: raw.academicCycleId,
      studentId: raw.studentId,
      academicCycleWalletId: raw.academicCycleWalletId,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toPaymentRecord(raw: any): StudentWalletPaymentRecord {
    return {
      id: raw.id,
      folio: raw.folio,
      amount: Number(raw.amount),
      createAt: raw.createdAt.toISOString(),
      paymentMethod:
        (PAYMENT_METHOD_REVERSE[raw.paymentMethod] as
          | "online-payment"
          | "cash") ?? raw.paymentMethod,
      academicCycleId: raw.academicCycleId,
      academicCycleEnrollmentId: raw.academicCycleEnrollmentId,
      studentWalletItemId: raw.studentWalletItemId,
    };
  }

  /** GET wallet (summary + items) for an enrollment */
  async findWallet(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
  ): Promise<StudentWalletRecord> {
    await this.ensureEnrollmentExists(academicCycleId, academicCycleEnrollmentId);

    const rows = await this.prisma.studentWalletItem.findMany({
      where: { academicCycleEnrollmentId },
      orderBy: { dueDate: "asc" },
    });

    const items = rows.map((r) => this.toItemRecord(r));

    const summary = {
      total: round2(items.reduce((sum, i) => sum + i.amount, 0)),
      // Forgiven items count toward "paid" too — their outstandingAmount is
      // already zeroed out when forgiven, so amount - outstandingAmount
      // naturally covers both real payments and forgiven balances.
      paid: round2(
        items.reduce((sum, i) => sum + (i.amount - i.outstandingAmount), 0),
      ),
      outstanding: round2(items.reduce((sum, i) => sum + i.outstandingAmount, 0)),
      overdue: round2(
        items
          .filter((i) => i.status === "overdue")
          .reduce((sum, i) => sum + i.outstandingAmount, 0),
      ),
    };

    return { summary, items };
  }

  /** GET payments for an enrollment */
  async findPayments(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
  ): Promise<StudentWalletPaymentRecord[]> {
    await this.ensureEnrollmentExists(academicCycleId, academicCycleEnrollmentId);

    const results = await this.prisma.studentWalletPayment.findMany({
      where: { academicCycleEnrollmentId },
      orderBy: { createdAt: "desc" },
    });

    return results.map((r) => this.toPaymentRecord(r));
  }

  /** PATCH update a wallet item (forgiveness / extension only) */
  async updateItem(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
    id: string,
    dto: UpdateStudentWalletItemDto,
  ): Promise<StudentWalletItemRecord> {
    await this.ensureEnrollmentExists(academicCycleId, academicCycleEnrollmentId);

    const existing = await this.prisma.studentWalletItem.findFirst({
      where: { id, academicCycleEnrollmentId },
    });
    if (!existing) {
      throw new NotFoundError("Concepto de cartera del alumno no encontrado");
    }

    const nextAllowForgiveness = dto.allowForgiveness ?? existing.allowForgiveness;
    if (dto.isForgiven === true && !nextAllowForgiveness) {
      throw new ConflictError(
        "Este concepto no permite condonación (allowForgiveness es false)",
      );
    }

    // Only a false -> true transition settles the balance and logs a
    // "forgiven" payment — re-sending isForgiven: true on an item that's
    // already forgiven is a no-op, so it never double-logs.
    const isForgivingNow = dto.isForgiven === true && !existing.isForgiven;
    const forgivenAmount = Number(existing.outstandingAmount);

    const updateData: Record<string, unknown> = {};
    if (dto.allowForgiveness !== undefined)
      updateData.allowForgiveness = dto.allowForgiveness;
    if (dto.extensionDate !== undefined)
      updateData.extensionDate = dto.extensionDate
        ? new Date(dto.extensionDate)
        : null;
    if (dto.isForgiven !== undefined) {
      updateData.isForgiven = dto.isForgiven;
      // Forgiving an item settles its pending balance, per the front's own
      // copy: "El pago pendiente quedará saldado cuando se active esta opción."
      if (dto.isForgiven) updateData.outstandingAmount = 0;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const item = await tx.studentWalletItem.update({
        where: { id },
        data: updateData,
      });

      // Give forgiveness a real entry in the payment history (type
      // "forgiven") instead of silently zeroing outstandingAmount — this is
      // what lets the wallet summary's "paid" total account for it too.
      if (isForgivingNow && forgivenAmount > 0) {
        const folio = await this.generateFolio();
        await tx.studentWalletPayment.create({
          data: {
            folio,
            amount: forgivenAmount,
            paymentMethod: "forgiven",
            academicCycleId,
            academicCycleEnrollmentId,
            studentWalletItemId: id,
          },
        });
      }

      return item;
    });

    return this.toItemRecord(updated);
  }

  /** Generate a payment folio like PAG-2026-000001 */
  private async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PAG-${year}-`;

    const last = await this.prisma.studentWalletPayment.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { folio: "desc" },
      select: { folio: true },
    });

    let nextNumber = 1;
    if (last) {
      const lastNumber = parseInt(last.folio.slice(prefix.length), 10);
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(6, "0")}`;
  }

  /** POST register a payment against a wallet item */
  async createPayment(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
    studentWalletItemId: string,
    dto: CreateStudentWalletPaymentDto,
  ): Promise<StudentWalletPaymentRecord> {
    await this.ensureEnrollmentExists(academicCycleId, academicCycleEnrollmentId);

    const item = await this.prisma.studentWalletItem.findFirst({
      where: { id: studentWalletItemId, academicCycleEnrollmentId },
    });
    if (!item) {
      throw new NotFoundError("Concepto de cartera del alumno no encontrado");
    }

    const status = computeStatus(item);
    if (status === "paid" || status === "forgiven") {
      throw new ConflictError(
        "Este concepto de cartera ya está liquidado y no puede recibir más pagos",
      );
    }

    if (dto.amount > Number(item.outstandingAmount)) {
      throw new ConflictError(
        "El monto del pago no puede exceder el saldo pendiente",
      );
    }

    const folio = await this.generateFolio();

    const created = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.studentWalletPayment.create({
        data: {
          folio,
          amount: dto.amount,
          paymentMethod: PAYMENT_METHOD_MAP[dto.paymentMethod] as never,
          academicCycleId,
          academicCycleEnrollmentId,
          studentWalletItemId,
        },
      });

      await tx.studentWalletItem.update({
        where: { id: studentWalletItemId },
        data: {
          outstandingAmount: Number(item.outstandingAmount) - dto.amount,
        },
      });

      return payment;
    });

    return this.toPaymentRecord(created);
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
