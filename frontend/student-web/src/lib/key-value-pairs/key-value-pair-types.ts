export type JobTitleTypeKey =
  | "teacher"
  | "administrative-staff";

export type AudienceTypeKey =
  | "administrative-staff"
  | "teacher"
  | "student";

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

export type StudentGuardianRelationshipKey =
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

export type AcademicCycleEnrollmentStatusKey =
  | "enrolled"
  | "completed"
  | "dropped";

export type StudentWalletStatusKey =
  | "pending"
  | "paid"
  | "overdue"
  | "forgiven";

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
  | "forgiven" // Condonado
  | "online-payment" // Pago en línea
  | "cash"; // Efectivo (caja)

export type BloodTypeKey =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type NotificationTypeKey =
  | "info"
  | "error"
  | "announcement"
  | "message";

export type AnnouncementsStatusKey =
  | "draft"
  | "in-progress"
  | "completed"
  | "cancelled"