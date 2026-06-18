import { useNavigate, useParams } from "react-router";

import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import { useStudentAcademicCycleSchoolGroupEnrollmentPage } from "./hooks/useStudentAcademicCycleSchoolGroupEnrollmentPage";

export const StudentAcademicCycleSchoolGroupEnrollmentPage = () => {
  
  const {} = useStudentAcademicCycleSchoolGroupEnrollmentPage();
  
  const navigate = useNavigate();

  return (
    <>
      <section className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <CustomBreadcrumb items={[
            { label: "Seguimiento escolar" },
            { label: "Estudiantes", to: "/students" }
          ]} />
        </div>

        <CustomPageTitle 
          title="Ciclos escolares del estudiante" 
          subtitle="Gestiona la información de los ciclos escolares en los que el alumno se encuentra inscrito" />

        <div className="flex flex-col gap-8 mt-14">

        </div>
      </section>
    </>
  )
}
