import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/shadcn/ui/input";
import { Textarea } from "@/shared/shadcn/ui/textarea";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { TaskAttachmentsGrid } from "./TaskAttachmentsGrid";
import { toISODay } from "../../../../lib/attendance.lib";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import type { SchoolSubjectTaskRequest } from "@/interfaces/requests/school-subject-task.request";
import type { SchoolSubjectTaskResponse } from "@/interfaces/responses/school-subject-task.response";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";

interface Props {
    taskToEdit: Partial<SchoolSubjectTaskResponse>;
    attachments: AttachmentResponse[];
    loggedInUserCanWrite: boolean;
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
    maxDueDate?: string;
    handleClickCancel: () => void;
    handleClickClose: () => void;
    onChangeAttachments: (
        next:
            | AttachmentResponse[]
            | ((prev: AttachmentResponse[]) => AttachmentResponse[])
    ) => void;
    onSubmit: (taskRequestLike: Partial<SchoolSubjectTaskRequest>) => void;
}

export const SchoolSubjectTaskForm = ({ taskToEdit, attachments, loggedInUserCanWrite, academicCycleSchoolGroupId, schoolSubjectId, maxDueDate, handleClickCancel, handleClickClose, onChangeAttachments, onSubmit }: Props) => {
    // Use react hook form configuration
    const { control, formState: { errors }, handleSubmit } = useForm<Partial<SchoolSubjectTaskRequest>>({
        defaultValues: {
            title: isValidValueWithDefault(taskToEdit?.title, ""),
            description: isValidValueWithDefault(taskToEdit?.description, ""),
            dueDate: isValidValueWithDefault(taskToEdit?.dueDate, ""),
        }
    });

    const today = toISODay(new Date());

    // When today is beyond the academic cycle end date, fall back to the cycle range
    const minDueDate = maxDueDate && today > maxDueDate.slice(0, 10) ? undefined : today;

    return (
        <>
            <SidePanel
                title={taskToEdit?.id ? "EDITAR TAREA" : "REGISTRO DE TAREA"}
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Cancelar", handleClick: handleClickCancel }}
                submitButton={{ show: loggedInUserCanWrite, disabled: false, type: "submit", label: "Guardar", handleClick: handleSubmit(onSubmit) }}>
                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">Título <span className="required">*</span>:</label>
                        <Controller
                            control={control}
                            name="title"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    disabled={!loggedInUserCanWrite}
                                    placeholder="Título de la tarea"
                                />
                            )}
                        />
                        {
                            errors.title && (
                                <p className="error">
                                    El título de la tarea es requerido
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Descripción:</label>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    disabled={!loggedInUserCanWrite}
                                    placeholder="-"
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Fecha límite <span className="required">*</span>:</label>
                        <Controller
                            control={control}
                            name="dueDate"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <DatePicker
                                    value={field.value}
                                    disabled={!loggedInUserCanWrite}
                                    minDate={minDueDate}
                                    maxDate={maxDueDate}
                                    placeholder="Selecciona una fecha"
                                    onChange={field.onChange} />
                            )}
                        />
                        {
                            errors.dueDate && (
                                <p className="error">
                                    La fecha límite de la tarea es requerida
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Archivos adjuntos:</label>
                        {
                            taskToEdit?.id ? (
                                <TaskAttachmentsGrid
                                    taskId={taskToEdit.id}
                                    attachments={attachments}
                                    loggedInUserCanWrite={loggedInUserCanWrite}
                                    academicCycleSchoolGroupId={academicCycleSchoolGroupId}
                                    schoolSubjectId={schoolSubjectId}
                                    onChange={onChangeAttachments} />
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    La carga de archivos se habilitará al guardar la tarea.
                                </p>
                            )
                        }
                    </div>
                </form>

            </SidePanel>
        </>
    )
}

export default SchoolSubjectTaskForm;