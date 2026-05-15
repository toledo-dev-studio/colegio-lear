import { Link } from 'react-router'
import { Pencil, Trash } from 'lucide-react'

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import type { Announcement } from '@/interfaces/entites/announcement';
import { formatFriendlyDate } from '@/lib/utils';

interface Props {
    data: Announcement[];
    isLoading: boolean;
    handleClickEditRow: (item: Announcement) => void;
    handleClickDeleteRow: (item: Announcement) => void;
}

export const AnnouncementsTable = ({ data = [], isLoading, handleClickEditRow, handleClickDeleteRow }: Props) => {

    return (
        <>
            <div className="table-container">
                <table className="table">
                    <thead>
                        {/* Columns */}
                        <tr>
                            <th className="column">Nombre & descripción</th>
                            <th className="column">Público objetivo</th>
                            <th className="column text-nowrap">Fecha de públicación</th>
                            <th className="column text-nowrap">Fecha de expiración</th>
                            <th className="column">Estado</th>
                            <th className="column">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Loading */}
                        {
                            isLoading && (
                                <tr>
                                    <td colSpan={6} className="no-content-row">
                                        Cargando información, por favor espere...
                                    </td>
                                </tr>
                            )
                        }

                        {/* No content */}
                        {
                            (!data.length && !isLoading) && (
                                <tr>
                                    <td colSpan={6} className="no-content-row">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            )
                        }


                        {/* Content */}
                        {
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                    {/* Row data */}
                                    <td className="row">
                                        <Link to={`/announcements/${item.id}`}>
                                            <span className="text-primary">
                                                {item.name}
                                            </span>
                                            <div className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</div>
                                        </Link>
                                    </td>
                                    <td className="row !min-w-fit">
                                        {
                                            !item.audience?.length
                                                ? (<span>-</span>)
                                                :
                                                (
                                                    <div className="flex items-center gap-x-4">
                                                        {
                                                            item.audience?.length && item.audience.map((audience) => (
                                                                <span key={audience.key} className="text-nowrap min-w-fit rounded-full bg-gray-400/20 px-4 py-2 text-xs font-medium text-gray-500 inset-ring inset-ring-gray-400/40 dark:text-gray-300">
                                                                    {audience.label}
                                                                </span>
                                                            ))
                                                        }
                                                    </div>
                                                )
                                        }
                                    </td>
                                    <td className="row text-nowrap">
                                        {formatFriendlyDate(item.publishedAt)}
                                    </td>
                                    <td className="row text-nowrap">
                                        {formatFriendlyDate(item.expiresAt)}
                                    </td>
                                    <td className="row">
                                        <Badge variant={item.status ? "success" : "destructive"} className="py-4 px-6">
                                            {
                                                item.status ? 'Activo' : 'Inactivo'
                                            }
                                        </Badge>
                                    </td>
                                    <td className="row">
                                        <div className="flex flex-row gap-4">
                                            <Button
                                                aria-label="Editar"
                                                className="icon-btn-sm bg-primary text-primary-foreground hover:bg-primary/90"
                                                onClick={() => handleClickEditRow(item)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                aria-label="Eliminar"
                                                className="icon-btn-sm bg-destructive text-primary-foreground hover:bg-destructive/90"
                                                onClick={() => handleClickDeleteRow(item)}>
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }

                    </tbody>
                </table>
            </div>
        </>
    )
}
