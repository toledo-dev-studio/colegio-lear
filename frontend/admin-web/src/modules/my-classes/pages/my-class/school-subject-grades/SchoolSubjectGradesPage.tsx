import { Navigate, useParams } from "react-router";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { MyClassLayoutSkeleton } from "../../../layouts/MyClassLayoutSkeleton";
import { useGetMyClassById } from "../../../hooks/my-class/useGetMyClassById";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import { useGetAcademicCycleById } from "@/modules/academic-cycles/hooks/academic-cycles/useGetAcademicCycleById";
import { useSchoolSubjectsTab } from "../school-subjects-tab/hooks/useSchoolSubjectsTab";
import { useSchoolSubjectGradesPage } from "./hooks/useSchoolSubjectGradesPage";
import { SchoolSubjectGradesStats } from "./components/SchoolSubjectGradesStats";
import { SchoolSubjectGradesTable } from "./components/SchoolSubjectGradesTable";

export const SchoolSubjectGradesPage = () => {
    // Component hooks & stores
    const { id, subjectId } = useParams();

    const myClassQuery = useGetMyClassById({ id: id! });
    const academicCycleId = myClassQuery.data?.academicCycle?.id;
    const academicCycleQuery = useGetAcademicCycleById({ id: academicCycleId! });
    const { schoolSubjects } = useSchoolSubjectsTab({ academicCycleId, schoolGroupId: id! });
    const loggedInUserCanWrite = usePermission("my-classes", "can-write");

    const subject = schoolSubjects.find((item) => item.schoolSubjectId === subjectId);

    const {
        enrollments,
        studentGrades,
        draft,
        dirtyCount,
        isLoading,
        isError,
        error,
        stats,
        handleChangeGrade,
        handleSubmit,
    } = useSchoolSubjectGradesPage({
        academicCycleId,
        academicCycleSchoolGroupId: id,
        schoolSubjectId: subjectId,
        evaluationCount: academicCycleQuery.data?.evaluationCount ?? 0,
        minimumPassingGrade: academicCycleQuery.data?.minimumPassingGrade ?? 0,
    });

    if (myClassQuery.isError) {
        showApiErrorToast(myClassQuery.error, "No fue posible obtener la información de la clase");
        return <Navigate to="/my-classes" />;
    }

    if (isError) {
        showApiErrorToast(error, "No fue posible obtener información de las calificaciones");
    }

    if (myClassQuery.isLoading || !myClassQuery.data) {
        return <MyClassLayoutSkeleton />;
    }

    const subjectName = subject?.name ?? "Materia";

    return (
        <section className="w-full py-12 px-10 lg:px-15">

            <div className="mb-10">
                <Breadcrumb items={[
                    { label: "Mis clases", to: "/my-classes" },
                    { label: myClassQuery.data.name, to: `/my-classes/${id}/school-subjects` },
                    { label: subjectName },
                    { label: "Calificaciones" },
                ]} />
            </div>

            <PageTitle
                title={`CALIFICACIONES: ${subjectName.toUpperCase()}`}
                subtitle="Consulta y registra las calificaciones de los alumnos del grupo escolar según las evaluaciones definidas en el ciclo escolar." />

            <section className="flex flex-col gap-y-6 mt-8">

                {/* Subject grades stats */}
                <SchoolSubjectGradesStats
                    isLoading={isLoading}
                    stats={stats}
                    minimumPassingGrade={academicCycleQuery.data?.minimumPassingGrade ?? 0}
                    totalStudents={enrollments.length} />

                {/* Students grades table */}
                <SchoolSubjectGradesTable
                    enrollments={enrollments}
                    studentGrades={studentGrades}
                    draft={draft}
                    evaluationCount={academicCycleQuery.data?.evaluationCount ?? 0}
                    minimumPassingGrade={academicCycleQuery.data?.minimumPassingGrade ?? 0}
                    isLoading={isLoading}
                    isError={isError}
                    loggedInUserCanWrite={loggedInUserCanWrite}
                    dirtyCount={dirtyCount}
                    handleChangeGrade={handleChangeGrade}
                    handleSubmit={handleSubmit} />

            </section>
        </section>
    )
}

export default SchoolSubjectGradesPage;