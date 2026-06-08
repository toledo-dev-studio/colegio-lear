/** Record returned from the academic_cycle_wallet table */
export interface AcademicCycleWalletRecord {
  id: string;
  academicCycleId: string;
  paymentConceptId: string;
  dueDate: string;
  amount: number;
  allowForgiveness: boolean;
  paymentConcept: {
    id: string;
    name: string;
    amount: number;
    allowForgiveness: boolean;
  };
}

/** Input DTO for creating an academic cycle wallet item */
export interface CreateAcademicCycleWalletDto {
  paymentConceptId: string;
  dueDate: string;
  amount: number;
  allowForgiveness?: boolean;
}

/** Input DTO for updating an academic cycle wallet item */
export interface UpdateAcademicCycleWalletDto {
  paymentConceptId?: string;
  dueDate?: string;
  amount?: number;
  allowForgiveness?: boolean;
}
