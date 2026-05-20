import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { ScholarshipsTable } from "./components/ScholarshipsTable";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle"
import { CustomPagination } from "@/shared/components/CustomPagination";
import { useDeleteScholarship } from "../../hooks/useDeleteScholarships";
import { useExportScholarships } from "../../hooks/useExportScholarships";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { useGetPagedScholarships } from "../../hooks/useGetPagedScholarships";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";
import { ScholarshipsAdvancedFilters } from "./components/ScholarshipsAdvancedFilters";

export const ScholarshipsPage = () => {
    const navigate = useNavigate();

    const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const [scholarshipToDelete, setScholarshipToDelete] = useState<Scholarship | undefined>(undefined);

    const pagedScholarshipsQuery = useGetPagedScholarships();
    const deleteScholarshipMutation = useDeleteScholarship();
    const exportScholarshipsMutation = useExportScholarships();

    const { showLoading, hideLoading } = useLoaderStore();

    const handleClickAdd = () => {
        navigate('/scholarships/new');
    }

    const handleClickExport = async () => {
        showLoading('Descargando información', 'Por favor espere...');

        const data = await exportScholarshipsMutation.mutateAsync();

        if (!data || !Array.isArray(data)) {
            hideLoading();
            toast.info('No se cuenta con información para descargar', { position: "top-right" });
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
        await deleteScholarshipMutation.mutateAsync({ id: scholarshipToDelete?.id! },
            {
                onSuccess: () => {
                    toast.success('Beca escolar eliminada correctamente', { position: "top-right" });
                    setScholarshipToDelete(undefined);
                    setIsOpenSingleDeleteModal(false);
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error('Ocurrio un error al tratar de eliminar la beca escolar', { position: "top-right" });
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
                        disabledExport={exportScholarshipsMutation.isPending}
                    />

                    {/* Table content*/}
                    <ScholarshipsTable
                        data={pagedScholarshipsQuery.data?.data ?? []}
                        isLoading={pagedScholarshipsQuery.isLoading}
                        handleClickEditRow={handleClickEditRow}
                        handleClickDeleteRow={handleClickDeleteRow}
                    />

                    {/* Pagination top element */}
                    {
                        (!pagedScholarshipsQuery.isLoading && pagedScholarshipsQuery.data?.data.length) && (
                            <div className="flex items-center justify-center my-8">
                                <CustomPagination totalPages={pagedScholarshipsQuery.data.totalPages} />
                            </div>
                        )
                    }

                    <CustomDeleteModal
                        open={isOpenSingleDeleteModal}
                        title={`¿Estas seguro de eliminar el registro ${scholarshipToDelete?.name}`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={deleteScholarshipMutation.isPending}
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



