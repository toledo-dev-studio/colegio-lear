import { Link } from 'react-router'
import { Pencil, Trash } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import type { Employee } from '@/interfaces/entites/employee';

interface Props {
    data: Employee[];
    isLoading: boolean;
    handleClickEditRow: (item: Employee) => void;
    handleClickDeleteRow: (item: Employee) => void;
}

export const EmployeesTable = ({ data = [], isLoading, handleClickEditRow, handleClickDeleteRow }: Props) => {

    return (
        <>
            <div className="table-container">
                <table className="table">
                    <thead>
                        {/* Columns */}
                        <tr>
                            <th className="column">Nombre completo</th>
                            <th className="column">Correo electrónico</th>
                            <th className="column">Usuario del sitema</th>
                            <th className="column">Puesto de trabajo</th>
                            <th className="column">Rol asignado</th>
                            <th className="column">Estado</th>
                            <th className="column">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Loading */}
                        {
                            isLoading && (
                                <tr>
                                    <td colSpan={7} className="no-content-row">
                                        Cargando información, por favor espere...
                                    </td>
                                </tr>
                            )
                        }

                        {/* No content */}
                        {
                            (!data.length && !isLoading) && (
                                <tr>
                                    <td colSpan={7} className="no-content-row">
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
                                        <Link to={`/employees/${item.id}`}>
                                            <span className="text-primary">
                                                {`${item.name} ${item.firstLastName} ${item.secondLastName}`}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="row">{item.email}</td>
                                    <td className="row">{item.username}</td>
                                    <td className="row">{item.jobTitle?.name}</td>
                                    <td className="row">{item.role?.name}</td>
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
