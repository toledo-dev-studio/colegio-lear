import { Input } from "@/shared/shadcn/ui/input";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Switch } from "@/shared/shadcn/ui/switch";
import type { AssistStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import type { AttendanceRecord } from "./useAttendanceTab";
import { Link } from "react-router";

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
                    <Link to={`/students/${student?.id}`}>
                        <div className="flex flex-col text-primary">
                            <span className="font-medium">{fullName}</span>
                            {student && (
                                <span className="text-xs text-muted-foreground">{student.enrollment}</span>
                            )}
                        </div>
                    </Link>
                )
            }
        },
        {
            key: "assisted",
            render: ({ id }: AcademicCycleEnrollmentResponse) => {
                const record = records[id] ?? { status: "present" as AssistStatusKey, absenceReason: "" };
                const isPresent = record.status === "present";
                return (
                    <div className="flex flex-col gap-x-3">
                        <Switch
                            disabled={!loggedInUserCanWrite}
                            checked={isPresent}
                            onCheckedChange={(checked: boolean) => onStatusChange(id, checked ? "present" : "absent")} />
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
                        {isPending ? "Pendiente de guardar" : "Guardado"}
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