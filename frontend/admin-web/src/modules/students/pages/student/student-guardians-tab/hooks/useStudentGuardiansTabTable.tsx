import { useOutletContext } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import { STUDENT_GUARDIANS_RELATIONSHIPS } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";
import type { StudentLayoutContext } from "@/modules/students/interfaces/student-layout-context";

interface Options {
    handleClickEdit: (item: StudentGuardianResponse) => void;
    handleClickDelete: (item: StudentGuardianResponse) => void;
}

export const useStudentGuardiansTabTable = ({ handleClickEdit, handleClickDelete }: Options) => {
    // Get context from layout
    const { loggedInUserCanWrite } = useOutletContext<StudentLayoutContext>();

    // Table columns configuration structure
    const columns: string[] = [
        "Nombre completo",
        "Parentesco",
        "No. de teléfono",
        "Correo electrónico",
        "¿Tutor principal?",
        "¿Contacto de emergencia?",
        "¿Autorizado para recoger?",
        "Observaciones",
    ];
    if (loggedInUserCanWrite)
        columns.push("Acciones");

    // Table properties value configuration structure
    const properties: TableProperty<StudentGuardianResponse>[] = [
        {
            key: "fullName",
            render: (item: StudentGuardianResponse) => (
                <span className="text-primary cursor-pointer" onClick={() => loggedInUserCanWrite && handleClickEdit(item)}>
                    {item.fullName ?? "-"}
                </span>
            )
        },
        {
            key: "relationship",
            render: ({ relationship }: StudentGuardianResponse) => (labelOf(STUDENT_GUARDIANS_RELATIONSHIPS, relationship))
        },
        { key: "phoneNumber" },
        { key: "email" },
        {
            key: "isPrincipal",
            render: ({ isPrincipal }: StudentGuardianResponse) => <Badge variant={isPrincipal ? "success" : "destructive"} className="py-4 px-6">{isPrincipal ? "Sí" : "No"}</Badge>
        },
        {
            key: "authorizedToPickUp",
            render: ({ authorizedToPickUp }: StudentGuardianResponse) => <Badge variant={authorizedToPickUp ? "success" : "destructive"} className="py-4 px-6">{authorizedToPickUp ? "Sí" : "No"}</Badge>
        },
        {
            key: "emergencyContact",
            render: ({ emergencyContact }: StudentGuardianResponse) => <Badge variant={emergencyContact ? "success" : "destructive"} className="py-4 px-6">{emergencyContact ? "Sí" : "No"}</Badge>
        },
        { key: "observations" }
    ];

    // Table actions list
    const actions: TableAction<StudentGuardianResponse>[] = !loggedInUserCanWrite ? [] : [
        {
            key: "edit",
            render: (item: StudentGuardianResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-primary text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickEdit(item)}>
                            <Pencil className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar tutor del estudiante</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: StudentGuardianResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar tutor del estudiante</p>
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
