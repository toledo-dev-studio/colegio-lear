import { generateTemporalId } from "@/lib/extensions/utils";
import type { TableProperty } from "./interfaces/table-property";
import type { TableAction } from "./interfaces/table-action";
import { CustomPagination } from "../CustomPagination";
import { getNestedValue } from "@/lib/extensions/objects";
import { Loader } from "../loader/Loader";

interface Props<T extends Record<string, any>> {
    data: T[];
    isLoading: boolean;
    enablePagination: boolean;
    totalPages?: number;
    columns: string[];
    properties: TableProperty<T>[];
    actions: TableAction<T>[];
}

export const Table = <T extends Record<string, any>>({ data = [], isLoading, enablePagination = false, totalPages, columns, properties, actions = [] }: Props<T>) => {
    return (
        <>
            <section className="flex flex-col gap-6">

                {/* Table container */}
                <div className="table-container">
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
                                    <tr>
                                        <td colSpan={columns.length} className="no-content-row">
                                            <Loader title="Cargando información" subtitle="por favor espere..." fullScreen={false} size="sm" />
                                        </td>
                                    </tr>
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

                    {
                        !isLoading && data.length > 0 && (
                            <div className="flex flex-col items-center justify-center md:flex-row md:justify-between">
                                <p className="text-sm text-muted-foreground mt-6">Viendo {data.length} registro(s)</p>
                                { enablePagination && <p className="text-sm text-muted-foreground mt-6">Total de páginas: {totalPages}</p> }
                            </div>
                        )
                    }
                </div>

                {/* Pagination */}
                {
                    (enablePagination && !isLoading && data.length > 0) && (
                        <div className="flex items-center justify-center mb-8">
                            <CustomPagination totalPages={totalPages ?? 1} />
                        </div>
                    )
                }
            </section>
        </>
    )
}
