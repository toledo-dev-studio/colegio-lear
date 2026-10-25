import { Modal } from "@/shared/components/modal/Modal";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { useSchoolSubjectTasksPanel } from "../hooks/useSchoolSubjectTasksPanel";
import { SchoolSubjectTasksList } from "./SchoolSubjectTasksList";
import { SchoolSubjectTaskForm } from "./SchoolSubjectTaskForm";

interface Props {
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
    subjectName: string;
    loggedInUserCanWrite: boolean;
    maxDueDate?: string;
    handleClickClose: () => void;
}

export const SchoolSubjectTasksPanel = ({ academicCycleSchoolGroupId, schoolSubjectId, subjectName, loggedInUserCanWrite, maxDueDate, handleClickClose }: Props) => {
    // Component hooks & stores
    const {
        tasks,
        isLoading,
        isError,
        taskToEdit,
        attachments,
        isDeleting,
        handleClickRegister,
        handleClickEdit,
        handleClickCancelForm,
        handleClickDelete,
        handleClickConfirmDelete,
        handleSubmit,
        handleChangeAttachments,
        deleteModal,
    } = useSchoolSubjectTasksPanel({ academicCycleSchoolGroupId, schoolSubjectId });

    return (
        <>
            {
                taskToEdit === undefined ? (
                    <SidePanel
                        title={`TAREAS DE ${subjectName.toUpperCase()}`}
                        handleClickClose={handleClickClose}
                        cancelButton={{ show: true, disabled: false, type: "button", label: "Cerrar", handleClick: handleClickClose }}
                        submitButton={{ show: false }}>
                        <SchoolSubjectTasksList
                            tasks={tasks}
                            isLoading={isLoading}
                            isError={isError}
                            loggedInUserCanWrite={loggedInUserCanWrite}
                            handleClickRegister={handleClickRegister}
                            handleClickEdit={handleClickEdit}
                            handleClickDelete={handleClickDelete} />
                    </SidePanel>
                ) : (
                    <SchoolSubjectTaskForm
                        taskToEdit={taskToEdit}
                        attachments={attachments}
                        loggedInUserCanWrite={loggedInUserCanWrite}
                        academicCycleSchoolGroupId={academicCycleSchoolGroupId}
                        schoolSubjectId={schoolSubjectId}
                        maxDueDate={maxDueDate}
                        handleClickCancel={handleClickCancelForm}
                        handleClickClose={handleClickClose}
                        onChangeAttachments={handleChangeAttachments}
                        onSubmit={handleSubmit} />
                )
            }

            {/* Delete single task modal */}
            {
                (deleteModal.isOpen && deleteModal.record) && (
                    <Modal
                        open={deleteModal.isOpen}
                        type="delete"
                        title={`¿Estas seguro de eliminar la tarea "${deleteModal.record.title}"?`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrá recuperarlo"}
                        isLoading={isDeleting}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => deleteModal.close()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDelete
                        }}
                    />
                )
            }
        </>
    )
}

export default SchoolSubjectTasksPanel;