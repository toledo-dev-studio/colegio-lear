import { Badge } from "@/shared/shadcn/ui/badge";
import { Table } from "@/shared/components/table/Table";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { ASSIST_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
import type { StudentAssistResponse } from "@/interfaces/responses/student-assist.response";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";

interface Props {
    assists: StudentAssistResponse[];
    isLoading: boolean;
    totalPages: number;
}

const columns: string[] = [
    "Día de asistencia",
    "Asistió",
    "Razón de ausencia",
];

const properties: TableProperty<StudentAssistResponse>[] = [
    {
        key: "assistDate",
        render: (item) => (
            <span className="font-medium">{formatFriendlyDate(item.assistDate)}</span>
        ),
    },
    {
        key: "status",
        render: (item) => (
            <Badge variant={item.status === "present" ? "success" : "destructive"} className="py-4 px-6">
                {labelOf(ASSIST_STATUSES, item.status)}
            </Badge>
        ),
    },
    {
        key: "absenceReason",
        render: (item) => (
            <span>{item.status === "absent" ? (item.absenceReason ?? "-") : "-"}</span>
        ),
    },
];

export const AssistsTable = ({ assists, isLoading, totalPages }: Props) => {
    return (
        <>
            <Table<StudentAssistResponse>
                data={assists}
                isLoading={isLoading}
                enablePagination
                skeletonRows={8}
                totalPages={totalPages}
                columns={columns}
                properties={properties}
                actions={[]}
            />
        </>
    )
}
