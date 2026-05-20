import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { JobTitlesTable } from "./components/JobTitlesTable";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteJobTitle } from "../../hooks/useDeleteJobTitle";
import { useExportJobTitles } from "../../hooks/useExportJobTitles";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { useGetPagedJobTitles } from "../../hooks/useGetPagedJobTitles";
import { CustomPagination } from "@/shared/components/CustomPagination";
import type { JobTitle } from "@/interfaces/entites/job-title.interface";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { JobTitlesAdvancedFilters } from "./components/JobTitlesAdvancedFilters";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";

export const JobTitlesPage = () => {
  const navigate = useNavigate();

  const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
  const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
  const [jobTitleToDelete, setJobTitleToDelete] = useState<JobTitle | undefined>(undefined);

  const pagedJobTitlesQuery = useGetPagedJobTitles();
  const deleteJobTitleMutation = useDeleteJobTitle();
  const exportJobTitleMutation = useExportJobTitles();

  const { showLoading, hideLoading } = useLoaderStore();

  const handleClickAdd = () => {
    navigate('/job-titles/new');
  }

  const handleClickExport = async () => {
    showLoading('Descargando información', 'Por favor espere...');

    const data = await exportJobTitleMutation.mutateAsync();

    if (!data || !Array.isArray(data)) {
      hideLoading();
      toast.info('No se cuenta con información para descargar', { position: "top-right" });
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
    await deleteJobTitleMutation.mutateAsync({ id: jobTitleToDelete?.id! },
      {
        onSuccess: () => {
          toast.success('Puesto de trabajo eliminado correctamente', { position: "top-right" });
          setJobTitleToDelete(undefined);
          setIsOpenSingleDeleteModal(false);
        },
        onError: (error) => {
          console.warn(error);
          toast.error('Ocurrio un error al tratar de eliminar el puesto de trabajo', { position: "top-right" });
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
            disabledExport={exportJobTitleMutation.isPending}
          />

          {/* Table content*/}
          <JobTitlesTable
            jobTitles={pagedJobTitlesQuery.data?.data ?? []}
            isLoading={pagedJobTitlesQuery.isLoading}
            handleClickEditRow={handleClickEditRow}
            handleClickDeleteRow={handleClickDeleteRow}
          />

          {/* Pagination top element */}
          {
            (!pagedJobTitlesQuery.isLoading && pagedJobTitlesQuery.data?.data.length) && (
              <div className="flex items-center justify-center my-8">
                <CustomPagination totalPages={pagedJobTitlesQuery.data?.totalPages ?? 0} />
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
                isLoading={deleteJobTitleMutation.isPending}
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
