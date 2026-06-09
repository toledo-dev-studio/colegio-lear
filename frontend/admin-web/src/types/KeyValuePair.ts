export type KeyValuePair<T = string> = {
  key: T;
  label: string;
};

export type AcademicPeriodTypeKey =
  | "annual"
  | "semester"
  | "four-month-period"
  | "trimester"
  | "bimester"
  | "monthly"
  | "intensive"
  | "special";

export type AcademicCycleStatusKey =
  | "upcoming"
  | "active"
  | "completed"
  | "cancelled"
  | "archived";

export type AcademicCycleSchoolGroupStatusKey =
  | "active"
  | "discharged";

export type StudentGuardianTypeKey =
  | "father"
  | "mother"
  | "grandmother"
  | "grandfather"
  | "uncle"
  | "aunt"
  | "brother"
  | "sister"
  | "legal-guardian"
  | "step-father"
  | "step-mother"
  | "other";

export type StudentGroupEnrollmentStatusKey =
  | "enrolled"
  | "pending"
  | "transferred"
  | "completed"
  | "dropped";

export type StudentPaymentStatusKey =
  | "pending"
  | "paid"
  | "overdue"
  | "forgiven"
  | "cancelled";

export type AllergySeverityKey =
  | "mild"
  | "moderate"
  | "severe";

export type DayOfWeekKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type PaymentMethodKey =
  | "online-payment"
  | "cash";

export type BloodTypeKey =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export const labelOf = <T extends string>(
  list: KeyValuePair<T>[],
  key: T | undefined | null,
): string => list.find((x) => x.key === key)?.label || String(key ?? "");