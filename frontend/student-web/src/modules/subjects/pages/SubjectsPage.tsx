// Página de Materias escolares: lista de materias del alumno en cards

import { BookOpen } from "lucide-react";

import { useSubjectsPage } from "../hooks/useSubjectsPage";
import { ModulePageTitle } from "@/shared/components/module-page-title/ModulePageTitle";
import { CardHeader } from "@/shared/components/card-header/CardHeader";
import { SchoolSubjectsGrid } from "../components/school-subjects-grid/SchoolSubjectsGrid";
import { SchoolSubjectsGridSkeleton } from "../components/school-subjects-grid/SchoolSubjectsGridSkeleton";

export const SubjectsPage = () => {
  const { context, queries, schoolSubjects } = useSubjectsPage();
  const isLoading = queries.schoolSubjectsQuery.isLoading || queries.calendarsQuery.isLoading;

  return (
    <>
      <section className="page-main-section">

        {/* Page title */}
        <ModulePageTitle
          icon={BookOpen}
          badge="Mi ciclo escolar"
          title="Materias escolares,"
          description="Consulta las materias que se te imparten en el ciclo escolar seleccionado, con la descripción, el docente a cargo y su horario semanal."
          studentName={context.student?.fullName}
          cycle={context.academicCycle}
        />

        {/* School subjects */}
        <section className="card">
          <CardHeader
            icon={BookOpen}
            title="Materias de tu grupo"
            description="Materias impartidas a tu grupo en el ciclo escolar seleccionado."
            tone="amber"
          />

          {isLoading ? (<SchoolSubjectsGridSkeleton />) :
            <SchoolSubjectsGrid schoolSubjects={schoolSubjects} />}

        </section>

      </section>
    </>
  )
}
