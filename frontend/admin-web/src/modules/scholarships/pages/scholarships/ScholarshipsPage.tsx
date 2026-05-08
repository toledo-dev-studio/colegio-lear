import type { Scholarship } from "@/interfaces/entites/scholarship";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle"
import { useState } from "react";
import { useDeleteScholarship } from "../../hooks/useDeleteScholarships";
import { useNavigate } from "react-router";
import { usePagedScholarships } from "../../hooks/usePagedScholarships";
import { useExportScholarships } from "../../hooks/useExportScholarships";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { toast } from "sonner";
import { downloadDataToCsvFile } from "@/lib/utils";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { ScholarshipsTable } from "./components/ScholarshipsTable";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";
import { ScholarshipsAdvancedFilters } from "./components/ScholarshipsAdvancedFilters";

export const ScholarshipsPage = () => {

    const navigate = useNavigate();

    const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const [scholarshipToDelete, setScholarshipToDelete] = useState<Scholarship | undefined>(undefined);

    const { deleteScholarship } = useDeleteScholarship();
    const { isLoading, data: { data: scholarships = [], totalPages = 0 } = {} } = usePagedScholarships();
    const { isFetching: isFetchingDataToExport, refetch: refetchDataToExport } = useExportScholarships();

    const { showLoading, hideLoading } = useLoaderStore();

    const handleClickAdd = () => {
        navigate('/scholarships/new');
    }

    const handleClickExport = async () => {
        showLoading('Descargando información', 'Por favor espere...');

        const { data } = await refetchDataToExport();

        if (!data || !Array.isArray(data)) {
            hideLoading();
            toast.info('No se cuenta con información para descargar');
            return;
        }

        const headers = [
            { label: 'Id', key: 'id' },
            { label: 'Nombre', key: 'name' },
            { label: 'Descripción', key: 'description' },
            { label: 'Porcentaje de descuento', key: 'discountPercentage' },
            { label: 'Estado', key: 'status' }
        ];

        downloadDataToCsvFile('Becas escolares', headers, data);

        setTimeout(() => hideLoading(), 500);
    }

    const handleClickAdvancedFilters = () => {
        setIsOpenAdvancedFiltersPanel(true);
    }

    const handleClickEditRow = (scholarship: Scholarship) => {
        navigate(`/scholarships/${scholarship.id}`);
    }

    const handleClickDeleteRow = (scholarship: Scholarship) => {
        setScholarshipToDelete(scholarship);
        setIsOpenSingleDeleteModal(true);
    }

    const handleClickCancelDelteScholarship = () => {
        setScholarshipToDelete(undefined);
        setIsOpenSingleDeleteModal(false);
    }

    const handleClickDelteScholarship = async () => {
        await deleteScholarship.mutateAsync(
            { id: scholarshipToDelete?.id ?? undefined },
            {
                onSuccess: () => {
                    toast.success('Beca escolar eliminada correctamente');
                    setScholarshipToDelete(undefined);
                    setIsOpenSingleDeleteModal(false);
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error('Ocurrio un error al tratar de eliminar la beca escolar');
                }
            }
        );
    }

    const handleClickCloseAdvancedFiltersPanel = () => {
        setIsOpenAdvancedFiltersPanel(false);
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">

                <CustomPageTitle title="Becas escolares" subtitle="Gestiona las becas escolares que estarán disponibles en el colegio" />

                <div className="flex flex-col gap-8 mt-14">

                    {/* Table ribbon options */}
                    <CustomTableListRibbon
                        handleClickAdvancedFilters={handleClickAdvancedFilters}
                        handleClickAdd={handleClickAdd}
                        handleClickExport={handleClickExport}
                        disabledExport={isFetchingDataToExport}
                    />

                    {/* Table content*/}
                    <ScholarshipsTable
                        data={scholarships ?? []}
                        isLoading={isLoading}
                        handleClickEditRow={handleClickEditRow}
                        handleClickDeleteRow={handleClickDeleteRow}
                    />

                    {/* Pagination top element */}
                    {
                        (!isLoading && scholarships.length > 0) && (
                            <div className="flex items-center justify-center my-8">
                                <CustomPagination totalPages={totalPages} />
                            </div>
                        )
                    }

                    <CustomDeleteModal
                        open={isOpenSingleDeleteModal}
                        title={`¿Estas seguro de eliminar el registro ${scholarshipToDelete?.name}`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={deleteScholarship.isPending}
                        handleClickConfirm={handleClickDelteScholarship}
                        handleClickCancel={handleClickCancelDelteScholarship}
                    />

                    {
                        isOpenAdvancedFiltersPanel && (
                            <ScholarshipsAdvancedFilters
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



