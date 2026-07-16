import type { KeyValuePair } from "./key-value-pair";
import type { AcademicCycleEnrollmentStatusKey, AcademicCycleSchoolGroupStatusKey, AcademicCycleStatusKey, AcademicPeriodTypeKey, AllergySeverityKey, AudienceTypeKey, BloodTypeKey, DayOfWeekKey, NotificationTypeKey, PaymentMethodKey, StudentGuardianRelationshipKey, StudentWalletStatusKey } from "./key-value-pair-types";

/**
 * DAY_OF_WEEKS represents a list of all possible days of the week with their corresponding keys and labels.
 */
export const DAY_OF_WEEKS: KeyValuePair<DayOfWeekKey>[] = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
];

/**
 * ACADEMIC_CYCLE_ENROLLMENT_STATUSES defines the possible statuses for a student's enrollment in an academic cycle group, which can be used to track the current state of the enrollment. 
 * Each status has a key and a label for display purposes.
 */
export const ACADEMIC_CYCLE_ENROLLMENT_STATUSES: KeyValuePair<AcademicCycleEnrollmentStatusKey>[] = [
    { key: "enrolled", label: "Inscrito" },
    { key: "completed", label: "Ciclo finalizado" },
    { key: "dropped", label: "Dado de baja" },
];

/**
 * ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES defines the possible statuses for an academic cycle group, which can be used to track the current state of the group. 
 * Each status has a key and a label for display purposes.
 */
export const ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES: KeyValuePair<AcademicCycleSchoolGroupStatusKey>[] = [
    { key: "active", label: "Activo" },
    { key: "discharged", label: "Dado de baja" },
];

/**
 * ACADEMIC_PERIOD_TYPES defines the different types of academic periods that can be used to categorize academic cycles.
 * Each type has a key and a label for display purposes.
 */
export const ACADEMIC_CYCLE_PERIOD_TYPES: KeyValuePair<AcademicPeriodTypeKey>[] = [
    { key: "annual", label: "Anual" },
    { key: "semester", label: "Semestral" },
    { key: "four-month-period", label: "Cuatrimestral" },
    { key: "trimester", label: "Trimestral" },
    { key: "bimester", label: "Bimestral" },
    { key: "monthly", label: "Mensual" },
    { key: "intensive", label: "Intensivo" },
    { key: "special", label: "Especial" },
];

/**
 * ACADEMIC_CYCLE_STATUSES defines the possible statuses for an academic cycle, which can be used to track the current state of the cycle. 
 * Each status has a key and a label for display purposes.
 */
export const ACADEMIC_CYCLE_STATUSES: KeyValuePair<AcademicCycleStatusKey>[] = [
    { key: "upcoming", label: "Próximo" },
    { key: "active", label: "En curso" },
    { key: "completed", label: "Finalizado" },
    { key: "cancelled", label: "Cancelado" },
    { key: "archived", label: "Archivado" },
];

/**
 * ALLERGY_SEVERITIES defines the possible severity levels for allergies, which can be used to categorize the severity of a student's allergy. 
 * Each severity level has a key and a label for display purposes.
 */
export const ALLERGY_SEVERITIES: KeyValuePair<AllergySeverityKey>[] = [
    { key: "mild", label: "Leve" },
    { key: "moderate", label: "Moderada" },
    { key: "severe", label: "Severa" },
];

/**
 * STUDENT_GUARDIANS defines the possible relationships a guardian can have with a student, along with their display labels.
 */
export const STUDENT_GUARDIANS_RELATIONSHIPS: KeyValuePair<StudentGuardianRelationshipKey>[] = [
    { key: "father", label: "Padre" },
    { key: "mother", label: "Madre" },
    { key: "grandmother", label: "Abuela" },
    { key: "grandfather", label: "Abuelo" },
    { key: "uncle", label: "Tío" },
    { key: "aunt", label: "Tía" },
    { key: "brother", label: "Hermano" },
    { key: "sister", label: "Hermana" },
    { key: "legal-guardian", label: "Tutor legal" },
    { key: "step-father", label: "Padrastro" },
    { key: "step-mother", label: "Madrastra" },
    { key: "other", label: "Otro" },
];

/**
 * BLOOD_TYPES is a constant array of key-value pairs representing the different blood types that can be assigned to a student. 
 * Each object in the array has a 'key' which is the blood type code (e.g., "A+", "O-", etc.) and a 'label' which is the human-readable name for that blood type. This constant can be used throughout the application wherever a selection of blood types is needed, ensuring consistency and ease of maintenance.
 */
export const BLOOD_TYPES: KeyValuePair<BloodTypeKey>[] = [
    { key: "A+", label: "A+" },
    { key: "A-", label: "A-" },
    { key: "B+", label: "B+" },
    { key: "B-", label: "B-" },
    { key: "AB+", label: "AB+" },
    { key: "AB-", label: "AB-" },
    { key: "O+", label: "O+" },
    { key: "O-", label: "O-" }
];

/**
 * STUDENT_WALLET_STATUSES defines the possible statuses for a student's payment associated with an academic cycle wallet, which can be used to track the current state of the payment. 
 * Each status has a key and a label for display purposes.
 */
export const STUDENT_WALLET_STATUSES: KeyValuePair<StudentWalletStatusKey>[] = [
    { key: "pending", label: "Pendiente" },
    { key: "paid", label: "Pagado" },
    { key: "overdue", label: "Vencido" },
    { key: "forgiven", label: "Condonado" },
];

/**
 * STUDENT_WALLET_STATUSES defines the possible statuses for a student's payment associated with an academic cycle wallet, which can be used to track the current state of the payment. 
 * Each status has a key and a label for display purposes.
 */
export const STUDENT_WALLET_PAYMENT_METHODS: KeyValuePair<PaymentMethodKey>[] = [
    { key: "cash", label: "Efectivo" },
    { key: "online-payment", label: "Pago en línea" },
];

/**
 * AUDIENCE_TYPES defines the possible audience for an announcement.
 * Each status has a key and a label for display purposes.
 */
export const AUDIENCE_TYPES: KeyValuePair<AudienceTypeKey>[] = [
    { key: "administrative-staff", label: "Personal administrativo" },
    { key: "teacher", label: "Docentes" },
    { key: "student", label: "Alumnos" }
];

/**
 * NOTIFICATION_TYPES defines the possible types for a notification.
 * Each status has a key and a label for display purposes.
 */
export const NOTIFICATION_TYPES: KeyValuePair<NotificationTypeKey>[] = [
    { key: "announcement", label: "Comunicado" },
    { key: "message", label: "Chat" },
];
