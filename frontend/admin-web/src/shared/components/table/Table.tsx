import { generateTemporalId } from "@/lib/extensions/utils";
import type { TableProperty } from "./interfaces/table-property";
import type { TableAction } from "./interfaces/table-action";
import { CustomPagination } from "../CustomPagination";
import { getNestedValue } from "@/lib/extensions/objects";

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
                                        Cargando información, por favor espere...
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
                                                        property.render ? property.render(item) : (<span>{getNestedValue(item, property.key)}</span>)
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
            </div>

            {/* Pagination */}
            {
                (enablePagination && !isLoading && data.length > 0) && (
                    <div className="flex items-center justify-center my-8">
                        <CustomPagination totalPages={totalPages ?? 1} />
                    </div>
                )
            }
        </>
    )
}
