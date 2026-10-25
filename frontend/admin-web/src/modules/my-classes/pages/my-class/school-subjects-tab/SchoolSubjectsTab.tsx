import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";

import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { useSchoolSubjectsTab } from "./hooks/useSchoolSubjectsTab";
import { useSchoolSubjectsTabTable } from "./hooks/useSchoolSubjectsTabTable";
import { SchoolSubjectsTable } from "./components/SchoolSubjectsTable";
import { SchoolSubjectTasksPanel } from "./components/SchoolSubjectTasksPanel";
import { SchoolSubjectMaterialsPanel } from "./components/SchoolSubjectMaterialsPanel";
import type { MyClassLayoutContext } from "../../../interfaces/my-class-layout-context";
import type { SchoolSubjectSchedule } from "./interfaces/school-subject-schedule";

export const SchoolSubjectsTab = () => {
    // Component hooks & stores
    const { myClassId, academicCycleId, academicCycle, loggedInUserCanWrite } = useOutletContext<MyClassLayoutContext>();
    const navigate = useNavigate();

    const {
        schoolSubjects,
        isLoading,
        isError,
    } = useSchoolSubjectsTab({
        academicCycleId,
        schoolGroupId: myClassId,
    });

    // Panels state
    const [isOpenTasksPanel, setIsOpenTasksPanel] = useState<boolean>(false);
    const [isOpenMaterialsPanel, setIsOpenMaterialsPanel] = useState<boolean>(false);
    const [subjectToManage, setSubjectToManage] = useState<SchoolSubjectSchedule | undefined>(undefined);

    // Table hook configuration
    const { columns, properties, actions } = useSchoolSubjectsTabTable({
        handleClickTasks: (item) => {
            setSubjectToManage(item);
            setIsOpenTasksPanel(true);
        },
        handleClickMaterials: (item) => {
            setSubjectToManage(item);
            setIsOpenMaterialsPanel(true);
        },
        handleClickGrades: (item) => {
            navigate(`/my-classes/${myClassId}/school-subjects/${item.schoolSubjectId}/grades`);
        }
    });

    return (
        <section className="flex flex-col gap-y-6">

            {/* Section title */}
            <SectionTitle
                title="MATERIAS ASIGNADAS"
                description="El siguiente listado contiene las materias asignadas al docente según el calendario escolar del grupo seleccionado, con sus respectivos días y horarios de clase." />

            {/* Assigned subjects table */}
            <SchoolSubjectsTable
                data={schoolSubjects}
                isLoading={isLoading}
                isError={isError}
                columns={columns}
                properties={properties}
                actions={actions} />

            {/* Tasks panel */}
            {
                (isOpenTasksPanel && subjectToManage) && (
                    <SchoolSubjectTasksPanel
                        academicCycleSchoolGroupId={myClassId}
                        schoolSubjectId={subjectToManage.schoolSubjectId}
                        subjectName={subjectToManage.name}
                        loggedInUserCanWrite={loggedInUserCanWrite}
                        maxDueDate={academicCycle?.endDate}
                        handleClickClose={() => setIsOpenTasksPanel(false)} />
                )
            }

            {/* Materials panel */}
            {
                (isOpenMaterialsPanel && subjectToManage) && (
                    <SchoolSubjectMaterialsPanel
                        academicCycleSchoolGroupId={myClassId}
                        schoolSubjectId={subjectToManage.schoolSubjectId}
                        subjectName={subjectToManage.name}
                        loggedInUserCanWrite={loggedInUserCanWrite}
                        handleClickClose={() => setIsOpenMaterialsPanel(false)} />
                )
            }
        </section>
    )
}

export default SchoolSubjectsTab;