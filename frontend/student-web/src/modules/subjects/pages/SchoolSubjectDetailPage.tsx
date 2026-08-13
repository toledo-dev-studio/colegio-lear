// Página de detalle de una materia: datos generales de la materia (nombre,
// descripción, docente y horario), su material de apoyo y sus tareas

import { Link, useParams } from "react-router";
import { ArrowLeft, BookOpen, ClipboardList, FolderOpen, Info } from "lucide-react";

import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { ModulePageTitle } from "@/shared/components/module-page-title/ModulePageTitle";
import { CardHeader } from "@/shared/components/card-header/CardHeader";
import { TeacherAvatar } from "@/shared/components/teacher-avatar/TeacherAvatar";
import { Button } from "@/shared/shadcn/ui/button";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { DAY_OF_WEEKS } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { useSubjectsPage } from "../hooks/useSubjectsPage";
import { useGetSchoolSubjectTasks } from "../hooks/useGetSchoolSubjectTasks";
import { useGetSchoolSubjectMaterials } from "../hooks/useGetSchoolSubjectMaterials";
import { TasksSection } from "../components/school-subject-detail/tasks-section/TasksSection";
import { MaterialsSection } from "../components/school-subject-detail/materials-section/MaterialsSection";
import { SchoolSubjectDetailSkeleton } from "../components/school-subject-detail/school-subject-detail-skeleton/SchoolSubjectDetailSkeleton";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

const getTeacherFullName = (teacher: EmployeeResponse): string =>
    `${teacher.name} ${teacher.firstLastName}${teacher.secondLastName ? ` ${teacher.secondLastName}` : ""}`;

export const SchoolSubjectDetailPage = () => {
    const { academicCycleSchoolSubjectId } = useParams<{ academicCycleSchoolSubjectId: string }>();

    const { context, queries, schoolSubjects } = useSubjectsPage();
    const isLoading = queries.schoolSubjectsQuery.isLoading || queries.calendarsQuery.isLoading;

    const subject = schoolSubjects.find(
        (item) => item.academicCycleSchoolSubjectId === academicCycleSchoolSubjectId,
    );

    const academicCycleId = context.academicCycle?.id ?? "";
    const academicCycleSchoolGroupId = context.enrollment?.academicCycleSchoolGroupId ?? "";

    const tasksQuery = useGetSchoolSubjectTasks({
        academicCycleId,
        academicCycleSchoolGroupId,
        academicCycleSchoolSubjectId: subject?.academicCycleSchoolSubjectId ?? "",
    });

    const materialsQuery = useGetSchoolSubjectMaterials({
        academicCycleId,
        academicCycleSchoolGroupId,
        academicCycleSchoolSubjectId: subject?.academicCycleSchoolSubjectId ?? "",
    });

    return (
        <>
            <section className="page-main-section">

                {/* Breadcrumb */}
                <Breadcrumb
                    items={[
                        { label: "Materias escolares", to: "/subjects" },
                        { label: subject?.schoolSubject.name ?? "Materia" },
                    ]}
                />

                {
                    isLoading ? (
                        <SchoolSubjectDetailSkeleton />
                    ) : !subject ? (
                        <section className="card">
                            <CardHeader
                                icon={BookOpen}
                                title="Materia no encontrada"
                                description="La materia seleccionada no forma parte de tu grupo en el ciclo escolar seleccionado."
                                tone="rose"
                            />
                            <section className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-200/40 rounded-md px-4 py-3 mt-4">
                                <Info className="w-4 h-4 shrink-0" />
                                <p>Es posible que el registro haya cambiado o que el enlace no sea válido.</p>
                            </section>
                            <section className="mt-4">
                                <Button variant="outline" size="sm" render={<Link to="/subjects" />}>
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver a materias
                                </Button>
                            </section>
                        </section>
                    ) : (
                        <>
                            {/* Page title */}
                            <ModulePageTitle
                                icon={BookOpen}
                                badge="Detalle de materia"
                                title={`Detalle de materia: ${subject.schoolSubject.name}`}
                                description={`Descripción: ${subject.schoolSubject.description}`}
                                cycle={context.academicCycle}
                            />

                            {/* General data */}
                            <section className="card">
                                <CardHeader
                                    icon={BookOpen}
                                    title="Datos generales"
                                    description="Información general de la materia, el docente a cargo y su horario semanal."
                                    tone="amber"
                                />

                                <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                                    <section className="flex items-center gap-3">
                                        <TeacherAvatar teacher={subject.teacher} className="w-12 h-12" />
                                        <section className="min-w-0">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Docente</p>
                                            <p className="text-sm font-medium text-foreground truncate">{getTeacherFullName(subject.teacher)}</p>
                                        </section>
                                    </section>

                                    <section className="flex flex-col gap-1.5 min-w-0">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Horario semanal</p>
                                        {
                                            subject.schedule.length > 0 ? (
                                                <ul className="flex flex-wrap gap-1.5">
                                                    {subject.schedule.map((item, index) => (
                                                        <li key={index} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                                            {labelOf(DAY_OF_WEEKS, item.day)} {item.startTime}–{item.endTime}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">Sin horario registrado.</p>
                                            )
                                        }
                                    </section>
                                </section>
                            </section>

                            {/* Support materials */}
                            <section className="card">
                                <CardHeader
                                    icon={FolderOpen}
                                    title="Material de apoyo"
                                    description="Archivos de apoyo de la materia para descargar."
                                    tone="sky"
                                />

                                <section className="pt-4">
                                    <MaterialsSection
                                        materials={materialsQuery.data}
                                        isLoading={materialsQuery.isLoading}
                                    />
                                </section>
                            </section>

                            {/* Tasks */}
                            <section className="card">
                                <CardHeader
                                    icon={ClipboardList}
                                    title="Tareas"
                                    description="Tareas de la materia con su fecha de entrega y material de apoyo."
                                />

                                <section className="pt-4">
                                    <TasksSection
                                        tasks={tasksQuery.data}
                                        isLoading={tasksQuery.isLoading}
                                        hasNextPage={tasksQuery.hasNextPage}
                                        isFetchingNextPage={tasksQuery.isFetchingNextPage}
                                        onLoadMore={() => tasksQuery.fetchNextPage()}
                                    />
                                </section>
                            </section>
                        </>
                    )
                }

            </section>
        </>
    )
}
