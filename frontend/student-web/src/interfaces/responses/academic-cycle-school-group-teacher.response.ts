import type { EmployeeResponse } from "./employee.response";
import type { SchoolSubjectResponse } from "./school-subject.response";

/**
 * Type: Response
 * Description: Represents the schedule for a specific school subject within an academic cycle group, containing details about the day of the week, class schedule, and references to related entities such as the academic cycle and academic cycle group.
 */
export interface AcademicCycleSchoolGroupTeacherResponse {
    /**
     * Identifier of the associated academic cycle school subject (subject added to the cycle)
     */
    academicCycleSchoolSubjectId: string;
    /**
     * Identifier of the associated school subject
     */
    schoolSubjectId: string;
    /**
     * Reference to the associated school subject
     */
    schoolSubject: SchoolSubjectResponse;
    /**
     * Identifier of the associated teacher (employee)
     */
    teacherId: string;
    /**
     * Reference to the associated teacher (employee)
     */
    teacher: EmployeeResponse;
}
