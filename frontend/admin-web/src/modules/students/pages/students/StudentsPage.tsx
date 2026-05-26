import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { StudentsTable } from "./components/StudentsTable";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import type { Student } from "@/interfaces/entites/student";
import { useGetPagedStudents } from "../../hooks/students/useGetPagedStudents";
import { useDeleteStudent } from "../../hooks/students/useDeleteStudent";
import { useExportStudents } from "../../hooks/students/useExportStudents";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { StudentsAdvancedFilters } from "./components/StudentsAdvancedFilters";

export const StudentsPage = () => {
      const navigate = useNavigate();

    const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | undefined>(undefined);

    const pagedStudentsQuery = useGetPagedStudents();
    const deleteStudentMutation = useDeleteStudent();
    const exportStudentsMutation = useExportStudents();

    const { showLoading, hideLoading } = useLoaderStore();

    const handleClickAdvancedFilters = () => {
        setIsOpenAdvancedFiltersPanel(true);
    }

    const handleClickCloseAdvancedFiltersPanel = () => {
        setIsOpenAdvancedFiltersPanel(false);
    }

    const handleClickExport = async () => {
        showLoading("Descargando información", "Por favor espere...");

        const data = await exportStudentsMutation.mutateAsync();

        if (!data || !Array.isArray(data)) {
            hideLoading();
            toast.info("No se cuenta con información para descargar", { position: "top-right" });
            return;
        }

        const headers = [
            { label: "Id", key: "id" },
            { label: "Nombre", key: "name" },
            { label: "Apellido Paterno", key: "firstLastName" },
            { label: "Apellido Materno", key: "secondLastName" },
            { label: "Matricula", key: "enrollment" },
            { label: "Email", key: "email" },
            { label: "Teléfono", key: "phoneNumber" },
            { label: "Estado", key: "status" }
        ];

        downloadDataToCsvFile("Estudiantes", headers, data);

        setTimeout(() => hideLoading(), 500);
    }

    const handleClickAdd = () => {
        navigate("/students/new");
    }

    const handleClickEditRow = (item: Student) => {
        navigate(`/students/${item.id}`);
    }

    const handleClickDeleteRow = (item: Student) => {
        setStudentToDelete(item);
        setIsOpenSingleDeleteModal(true);
    }

    const handleClickDelete = async () => {
        await deleteStudentMutation.mutateAsync({ id: studentToDelete?.id! },
            {
                onSuccess: () => {
                    toast.success("Estudiante eliminado correctamente", { position: "top-right" });
                    setStudentToDelete(undefined);
                    setIsOpenSingleDeleteModal(false);
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el estudiante", { position: "top-right" });
                }
            }
        );
    }

    const handleClickCancelDelete = () => {
        setStudentToDelete(undefined);
        setIsOpenSingleDeleteModal(false);
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">

                <div className="mb-10">
                    <CustomBreadcrumb items={[
                        { label: "Seguimiento escolar" },
                        { label: "Estudiantes", to: "/students" }
                    ]} />
                </div>

                <CustomPageTitle title="Estudiantes" subtitle="Gestiona la información de los estudiantes y sus datos académicos" />

                <div className="flex flex-col gap-8 mt-14">

                    {/* Table ribbon options */}
                    <CustomTableListRibbon
                        handleClickAdvancedFilters={handleClickAdvancedFilters}
                        handleClickAdd={handleClickAdd}
                        handleClickExport={handleClickExport}
                        disabledExport={exportStudentsMutation.isPending}
                    />

                    {/* Table content*/}
                    <StudentsTable
                        data={pagedStudentsQuery.data}
                        isLoading={pagedStudentsQuery.isFetching}
                        handleClickEditRow={handleClickEditRow}
                        handleClickDeleteRow={handleClickDeleteRow}
                    />

                    {/* Pagination top element */}
                    {
                        (!pagedStudentsQuery.isFetching && pagedStudentsQuery.itemsCount > 0) && (
                            <div className="flex items-center justify-center my-8">
                                <CustomPagination totalPages={pagedStudentsQuery.totalPages} />
                            </div>
                        )
                    }

                    {/* Delete single record modal */}
                    {
                        studentToDelete && (
                            <CustomDeleteModal
                                open={isOpenSingleDeleteModal}
                                title={`¿Estas seguro de eliminar el registro ${studentToDelete?.name}`}
                                message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                                isLoading={deleteStudentMutation.isPending}
                                handleClickConfirm={handleClickDelete}
                                handleClickCancel={handleClickCancelDelete}
                            />
                        )
                    }

                    {/* Advanced filters panel */}
                    {
                        isOpenAdvancedFiltersPanel && (
                            <StudentsAdvancedFilters
                                open={isOpenAdvancedFiltersPanel}
                                title="Filtros avanzados"
                                handleClickClose={handleClickCloseAdvancedFiltersPanel}
                            />
                        )
                    }

                </div>
            </div>
        </>
    )
}
