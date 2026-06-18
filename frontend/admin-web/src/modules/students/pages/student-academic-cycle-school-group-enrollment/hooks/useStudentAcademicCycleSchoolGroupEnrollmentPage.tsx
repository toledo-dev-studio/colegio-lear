import { useGetByIdStudentGeneralInformation } from "@/modules/students/hooks/students/useGetByIdStudentGeneralInformation";
import { useParams } from "react-router";

export const useStudentAcademicCycleSchoolGroupEnrollmentPage = () => {
  // Component hooks & stores
  const { studentId, academicCycleSchoolGroupId } = useParams();

  // Queries
  const studentQuery = useGetByIdStudentGeneralInformation(studentId);
  

  return {
    context: {
      studentId,
      academicCycleSchoolGroupId
    }
  }
}
