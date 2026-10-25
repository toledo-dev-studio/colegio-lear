/** Record returned from the academic_cycle_wallet table */
export interface AcademicCycleWalletRecord {
  id: string;
  academicCycleId: string;
  name: string;
  code: string;
  description: string | null;
  dueDate: string;
  amount: number;
  allowForgiveness: boolean;
}

/** Input DTO for creating an academic cycle wallet item */
export interface CreateAcademicCycleWalletDto {
  name: string;
  code: string;
  description?: string;
  dueDate: string;
  amount: number;
  allowForgiveness?: boolean;
}

/** Input DTO for updating an academic cycle wallet item */
export interface UpdateAcademicCycleWalletDto {
  name?: string;
  code?: string;
  description?: string;
  dueDate?: string;
  amount?: number;
  allowForgiveness?: boolean;
}
