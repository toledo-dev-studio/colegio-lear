import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { useAcademicCycleSchoolGroupsTab } from "./hooks/useAcademicCycleSchoolGroupsTab";
import { useAcademicCycleSchoolGroupsTable } from "./hooks/useAcademicCycleSchoolGroupsTable";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";

export const AcademicCycleSchoolGroupsTab = () => {
    // Context hooks & stores configuration
    const { context, queries, mutations, deleteModal } = useAcademicCycleSchoolGroupsTab();

    // Componet hooks and stores
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    // Table hook configuration
    const { columns, properties, actions } = useAcademicCycleSchoolGroupsTable({
        handleClickEdit: ({ id }: AcademicCycleSchoolGroupResponse) => navigate(id),
        handleClickDelete: deleteModal.open
    });

    // Filtering data using memo
    const schoolGroups = useMemo(() => {
        const data = queries.schoolGroups.get.data ?? [];

        if (!searchQuery.trim())
            return data;

        const query = searchQuery.toLowerCase();

        return data.filter(item =>
            item.name?.toLowerCase().includes(query)
        );
    }, [queries.schoolGroups.get.data, searchQuery]);

    // Component functions
    const handleClickConfirmDeleteSchoolGroup = async () => {
        if (!deleteModal.record)
            return;
        await mutations.schoolGroups.delete.mutateAsync({ id: deleteModal.record.id, academicCycleId: context.academicCycleId! },
            {
                onSuccess: () => {
                    toast.success("El grupo escolar se eliminó correctamente del ciclo escolar", { position: "top-right" });
                    deleteModal.close();
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el ciclo escolar", { position: "top-right" });
                }
            }
        )
    }

    if (queries.schoolGroups.get.isError) {
        toast.error("No fue posible obtener información de los grupos escolares de este ciclo escolar", { position: "top-right" });
    }

    return (
        <>
            {/* School groups table section */}
            <section className="flex flex-col gap-y-6">
                <SectionTitle
                    title="LISTADO DE GRUPOS ESCOLARES PARA EL CICLO ESCOLAR"
                    description="El siguiente listado contiene la información de los grupos escolares que estarán disponibles para los alumnos que sean inscritos a este ciclo escolar." />
                <TableRibbon
                    className="mb-0"
                    filterButton={{ show: false }}
                    exportButton={{ show: false }}
                    addButton={{
                        show: !context.isLocked,
                        label: "Crear nuevo grupo",
                        disabled: queries.schoolGroups.get.isLoading || queries.schoolGroups.get.isError,
                        handleClick: () => navigate("new")
                    }}
                    searchInput={{
                        show: true,
                        disabled: queries.schoolGroups.get.isLoading || queries.schoolGroups.get.isError,
                        placeholder: "Búsqueda general por nombre",
                        tooltip: "Búsqueda general por nombre",
                        onKeyDown: () => { },
                        onChange: (event) => setSearchQuery(event.target.value || ""),
                        onClickClear: () => setSearchQuery("")
                    }}
                />
                <Table
                    data={schoolGroups}
                    isLoading={queries.schoolGroups.get.isLoading}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                />
            </section>

            {/* Delete single record modal */}
            {
                (!context.isLocked && deleteModal.record) && (
                    <Modal
                        open={deleteModal.isOpen}
                        type="delete"
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.name}?`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.schoolGroups.delete.isPending}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => deleteModal.close()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDeleteSchoolGroup
                        }}
                    />
                )
            }
        </>
    )
}
