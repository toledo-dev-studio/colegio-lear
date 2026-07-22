import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { AUDIENCE_TYPES } from "@/lib/key-value-pairs/key-value-pair-catalogs";

interface Options {
    handleClickDelete: (item: AnnouncementResponse) => void;
}

export const useAnnouncementsPageTable = ({ handleClickDelete }: Options) => {
    // Table columns configuration structure
    const columns: string[] = [
        "Nombre & descripción",
        "Público objetivo",
        "Fecha de públicación",
        "Fecha de expiración",
        "¿Registro activo?",
        "Acciones",
    ];

    // Table properties value configuration structure
    const properties: TableProperty<AnnouncementResponse>[] = [
        {
            key: "name",
            render: ({ id, name, description }: AnnouncementResponse) => (
                <Link to={`/announcements/${id}`}>
                    <span className="text-primary">
                        {name}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{description}</div>
                </Link>
            )
        },
        {
            key: "audience",
            render: ({ audience }: AnnouncementResponse) => (
                !audience?.length ?
                    (<span>-</span>) :
                    (
                        <div className="flex items-center gap-x-4">
                            {
                                audience?.length && audience.map((item) => (
                                    <span key={item} className="text-nowrap min-w-fit rounded-full bg-gray-400/20 px-4 py-2 text-xs font-medium text-gray-500 inset-ring inset-ring-gray-400/40 dark:text-gray-300">
                                        {labelOf(AUDIENCE_TYPES, item)}
                                    </span>
                                ))
                            }
                        </div>
                    )
            )
        },
        {
            key: "publishedAt",
            render: ({ publishedAt }: AnnouncementResponse) => (formatFriendlyDate(publishedAt))
        },
        {
            key: "expiresAt",
            render: ({ expiresAt }: AnnouncementResponse) => (formatFriendlyDate(expiresAt))
        },
        {
            key: "isActive",
            render: ({ isActive }: AnnouncementResponse) => (
                <Badge variant={isActive ? "success" : "destructive"} className="py-4 px-6">
                    {
                        isActive ? "Activo" : "Inactivo"
                    }
                </Badge>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<AnnouncementResponse>[] = [
        {
            key: "edit",
            render: ({ id }: AnnouncementResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/announcements/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar campaña</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: AnnouncementResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar campaña</p>
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
