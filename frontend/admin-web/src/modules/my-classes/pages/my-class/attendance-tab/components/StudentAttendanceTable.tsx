import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { getNestedValue } from "@/lib/extensions/objects";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Props {
    data: AcademicCycleEnrollmentResponse[];
    isLoading: boolean;
    isError: boolean;
    columns: string[];
    properties: TableProperty<AcademicCycleEnrollmentResponse>[];
}

export const StudentAttendanceTable = ({ data = [], isLoading, isError, columns, properties }: Props) => {
    return (
        <>
            <section className="table-container">
                <table className="table">
                    <thead>
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
                                Array.from({ length: 5 }).map((_, rowIndex) => (
                                    <tr key={`skeleton-row-${rowIndex}`}>
                                        {
                                            properties.map((property) => (
                                                <td key={property.key} className="row">
                                                    <Skeleton className="h-5 w-full rounded-md" />
                                                </td>
                                            ))
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
                                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                        {
                                            properties.map((property) => (
                                                <td key={property.key} className="row">
                                                    {
                                                        property.render ? property.render(item) : (<span>{getNestedValue(item, property.key) || "-"}</span>)
                                                    }
                                                </td>
                                            ))
                                        }
                                    </tr>
                                ))
                            )
                        }
                    </tbody>
                </table>
            </section>

            {/* Registered students info */}
            {
                !isLoading && data.length > 0 && (
                    <div className="flex flex-col items-center justify-center md:flex-row md:justify-between gap-6">
                        <p className="text-sm text-muted-foreground">Viendo {data.length} registro(s)</p>
                    </div>
                )
            }

            {isError && (
                <p className="mt-4 text-sm text-destructive">No fue posible obtener los estudiantes del grupo escolar.</p>
            )}
        </>
    )
}

export default StudentAttendanceTable;