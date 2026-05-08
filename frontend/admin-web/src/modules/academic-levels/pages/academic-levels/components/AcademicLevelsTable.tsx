import { Link } from 'react-router'
import { Pencil, Trash } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import type { AcademicLevel } from '@/interfaces/entites/academic-level'

interface Props {
    academicLevels: AcademicLevel[];
    isLoading: boolean;
    handleClickEditRow: (academicLevel: AcademicLevel) => void;
    handleClickDeleteRow: (academicLevel: AcademicLevel) => void;
}

export const AcademicLevelsTable = ({ academicLevels = [], isLoading, handleClickEditRow, handleClickDeleteRow }: Props) => {

    return (
        <>
            <div className="table-container">
                <table className="table">
                    <thead>
                        {/* Columns */}
                        <tr>
                            {/* 
                            <th className="column checkbox-column">
                                <Checkbox
                                    id="select-all-checkbox"
                                    name="select-all-checkbox"
                                />
                            </th>
                            */}
                            <th className="column">Nombre</th>
                            <th className="column">Descripción</th>
                            <th className="column">Estado</th>
                            <th className="column">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Loading */}
                        {
                            isLoading && (
                                <tr>
                                    <td colSpan={4} className="no-content-row">
                                        Cargando información, por favor espere...
                                    </td>
                                </tr>
                            )
                        }

                        {/* No content */}
                        {
                            (!academicLevels.length && !isLoading) && (
                                <tr>
                                    <td colSpan={4} className="no-content-row">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            )
                        }


                        {/* Content */}
                        {
                            academicLevels.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/40 transition-colors">

                                    {/* Checkbox */}
                                    {/* 
                                    <td className="row">
                                        <Checkbox
                                            id={item.id}
                                            name={item.name}
                                            onCheckedChange={(selected) => handleToggleSelection(item, selected)}
                                        />
                                    </td> 
                                    */}

                                    {/* Row data */}
                                    <td className="row">
                                        <Link to={`/academic-levels/${item.id}`}>
                                            <span className="text-primary">
                                                {item.name}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="row">{item.description}</td>
                                    <td className="row">
                                        <Badge variant={item.status ? "default" : "destructive"} className="py-4 px-6">
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
