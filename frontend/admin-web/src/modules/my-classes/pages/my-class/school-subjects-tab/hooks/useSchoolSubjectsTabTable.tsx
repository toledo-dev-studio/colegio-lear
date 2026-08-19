import { ClipboardList, GraduationCap, Paperclip } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";
import { DAY_OF_WEEKS } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { DayOfWeekKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { SchoolSubjectSchedule } from "../interfaces/school-subject-schedule";

const formatTime = (time: string): string => time.slice(0, 5);

const dayLabelOf = (day: DayOfWeekKey): string =>
    DAY_OF_WEEKS.find(item => item.key === day)?.label ?? day;

interface Options {
    handleClickTasks: (item: SchoolSubjectSchedule) => void;
    handleClickMaterials: (item: SchoolSubjectSchedule) => void;
    handleClickGrades: (item: SchoolSubjectSchedule) => void;
}

export const useSchoolSubjectsTabTable = ({ handleClickTasks, handleClickMaterials, handleClickGrades }: Options) => {
    // Table columns configuration structure
    const columns: string[] = [
        "Materia",
        "Días y horarios",
        "Acciones"
    ];

    // Table properties value configuration structure
    const properties: TableProperty<SchoolSubjectSchedule>[] = [
        {
            key: "name",
            render: ({ name }: SchoolSubjectSchedule) => (
                <span className="font-medium">{name}</span>
            )
        },
        {
            key: "sessions",
            render: ({ sessions }: SchoolSubjectSchedule) => (
                <div className="flex flex-wrap gap-2">
                    {
                        sessions.map((session, index) => (
                            <Badge key={index} variant="secondary">
                                {dayLabelOf(session.day)} {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </Badge>
                        ))
                    }
                </div>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<SchoolSubjectSchedule>[] = [
        {
            key: "tasks",
            render: (item: SchoolSubjectSchedule) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-primary text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickTasks(item)}>
                            <ClipboardList className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Registrar tareas</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "materials",
            render: (item: SchoolSubjectSchedule) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-success text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickMaterials(item)}>
                            <Paperclip className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Cargar materiales de apoyo</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "grades",
            render: (item: SchoolSubjectSchedule) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-violet-600 text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickGrades(item)}>
                            <GraduationCap className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Registrar calificaciones</p>
                    </TooltipContent>
                </Tooltip>
            )
        }
    ];

    return {
        columns,
        properties,
        actions
    }
}