import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { useStudentsPage } from "./hooks/useStudentsPage";
import { downloadDataToCsvFile, type CsvHeader } from "@/lib/extensions/csv";
import { useStudentsPageTable } from "./hooks/useStudentsPageTable";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { StudentsAdvancedFilters } from "./components/StudentsAdvancedFilters";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import type { StudentResponse } from "@/interfaces/responses/student.response";

export const StudentsPage = () => {
    // Component hooks & stores
    const navigate = useNavigate();
    const canWrite = usePermission("students", "can-write");
    const { loader, advancedFilters, deleteModal, queries, mutations } = useStudentsPage();
    const { columns, properties, actions } = useStudentsPageTable({ handleClickDelete: deleteModal.open });

    // Component functions
    const handleClickExport = async () => {
        loader.show("Descargando información", "Por favor espere...");

        const data = await mutations.students.export.mutateAsync();

        if (!data || !Array.isArray(data)) {
            loader.hide();
            toast.info("No se cuenta con información para descargar", { position: "top-right" });
            return;
        }

        const headers: CsvHeader<StudentResponse>[] = [
            { label: "Identificador", key: "id" },
            { label: "Nombre", key: "name" },
            { label: "Apellido Paterno", key: "firstLastName" },
            { label: "Apellido Materno", key: "secondLastName" },
            { label: "Matricula", key: "enrollment" },
            { label: "Fecha de nacimiento", key: "dateOfBirth" },
            { label: "Tipo de sangre", key: "bloodType" },
            { label: "Curp", key: "curp" },
            { label: "Email", key: "email" },
            { label: "Teléfono", key: "phoneNumber" },
            { label: "¿Registro activo?", key: "isActive", render: (item) => item.isActive ? "Activo" : "Inactivo" },
        ];

        downloadDataToCsvFile("Estudiantes", headers, data);

        setTimeout(() => loader.hide(), 500);
    }

    const handleClickConfirmDeleteStudent = async () => {
        if (!deleteModal.record)
            return;

        await mutations.students.delete.mutateAsync({ id: deleteModal.record?.id! },
            {
                onSuccess: () => {
                    toast.success("Estudiante eliminado correctamente", { position: "top-right" });
                    deleteModal.close();
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el estudiante", { position: "top-right" });
                }
            }
        );
    }

    return (
        <>
            <section className="page-main-section">

                <Breadcrumb items={[
                    { label: "Seguimiento escolar" },
                    { label: "Estudiantes", to: "/students" }
                ]} />

                <PageTitle title="Estudiantes" subtitle="Gestiona la información de los estudiantes y sus datos académicos" />

                {/* Table ribbon options */}
                <TableRibbon
                    addButton={{ show: canWrite, handleClick: () => navigate("/students/new") }}
                    filterButton={{ handleClick: advancedFilters.open }}
                    exportButton={{ handleClick: handleClickExport }}
                    searchInput={{ tooltip: "Búsqueda general por nombre, matrícula & email", placeholder: "Búsqueda general por nombre, matrícula & email" }}
                />

                {/* Table content*/}
                <Table
                    data={queries.students.paged.data}
                    isLoading={queries.students.paged.isFetching}
                    enablePagination={true}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                    totalPages={queries.students.paged.totalPages}
                />

                {/* Delete single record modal */}
                {
                    (deleteModal.isOpen && deleteModal.record) && (
                        <Modal
                            open={deleteModal.isOpen}
                            type="delete"
                            title={`¿Estas seguro de eliminar el registro "${deleteModal.record.enrollment}"?`}
                            message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                            isLoading={mutations.students.delete.isPending}
                            cancelButton={{
                                label: "Cancelar",
                                onClick: () => deleteModal.close()
                            }}
                            confirmButton={{
                                label: "Sí, eliminar",
                                onClick: handleClickConfirmDeleteStudent
                            }}
                        />
                    )
                }

                {/* Advanced filters panel */}
                {
                    advancedFilters.isOpen && (
                        <StudentsAdvancedFilters
                            open={advancedFilters.isOpen}
                            title="Filtros avanzados"
                            handleClickClose={advancedFilters.close}
                        />
                    )
                }

            </section>
        </>
    )
}
