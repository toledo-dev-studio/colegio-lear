/** Filters applicable to payment concept list endpoints */
export interface PaymentConceptFilters {
  q?: string;
  name?: string;
  status?: boolean;
  allowRemission?: boolean;
  baseAmount?: number;
  minAmount?: number;
  maxAmount?: number;
}

/** Record returned from the payment_concepts table (used for all responses) */
export interface PaymentConceptRecord {
  id: string;
  name: string;
  description: string | null;
  baseAmount: number;
  allowRemission: boolean;
  status: boolean;
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

/** Input DTO for creating a payment concept */
export interface CreatePaymentConceptDto {
  name: string;
  description?: string;
  baseAmount: number;
  allowRemission?: boolean;
}

/** Input DTO for updating a payment concept (all fields optional) */
export interface UpdatePaymentConceptDto {
  name?: string;
  description?: string;
  baseAmount?: number;
  allowRemission?: boolean;
  status?: boolean;
}
