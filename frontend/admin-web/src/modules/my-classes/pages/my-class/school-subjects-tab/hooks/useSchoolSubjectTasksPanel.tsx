import { useState } from "react";
import { toast } from "sonner";

import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import { useLoaderStore } from "@/stores/LoaderStore";
import { useGetSchoolSubjectTasks } from "../../../../hooks/useGetSchoolSubjectTasks";
import { useDeleteSchoolSubjectTaskById } from "../../../../hooks/useDeleteSchoolSubjectTaskById";
import { useCreateUpdateSchoolSubjectTask } from "../../../../hooks/useCreateUpdateSchoolSubjectTask";
import type { SchoolSubjectTaskRequest } from "@/interfaces/requests/school-subject-task.request";
import type { SchoolSubjectTaskResponse } from "@/interfaces/responses/school-subject-task.response";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";

interface Options {
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
}

export const useSchoolSubjectTasksPanel = ({ academicCycleSchoolGroupId, schoolSubjectId }: Options) => {
    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Components hooks & stores
    const [taskToEdit, setTaskToEdit] = useState<Partial<SchoolSubjectTaskResponse> | undefined>(undefined);
    const [attachments, setAttachments] = useState<AttachmentResponse[]>([]);
    const [hydratedTaskId, setHydratedTaskId] = useState<string | undefined>(undefined);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<SchoolSubjectTaskResponse>();

    // Hydrate attachments state when the task being edited changes (adjusting state during render)
    const currentTaskId = taskToEdit?.id;
    if (currentTaskId !== hydratedTaskId) {
        setHydratedTaskId(currentTaskId);
        setAttachments(currentTaskId ? (taskToEdit?.attachments ?? []) : []);
    }

    // Queries
    const getSchoolSubjectTasksQuery = useGetSchoolSubjectTasks({ academicCycleSchoolGroupId, schoolSubjectId });

    // Mutations
    const createUpdateTaskMutation = useCreateUpdateSchoolSubjectTask();
    const deleteTaskMutation = useDeleteSchoolSubjectTaskById();

    // Component functions
    const handleClickRegister = () => setTaskToEdit({});

    const handleClickEdit = (item: SchoolSubjectTaskResponse) => setTaskToEdit({ ...item });

    const handleClickCancelForm = () => setTaskToEdit(undefined);

    const handleSubmit = async (taskRequestLike: Partial<SchoolSubjectTaskRequest>) => {
        try {
            showLoading("Guardando tarea...");
            await createUpdateTaskMutation.mutateAsync({
                id: taskToEdit?.id ?? "new",
                academicCycleSchoolGroupId,
                schoolSubjectId,
                taskRequestLike,
            }, {
                onSuccess: (createdTask) => {
                    hideLoading();
                    toast.success("Tarea guardada correctamente", { position: "top-right" });
                    // Stay in the form showing the saved task so attachments can be uploaded
                    setTaskToEdit({ ...createdTask });
                }
            });
        } catch (error) {
            console.warn(error);
            hideLoading();
            toast.error("Ocurrió un error al tratar de guardar la tarea", { position: "top-right" });
        }
    }

    const handleChangeAttachments = (
        next:
            | AttachmentResponse[]
            | ((prev: AttachmentResponse[]) => AttachmentResponse[])
    ) => {
        setAttachments((prev) => (typeof next === "function" ? (next as (prev: AttachmentResponse[]) => AttachmentResponse[])(prev) : next));
    }

    const handleClickConfirmDelete = async () => {
        if (!recordToDelete)
            return;

        try {
            await deleteTaskMutation.mutateAsync({
                id: recordToDelete.id,
                academicCycleSchoolGroupId,
                schoolSubjectId,
            }, {
                onSuccess: () => {
                    toast.success("Tarea eliminada correctamente", { position: "top-right" });
                    closeDeleteModal();
                }
            });
        } catch (error) {
            console.warn(error);
            toast.error("Ocurrió un error al tratar de eliminar la tarea seleccionada", { position: "top-right" });
        }
    }

    return {
        tasks: getSchoolSubjectTasksQuery.data ?? [],
        isLoading: getSchoolSubjectTasksQuery.isLoading,
        isError: getSchoolSubjectTasksQuery.isError,
        taskToEdit,
        attachments,
        isDeleting: deleteTaskMutation.isPending,
        handleClickRegister,
        handleClickEdit,
        handleClickCancelForm,
        handleClickDelete: openDeleteModal,
        handleClickConfirmDelete,
        handleSubmit,
        handleChangeAttachments,
        deleteModal: {
            isOpen: isOpenSingleDeleteModal,
            record: recordToDelete,
            close: closeDeleteModal,
        },
    };
}

export type SchoolSubjectTasksPanelReturn = ReturnType<typeof useSchoolSubjectTasksPanel>;