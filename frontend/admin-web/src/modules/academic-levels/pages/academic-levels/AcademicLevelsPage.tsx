import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner"

import { CustomPageTitle } from "@/shared/components/CustomPageTitle"
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon"
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { usePagedAcademicLevels } from "../../hooks/usePagedAcademicLevels";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { AcademicLevelsTable } from "./components/AcademicLevelsTable";
import { useDeleteAcademicLevel } from "../../hooks/useDeleteAcademicLevel";
import { useExportAcademicLevels } from "../../hooks/useExportAcademicLevels";
import { downloadDataToCsvFile } from "@/lib/utils";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { AcademicLevelsAdvancedFilters } from "./components/AcademicLevelsAdvancedFilters";

export const AcademicLevelsPage = () => {

  const navigate = useNavigate();

  const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
  const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
  const [academicLevelToDelete, setAcademicLevelToDelete] = useState<AcademicLevel | undefined>(undefined);

  const { deleteAcademicLevel } = useDeleteAcademicLevel();
  const { isLoading, data: { data: academicLevels = [], totalPages = 0 } = {} } = usePagedAcademicLevels();
  const { isFetching: isFetchingDataToExport, refetch: refetchDataToExport } = useExportAcademicLevels();

  const { showLoading, hideLoading } = useLoaderStore();

  const handleClickAdd = () => {
    navigate('/academic-levels/new');
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

    downloadDataToCsvFile('Niveles académicos', headers, data);

    setTimeout(() => hideLoading(), 500);
  }

  const handleClickAdvancedFilters = () => {
    setIsOpenAdvancedFiltersPanel(true);
  }

  const handleClickEditRow = (academicLevel: AcademicLevel) => {
    navigate(`/academic-levels/${academicLevel.id}`);
  }

  const handleClickDeleteRow = (academicLevel: AcademicLevel) => {
    setAcademicLevelToDelete(academicLevel);
    setIsOpenSingleDeleteModal(true);
  }

  const handleClickCancelDelteAcademicLevel = () => {
    setAcademicLevelToDelete(undefined);
    setIsOpenSingleDeleteModal(false);
  }

  const handleClickDelteAcademicLevel = async () => {
    await deleteAcademicLevel.mutateAsync(
      { id: academicLevelToDelete?.id ?? undefined },
      {
        onSuccess: () => {
          toast.success('Nivel académico eliminado correctamente');
          setAcademicLevelToDelete(undefined);
          setIsOpenSingleDeleteModal(false);
        },
        onError: (error) => {
          console.warn(error);
          toast.error('Ocurrio un error al tratar de eliminar el nivel académico');
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

        <CustomPageTitle title="Niveles académicos" subtitle="Gestiona los niveles académicos disponibles en la organización" />

        <div className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <CustomTableListRibbon
            handleClickAdvancedFilters={handleClickAdvancedFilters}
            handleClickAdd={handleClickAdd}
            handleClickExport={handleClickExport}
            disabledExport={isFetchingDataToExport}
          />

          {/* Table content*/}
          <AcademicLevelsTable
            academicLevels={academicLevels ?? []}
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

          <CustomDeleteModal
            open={isOpenSingleDeleteModal}
            title={`¿Estas seguro de eliminar el registro ${academicLevelToDelete?.name}`}
            message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
            isLoading={deleteAcademicLevel.isPending}
            handleClickConfirm={handleClickDelteAcademicLevel}
            handleClickCancel={handleClickCancelDelteAcademicLevel}
          />

          {
            isOpenAdvancedFiltersPanel && (
              <AcademicLevelsAdvancedFilters
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
