import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner"

import { CustomPageTitle } from "@/shared/components/CustomPageTitle"
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon"
import type { JobTitle } from "@/interfaces/entites/job-title.interface";
import { usePagedJobTitles } from "../../hooks/usePagedJobTitles";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { JobTitlesTable } from "./components/JobTitlesTable";
import { useDeleteJobTitle } from "../../hooks/useDeleteJobTitle";
import { useExportJobTitles } from "../../hooks/useExportJobTitles";
import { JobTitlesAdvancedFilters } from "./components/JobTitlesAdvancedFilters";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { useLoaderStore } from "@/shared/stores/LoaderStore";

export const JobTitlesPage = () => {

  const navigate = useNavigate();

  const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
  const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
  const [jobTitleToDelete, setJobTitleToDelete] = useState<JobTitle | undefined>(undefined);

  const { deleteJobTitle } = useDeleteJobTitle();
  const { isLoading, data: { data: jobTitles = [], totalPages = 0 } = {} } = usePagedJobTitles();
  const { isFetching: isFetchingDataToExport, refetch: refetchDataToExport } = useExportJobTitles();

  const { showLoading, hideLoading } = useLoaderStore();

  const handleClickAdd = () => {
    navigate('/job-titles/new');
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
      { label: 'Estado', key: 'status' }
    ];

    downloadDataToCsvFile('Puestos de trabajo', headers, data);

    setTimeout(() => hideLoading(), 500);
  }

  const handleClickAdvancedFilters = () => {
    setIsOpenAdvancedFiltersPanel(true);
  }

  const handleClickEditRow = (jobTitle: JobTitle) => {
    navigate(`/job-titles/${jobTitle.id}`);
  }

  const handleClickDeleteRow = (jobTitle: JobTitle) => {
    setJobTitleToDelete(jobTitle);
    setIsOpenSingleDeleteModal(true);
  }

  const handleClickCancelDelteJobTitle = () => {
    setJobTitleToDelete(undefined);
    setIsOpenSingleDeleteModal(false);
  }

  const handleClickDelteJobTitle = async () => {
    await deleteJobTitle.mutateAsync(
      { id: jobTitleToDelete?.id ?? undefined },
      {
        onSuccess: () => {
          toast.success('Puesto de trabajo eliminado correctamente');
          setJobTitleToDelete(undefined);
          setIsOpenSingleDeleteModal(false);
        },
        onError: (error) => {
          console.warn(error);
          toast.error('Ocurrio un error al tratar de eliminar el puesto de trabajo');
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

        <CustomPageTitle title="Puestos de trabajo" subtitle="Gestiona los puestos de trabajo disponibles en la organización" />

        <div className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <CustomTableListRibbon
            handleClickAdvancedFilters={handleClickAdvancedFilters}
            handleClickAdd={handleClickAdd}
            handleClickExport={handleClickExport}
            disabledExport={isFetchingDataToExport}
          />

          {/* Table content*/}
          <JobTitlesTable
            jobTitles={jobTitles ?? []}
            isLoading={isLoading}
            handleClickEditRow={handleClickEditRow}
            handleClickDeleteRow={handleClickDeleteRow}
          />

          {/* Pagination top element */}
          {
            !isLoading && (
              <div className="flex items-center justify-center my-8">
                <CustomPagination totalPages={totalPages} />
              </div>
            )
          }

          {/* Delete single record modal */}
          {
            jobTitleToDelete && (
              <CustomDeleteModal
                open={isOpenSingleDeleteModal}
                title={`¿Estas seguro de eliminar el registro ${jobTitleToDelete?.name}`}
                message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                isLoading={deleteJobTitle.isPending}
                handleClickConfirm={handleClickDelteJobTitle}
                handleClickCancel={handleClickCancelDelteJobTitle}
              />
            )
          }

          {/* Advanced filters panel */}
          {
            isOpenAdvancedFiltersPanel && (
              <JobTitlesAdvancedFilters
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
