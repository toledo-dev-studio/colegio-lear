import { GraduationCap } from "lucide-react";

import { useStudentGradesPage } from "../hooks/useStudentGradesPage";
import { ModulePageTitle } from "@/shared/components/module-page-title/ModulePageTitle";
import { StudentGradesGrid } from "@/modules/dashboard/components/student-grades/StudentGradesGrid";
import { StudentGradesGridSkeleton } from "@/modules/dashboard/components/student-grades/StudentGradesGridSkeleton";

export const StudentGradesPage = () => {
  const { context, queries } = useStudentGradesPage();
  return (
    <>
      <section className="page-main-section">

        {/* Page title */}
        <ModulePageTitle
          icon={GraduationCap}
          badge="Mi ciclo escolar"
          title="Boleta de calificaciones,"
          description="Revisa las calificaciones obtenidas por materia en cada evaluación del ciclo escolar seleccionado y da seguimiento a tu rendimiento académico."
          studentName={context.student?.fullName}
          cycle={context.academicCycle}
        />

        {/* Student grades */}
        <section className="min-w-0">
          {queries.studentGradesQuery.isLoading ? (<StudentGradesGridSkeleton />) : <StudentGradesGrid
            studentGrades={queries.studentGradesQuery.data ?? []}
            academicCycleId={context.academicCycle?.id!}
            enrollmentId={queries.enrollmentQuery.data?.id!}
            evaluationCount={context.academicCycle?.evaluationCount ?? 0}
            minimumPassingGrade={context.academicCycle?.minimumPassingGrade ?? 0}
            academicCycleSchoolGroupId={queries.enrollmentQuery.data?.academicCycleSchoolGroupId!} />}
        </section>

      </section>
    </>
  )
}
