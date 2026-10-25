import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";
import { ANNOUNCEMENTS_STATUSES, AUDIENCE_TYPES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";

interface Options {
    handleClickDelete: (item: AnnouncementResponse) => void;
}

export const useAnnouncementsPageTable = ({ handleClickDelete }: Options) => {
    // Check permissions
    const canDelete = usePermission("announcements", "can-delete");

    // Table columns configuration structure
    const columns: string[] = [
        "Nombre & descripción",
        "Estatus de la campaña",
        "Fecha de públicación",
        "Fecha de expiración",
        "Público objetivo",
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
            key: "status",
            render: ({ status }: AnnouncementResponse) => (
                <Badge variant={
                    status === "draft" ? "default" : 
                    status === "in-progress" ? "success" : 
                    status === "cancelled" ? "destructive": "secondary"} className="py-4 px-6">
                    { labelOf(ANNOUNCEMENTS_STATUSES, status) || "-" }
                </Badge>
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
            key: "audience",
            render: ({ id, audience }: AnnouncementResponse) => (
                !audience?.length ?
                    (<span>-</span>) :
                    (
                        <div className="flex items-center gap-x-4">
                            {
                                audience?.length && audience.map((item, index) => (
                                    <span key={`${id}-${index}`} className="text-nowrap min-w-fit rounded-full bg-gray-400/20 px-4 py-2 text-xs font-medium text-gray-500 inset-ring inset-ring-gray-400/40 dark:text-gray-300">
                                        {labelOf(AUDIENCE_TYPES, item)}
                                    </span>
                                ))
                            }
                        </div>
                    )
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
                canDelete &&
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
