export type StudentWalletStatus = "pending" | "paid" | "overdue" | "forgiven";
export type PaymentMethod = "online-payment" | "cash";

/** Record derived from the student_wallet_items table (status is computed, not stored) */
export interface StudentWalletItemRecord {
  id: string;
  name: string;
  description: string | null;
  dueDate: string;
  amount: number;
  allowForgiveness: boolean;
  outstandingAmount: number;
  isForgiven: boolean;
  extensionDate: string | null;
  status: StudentWalletStatus;
  academicCycleEnrollmentId: string;
  academicCycleId: string;
  studentId: string;
  academicCycleWalletId: string;
}

export interface StudentWalletSummary {
  total: number;
  outstanding: number;
  paid: number;
  overdue: number;
}

export interface StudentWalletRecord {
  summary: StudentWalletSummary;
  items: StudentWalletItemRecord[];
}

/**
 * Record returned from the student_wallet_payments table.
 * `createAt` (not `createdAt`) matches the frontend's response interface
 * exactly — it's a typo on their side, but this is the field name they read.
 */
export interface StudentWalletPaymentRecord {
  id: string;
  folio: string;
  amount: number;
  createAt: string;
  paymentMethod: PaymentMethod;
  academicCycleId: string;
  academicCycleEnrollmentId: string;
  studentWalletItemId: string;
}

/** Input DTO for updating a student wallet item (forgiveness/extension only) */
export interface UpdateStudentWalletItemDto {
  allowForgiveness?: boolean;
  isForgiven?: boolean;
  extensionDate?: string | null;
}

/** Input DTO for creating a student wallet payment */
export interface CreateStudentWalletPaymentDto {
  amount: number;
  paymentMethod: PaymentMethod;
}
