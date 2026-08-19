import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { getNestedValue } from "@/lib/extensions/objects";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { SchoolSubjectSchedule } from "../interfaces/school-subject-schedule";

interface Props {
    data: SchoolSubjectSchedule[];
    isLoading: boolean;
    isError: boolean;
    columns: string[];
    properties: TableProperty<SchoolSubjectSchedule>[];
    actions: TableAction<SchoolSubjectSchedule>[];
}

export const SchoolSubjectsTable = ({ data = [], isLoading, isError, columns, properties, actions = [] }: Props) => {
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
                                        No se encontraron materias asignadas para este grupo escolar.
                                    </td>
                                </tr>
                            )
                        }

                        {/* Content */}
                        {
                            (data.length > 0 && !isLoading) && (
                                data.map((item) => (
                                    <tr key={item.schoolSubjectId} className="hover:bg-muted/40 transition-colors">
                                        {
                                            properties.map((property) => (
                                                <td key={property.key} className="row">
                                                    {
                                                        property.render ? property.render(item) : (<span>{getNestedValue(item, property.key) || "-"}</span>)
                                                    }
                                                </td>
                                            ))
                                        }

                                        {
                                            actions.length > 0 && (
                                                <td className="row">
                                                    <div className="flex gap-2">
                                                        {
                                                            actions.map((action) => (
                                                                <span key={action.key}>
                                                                    {action.render(item)}
                                                                </span>
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

            {/* Assigned subjects info */}
            {
                !isLoading && data.length > 0 && (
                    <div className="flex flex-col items-center justify-center md:flex-row md:justify-between gap-6">
                        <p className="text-sm text-muted-foreground">Viendo {data.length} materia(s) asignada(s)</p>
                    </div>
                )
            }

            {isError && (
                <p className="mt-4 text-sm text-destructive">No fue posible obtener las materias del grupo escolar.</p>
            )}
        </>
    )
}

export default SchoolSubjectsTable;