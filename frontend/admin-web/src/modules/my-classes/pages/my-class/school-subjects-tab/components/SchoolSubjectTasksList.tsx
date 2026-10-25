import { Pencil, Plus, Trash } from "lucide-react";

import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { AttachmentChip } from "./AttachmentChip";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
import type { SchoolSubjectTaskResponse } from "@/interfaces/responses/school-subject-task.response";

interface Props {
    tasks: SchoolSubjectTaskResponse[];
    isLoading: boolean;
    isError: boolean;
    loggedInUserCanWrite: boolean;
    handleClickRegister: () => void;
    handleClickEdit: (item: SchoolSubjectTaskResponse) => void;
    handleClickDelete: (item: SchoolSubjectTaskResponse) => void;
}

export const SchoolSubjectTasksList = ({ tasks = [], isLoading, isError, loggedInUserCanWrite, handleClickRegister, handleClickEdit, handleClickDelete }: Props) => {
    return (
        <div className="flex flex-col gap-5">

            {/* Register task button */}
            {
                loggedInUserCanWrite && (
                    <Button className="w-full" onClick={handleClickRegister}>
                        <Plus aria-hidden="true" />
                        Registrar tarea
                    </Button>
                )
            }

            {/* Loading */}
            {
                isLoading && (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    {/* Title */}
                                    <Skeleton className="h-5 w-3/4" />

                                    {/* Description */}
                                    <div className="mt-2 space-y-1">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>

                                    {/* Due date badge */}
                                    <Skeleton className="mt-2 h-6 w-32 rounded-md" />
                                </div>

                                {/* Actions */}
                                <div className="flex shrink-0 gap-2">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        </div>
                    ))
                )
            }

            {/* No content */}
            {
                (!tasks.length && !isLoading && !isError) && (
                    <p className="text-sm text-muted-foreground">No se encontraron tareas registradas para esta materia.</p>
                )
            }

            {/* Error */}
            {
                isError && (
                    <p className="text-sm text-destructive">No fue posible obtener las tareas de la materia.</p>
                )
            }

            {/* Tasks list */}
            {
                (tasks.length > 0 && !isLoading) && (
                    tasks.map((task) => (
                        <div key={task.id} className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-medium text-foreground truncate">{task.title}</p>
                                    {
                                        task.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                        )
                                    }
                                    {
                                        task.dueDate && (
                                            <Badge variant="warning" className="mt-2">
                                                Entrega: {formatFriendlyDate(task.dueDate)}
                                            </Badge>
                                        )
                                    }
                                    {
                                        (task.attachments && task.attachments.length > 0) && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {
                                                    task.attachments.map((attachment) => (
                                                        <AttachmentChip key={attachment.id} attachment={attachment} />
                                                    ))
                                                }
                                            </div>
                                        )
                                    }
                                </div>

                                {
                                    loggedInUserCanWrite && (
                                        <div className="flex gap-2 shrink-0">
                                            <span className="bg-primary text-white icon-btn icon-btn-sm cursor-pointer"
                                                onClick={() => handleClickEdit(task)}>
                                                <Pencil className="w-4 h-4" />
                                            </span>
                                            <span className="bg-destructive text-white icon-btn icon-btn-sm cursor-pointer"
                                                onClick={() => handleClickDelete(task)}>
                                                <Trash className="w-4 h-4" />
                                            </span>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    ))
                )
            }
        </div>
    )
}

export default SchoolSubjectTasksList;