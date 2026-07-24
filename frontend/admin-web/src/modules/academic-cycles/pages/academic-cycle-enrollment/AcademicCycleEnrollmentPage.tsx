import { Navigate, useOutletContext, useParams } from "react-router";

import { toast } from "sonner";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { OverviewRibbon } from "./components/overview-ribbon/OverviewRibbon";
import { StudentGradesGrid } from "./components/student-grades/StudentGradesGrid";
import { StudentWalletGrid } from "./components/student-wallet/StudentWalletGrid";
import { OverviewRibbonSkeleton } from "./components/overview-ribbon/OverviewRibbonSkeleton";
import type { AcademicCycleLayoutContext } from "../../interfaces/academic-cycle-layout-context";
import { useGetAcademicCycleEnrollmentById } from "../../hooks/academic-cycle-enrollments/useGetAcademicCycleEnrollmentById";

export const AcademicCycleEnrollmentPage = () => {
  // Get context from layout
  const { enrollmentId } = useParams();
  const { academicCycleId, academicCycle } = useOutletContext<AcademicCycleLayoutContext>();

  // Component hooks & stores
  const { data: academicCycleEnrollment, isLoading, isError } = useGetAcademicCycleEnrollmentById({ id: enrollmentId!, academicCycleId: academicCycleId! });

  if (isError) {
    toast.error("No fue posible obtener la información relacionada en alumno seleccionado", { position: "top-right" });
    return <Navigate to={`/academic-cycles/${academicCycleId}/enrollments`} />;
  }

  return (
    <>
      <section className="page-main-section ">

        <Breadcrumb items={[
          { label: "Seguimiento escolar" },
          { label: "Ciclos escolares", to: "/academic-cycles" },
          { label: academicCycle?.code || "Edición de ciclo escolar", to: `/academic-cycles/${academicCycleId}/enrollments` },
          { label: academicCycleEnrollment?.student?.enrollment! }
        ]} />

        <PageTitle
          title={`DETALLES DE INSCRIPCIÓN: ${academicCycleEnrollment?.code ?? "..."}`}
          subtitle="En esta sección podrás consultar y modificar la información de la incripción del alumno en el ciclo escolar." />

        {/* Ribbon overview */}
        {
          isLoading ?
            <OverviewRibbonSkeleton /> :
            <OverviewRibbon academicCycle={academicCycle!} academicCycleEnrollment={academicCycleEnrollment!} />
        }

        {/* Student grades grid */}
        <StudentGradesGrid
          enrollmentId={enrollmentId!}
          academicCycleSchoolGroupId={academicCycleEnrollment?.academicCycleSchoolGroupId!}
          academicCycleId={academicCycleId!}
          evaluationCount={academicCycle?.evaluationCount ?? 0}
          minimumPassingGrade={academicCycle?.minimumPassingGrade ?? 0} />

        {/* Payments KPI's overview */}
        <StudentWalletGrid
          enrollmentId={enrollmentId!}
          enrollmentStatus={academicCycleEnrollment?.status}
          academicCycleId={academicCycleId!} />

      </section>
    </>
  )
}
