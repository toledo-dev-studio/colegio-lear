import { Link } from 'react-router'
import { Pencil, Trash } from 'lucide-react'

import { Badge } from '@/shared/ui/badge';
import { formatMoney } from '@/lib/extensions/formatters';
import { Button } from '@/shared/ui/button';
import type { PaymentConcept } from '@/interfaces/entites/payment-concept';

interface Props {
    data: PaymentConcept[];
    isLoading: boolean;
    handleClickEditRow: (item: PaymentConcept) => void;
    handleClickDeleteRow: (item: PaymentConcept) => void;
}

export const PaymentConceptsTable = ({ data = [], isLoading, handleClickEditRow, handleClickDeleteRow }: Props) => {

    return (
        <>
            <div className="table-container">
                <table className="table">
                    <thead>
                        {/* Columns */}
                        <tr>
                            <th className="column">Nombre & descripción</th>
                            <th className="column">Monto (MXN)</th>
                            <th className="column">¿Condonación?</th>
                            <th className="column">Estado</th>
                            <th className="column">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Loading */}
                        {
                            isLoading && (
                                <tr>
                                    <td colSpan={5} className="no-content-row">
                                        Cargando información, por favor espere...
                                    </td>
                                </tr>
                            )
                        }

                        {/* No content */}
                        {
                            (!data.length && !isLoading) && (
                                <tr>
                                    <td colSpan={5} className="no-content-row">
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
                                        <Link to={`/payment-concepts/${item.id}`}>
                                            <span className="text-primary">
                                                {item.name}
                                            </span>
                                            <div className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</div>
                                        </Link>
                                    </td>
                                    <td className="row">
                                        {formatMoney(item.amount)}
                                    </td>
                                    <td className="row">
                                        <Badge variant={item.allowForgiveness ? "success" : "destructive"} className="py-4 px-6">
                                            {
                                                item.allowForgiveness ? 'Permitido' : 'No permitido'
                                            }
                                        </Badge>
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
