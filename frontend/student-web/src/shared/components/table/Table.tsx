import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { getNestedValue } from "@/lib/extensions/objects";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { TableAction } from "./interfaces/table-action";
import type { TableProperty } from "./interfaces/table-property";
import { TablePagination } from "../table-pagination/TablePagination";

interface Props<T extends Record<string, any>> {
    data: T[];
    isLoading: boolean;
    enablePagination: boolean;
    skeletonRows?: number;
    totalPages?: number;
    columns: string[];
    properties: TableProperty<T>[];
    actions: TableAction<T>[];
}

export const Table = <T extends Record<string, any>>({ data = [], isLoading, enablePagination = false, skeletonRows = 10, totalPages, columns, properties, actions = [] }: Props<T>) => {
    return (
        <>
            <section className="table-container">

                <table className="table">
                    <thead>
                        {/* Columns */}
                        <tr>
                            {
                                columns.map((column, index) => (
                                    <th key={index} className="column">
                                        {column}
                                    </th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {/* Loading */}
                        {
                            isLoading && (
                                Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                                    <tr key={`skeleton-row-${rowIndex}`}>
                                        {
                                            properties.map((property) => (
                                                <td key={property.key} className="row">
                                                    <Skeleton className="h-5 w-full rounded-md" />
                                                </td>
                                            ))
                                        }

                                        {
                                            actions.length > 0 && (
                                                <td className="row">
                                                    <div className="flex gap-2">
                                                        {
                                                            actions.map((action) => (
                                                                <Skeleton
                                                                    key={action.key}
                                                                    className="h-8 w-8 rounded-full"
                                                                />
                                                            ))
                                                        }
                                                    </div>
                                                </td>
                                            )
                                        }
                                    </tr>
                                ))
                            )
                        }

                        {/* No content */}
                        {
                            (!data.length && !isLoading) && (
                                <tr>
                                    <td colSpan={columns.length} className="no-content-row">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            )
                        }

                        {/* Content */}
                        {
                            (data.length > 0 && !isLoading) && (
                                data.map((item) => (
                                    <tr key={generateTemporalId()} className="hover:bg-muted/40 transition-colors">
                                        {/* Row data */}
                                        {
                                            properties.map((property) => (
                                                <td key={property.key} className="row">
                                                    {
                                                        property.render ? property.render(item) : (<span>{getNestedValue(item, property.key) || "-"}</span>)
                                                    }
                                                </td>
                                            ))
                                        }

                                        {/* Actions */}
                                        {
                                            (actions && actions.length > 0) && (
                                                <td className="row">
                                                    <div className="flex flex-row gap-4">
                                                        {
                                                            actions.map((action) => (
                                                                <div key={action.key} >
                                                                    {action.render(item)}
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </td>
                                            )
                                        }
                                    </tr>
                                ))
                            )
                        }
                    </tbody>
                </table>
            </section>

            {/* Table pages info */}
            {
                !isLoading && data.length > 0 && (
                    <div className="flex flex-col items-center justify-center md:flex-row md:justify-between gap-6">
                        <p className="text-sm text-muted-foreground">Viendo {data.length} registro(s)</p>
                        {enablePagination && <p className="text-sm text-muted-foreground">Total de páginas: {totalPages}</p>}
                    </div>
                )
            }

            {/* Pagination */}
            {
                (enablePagination && !isLoading && data.length > 0) && (
                    <div className="w-full flex items-center justify-center">
                        <TablePagination totalPages={totalPages ?? 1} />
                    </div>
                )
            }
        </>
    )
}
