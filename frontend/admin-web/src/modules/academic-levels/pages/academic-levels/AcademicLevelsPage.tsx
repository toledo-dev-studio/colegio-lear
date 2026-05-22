import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { AcademicLevelsTable } from "./components/AcademicLevelsTable";
import { CustomPagination } from "@/shared/components/CustomPagination";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { useDeleteAcademicLevel } from "../../hooks/useDeleteAcademicLevel";
import { useExportAcademicLevels } from "../../hooks/useExportAcademicLevels";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";
import { useGetPagedAcademicLevels } from "../../hooks/useGetPagedAcademicLevels";
import { AcademicLevelsAdvancedFilters } from "./components/AcademicLevelsAdvancedFilters";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";

export const AcademicLevelsPage = () => {

  const navigate = useNavigate();

  const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
  const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
  const [academicLevelToDelete, setAcademicLevelToDelete] = useState<AcademicLevel | undefined>(undefined);

  const pagedAcademicLevelsQuery = useGetPagedAcademicLevels();
  const deleteAcademicLevelMutation = useDeleteAcademicLevel();
  const exportAcademicLevelsMutation = useExportAcademicLevels();

  const { showLoading, hideLoading } = useLoaderStore();

  const handleClickAdd = () => {
    navigate("/academic-levels/new");
  }

  const handleClickExport = async () => {
    showLoading("Descargando información", "Por favor espere...");

    const data = await exportAcademicLevelsMutation.mutateAsync();

    if (!data || !Array.isArray(data)) {
      hideLoading();
      toast.info("No se cuenta con información para descargar", { position: "top-right" });
      return;
    }

    const headers = [
      { label: "Id", key: "id" },
      { label: "Nombre", key: "name" },
      { label: "Descripción", key: "description" },
      { label: "Estado", key: "status" }
    ];

    downloadDataToCsvFile("Niveles académicos", headers, data);

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
    await deleteAcademicLevelMutation.mutateAsync({ id: academicLevelToDelete?.id! },
      {
        onSuccess: () => {
          toast.success("Nivel académico eliminado correctamente", { position: "top-right" });
          setAcademicLevelToDelete(undefined);
          setIsOpenSingleDeleteModal(false);
        },
        onError: (error) => {
          console.warn(error);
          toast.error("Ocurrio un error al tratar de eliminar el nivel académico", { position: "top-right" });
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

        <div className="mb-10">
          <CustomBreadcrumb items={[
            { label: "Configuración escolar" },
            { label: "Niveles académicos", to: "/academic-levels" },
          ]} />
        </div>

        <CustomPageTitle title="Niveles académicos" subtitle="Gestiona los niveles académicos disponibles en la organización" />

        <div className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <CustomTableListRibbon
            handleClickAdvancedFilters={handleClickAdvancedFilters}
            handleClickAdd={handleClickAdd}
            handleClickExport={handleClickExport}
            disabledExport={exportAcademicLevelsMutation.isPending}
          />

          {/* Table content*/}
          <AcademicLevelsTable
            data={pagedAcademicLevelsQuery.data}
            isLoading={pagedAcademicLevelsQuery.isFetching}
            handleClickEditRow={handleClickEditRow}
            handleClickDeleteRow={handleClickDeleteRow}
          />

          {/* Pagination top element */}
          {
            (!pagedAcademicLevelsQuery.isFetching && pagedAcademicLevelsQuery.itemsCount > 0) && (
              <div className="flex items-center justify-center my-8">
                <CustomPagination totalPages={pagedAcademicLevelsQuery.totalPages} />
              </div>
            )
          }

          <CustomDeleteModal
            open={isOpenSingleDeleteModal}
            title={`¿Estas seguro de eliminar el registro ${academicLevelToDelete?.name}`}
            message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
            isLoading={deleteAcademicLevelMutation.isPending}
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
