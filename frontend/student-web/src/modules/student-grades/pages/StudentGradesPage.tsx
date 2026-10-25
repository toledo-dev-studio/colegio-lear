import { GraduationCap } from "lucide-react";

import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";
import { useStudentGradesPage } from "../hooks/useStudentGradesPage";
import { ModulePageTitle } from "@/shared/components/module-page-title/ModulePageTitle";
import { StudentGradesGrid } from "@/modules/dashboard/components/student-grades/StudentGradesGrid";
import { StudentGradesGridSkeleton } from "@/modules/dashboard/components/student-grades/StudentGradesGridSkeleton";
import { CardHeader } from "@/shared/components/card-header/CardHeader";

export const StudentGradesPage = () => {
  const { context, queries } = useStudentGradesPage();

  if (queries.studentGradesQuery.isError) {
    showApiErrorToast(queries.studentGradesQuery.error, "No fue posible obtener información de tus calificaciones");
  }

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
        <section className="card">
          <CardHeader
            icon={GraduationCap}
            title="Seguimiento académico"
            description="Calificación general del ciclo y desglose por materia. Escala 0–10."
            tone="emerald"
          />
          {queries.studentGradesQuery.isLoading ? (<StudentGradesGridSkeleton />) :
            <StudentGradesGrid
              studentGrades={queries.studentGradesQuery.data ?? []}
              academicCycleId={context.academicCycle?.id!}
              enrollmentId={context.enrollment?.id!}
              evaluationCount={context.academicCycle?.evaluationCount ?? 0}
              minimumPassingGrade={context.academicCycle?.minimumPassingGrade ?? 0}
              academicCycleSchoolGroupId={context.enrollment?.academicCycleSchoolGroupId!} />}
        </section>

      </section>
    </>
  )
}
