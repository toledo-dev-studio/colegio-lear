import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { useSchoolSubjectMaterialsPanel } from "../hooks/useSchoolSubjectMaterialsPanel";
import { SchoolSubjectMaterialsGrid } from "./SchoolSubjectMaterialsGrid";

interface Props {
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
    subjectName: string;
    loggedInUserCanWrite: boolean;
    handleClickClose: () => void;
}

export const SchoolSubjectMaterialsPanel = ({ academicCycleSchoolGroupId, schoolSubjectId, subjectName, loggedInUserCanWrite, handleClickClose }: Props) => {
    // Component hooks & stores
    const {
        materials,
        isLoading,
        isError,
        loggedInUserCanWrite: canWrite,
        handleChangeMaterials,
    } = useSchoolSubjectMaterialsPanel({ academicCycleSchoolGroupId, schoolSubjectId, loggedInUserCanWrite });

    return (
        <SidePanel
            title={`MATERIALES DE APOYO DE ${subjectName.toUpperCase()}`}
            handleClickClose={handleClickClose}
            cancelButton={{ show: true, disabled: false, type: "button", label: "Cerrar", handleClick: handleClickClose }}
            submitButton={{ show: false }}>
            <SchoolSubjectMaterialsGrid
                materials={materials}
                isLoading={isLoading}
                isError={isError}
                loggedInUserCanWrite={canWrite}
                academicCycleSchoolGroupId={academicCycleSchoolGroupId}
                schoolSubjectId={schoolSubjectId}
                onChange={handleChangeMaterials} />
        </SidePanel>
    )
}

export default SchoolSubjectMaterialsPanel;