// Card de una tarea de materia: nombre, descripción, estado según fecha de
// entrega, fecha de entrega y material de apoyo descargable

import { CalendarClock } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import type { SchoolSubjectTaskResponse } from "@/interfaces/responses/school-subject-task.response";
import { formatTaskDueDate, getTaskDueDateStatus, labelOfTaskDueDateStatus, type TaskDueDateStatusKey } from "@/modules/subjects/lib/subjects.lib";
import { TaskAttachments } from "../task-attachments/TaskAttachments";

const statusBadgeVariant: Record<TaskDueDateStatusKey, React.ComponentProps<typeof Badge>["variant"]> = {
    upcoming: "default",
    near: "warning",
    overdue: "destructive",
};

interface Props {
    task: SchoolSubjectTaskResponse;
}

export const TaskCard = ({ task }: Props) => {
    const status = getTaskDueDateStatus(task.dueDate);

    return (
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:p-5">
            <header className="flex items-start justify-between gap-3">
                <h4 className="font-heading font-bold text-sm text-foreground min-w-0">{task.title}</h4>
                <Badge variant={statusBadgeVariant[status]} className="shrink-0">
                    {labelOfTaskDueDateStatus(status)}
                </Badge>
            </header>

            {
                task.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {task.description}
                    </p>
                )
            }

            <footer className="flex flex-col gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                        Fecha de entrega:{" "}
                        <span className="font-medium text-foreground">{formatTaskDueDate(task.dueDate)}</span>
                    </span>
                </div>

                <TaskAttachments attachments={task.attachments} />
            </footer>
        </article>
    );
}
