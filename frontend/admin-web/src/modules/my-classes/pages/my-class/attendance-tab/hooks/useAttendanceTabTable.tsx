import { cn } from "@/lib/extensions/utils";
import { Input } from "@/shared/shadcn/ui/input";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Switch } from "@/shared/shadcn/ui/switch";
import type { AssistStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import type { AttendanceRecord } from "./useAttendanceTab";

interface Options {
    records: Record<string, AttendanceRecord>;
    savedSnapshot: Record<string, AttendanceRecord>;
    loggedInUserCanWrite: boolean;
    onStatusChange: (enrollmentId: string, status: AssistStatusKey) => void;
    onReasonChange: (enrollmentId: string, absenceReason: string) => void;
}

export const useAttendanceTabTable = ({ records, savedSnapshot, loggedInUserCanWrite, onStatusChange, onReasonChange }: Options) => {
    // Table columns configuration structure
    const columns: string[] = [
        "Estudiante",
        "Asistió",
        "Justificación",
        "Estado",
    ];

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleEnrollmentResponse>[] = [
        {
            key: "student",
            render: ({ student }: AcademicCycleEnrollmentResponse) => {
                const fullName = student ? [student.name, student.firstLastName, student.secondLastName].filter(Boolean).join(" ") : "-";
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{fullName}</span>
                        {student && (
                            <span className="text-xs text-muted-foreground">{student.enrollment}</span>
                        )}
                    </div>
                )
            }
        },
        {
            key: "assisted",
            render: ({ id }: AcademicCycleEnrollmentResponse) => {
                const record = records[id] ?? { status: "present" as AssistStatusKey, absenceReason: "" };
                const isPresent = record.status === "present";
                return (
                    <div className="flex items-center gap-x-3">
                        <Switch
                            disabled={!loggedInUserCanWrite}
                            checked={isPresent}
                            onCheckedChange={(checked: boolean) => onStatusChange(id, checked ? "present" : "absent")} />
                        <span className={cn("text-sm", isPresent ? "text-success" : "text-destructive")}>
                            {isPresent ? "Asistió" : "No asistió"}
                        </span>
                    </div>
                )
            }
        },
        {
            key: "absenceReason",
            render: ({ id }: AcademicCycleEnrollmentResponse) => {
                const record = records[id] ?? { status: "present" as AssistStatusKey, absenceReason: "" };
                return (
                    <Input
                        disabled={!loggedInUserCanWrite || record.status === "present"}
                        placeholder="Motivo de la falta"
                        value={record.absenceReason}
                        onChange={(event) => onReasonChange(id, event.target.value)} />
                )
            }
        },
        {
            key: "savedState",
            render: ({ id }: AcademicCycleEnrollmentResponse) => {
                const record = records[id];
                const saved = savedSnapshot[id];
                const isPending = !saved ||
                    saved.status !== record?.status ||
                    (saved.absenceReason ?? "") !== (record?.absenceReason ?? "");
                return (
                    <Badge variant={isPending ? "warning" : "success"} className="py-1 px-3">
                        {isPending ? "Pendiente" : "Guardado"}
                    </Badge>
                )
            }
        }
    ];

    return {
        columns,
        properties
    }
}