import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner"

import { downloadDataToCsvFile } from "@/lib/utils";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { usePagedAnnouncements } from "../../hooks/usePagedAnnouncements";
import { useExportAnnouncements } from "../../hooks/useExportAnnouncements";
import { AnnouncementsTable } from "./components/AnnouncementsTable";
import type { Announcement } from "@/interfaces/entites/announcement";
import { useDeleteAnnouncement } from "../../hooks/useDeleteAnnouncement";
import { AnnouncementsAdvancedFilters } from "./components/AnnouncementsAdvancedFilters";

export const AnnouncementsPage = () => {

  const navigate = useNavigate();

  const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
  const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
  const [AnnouncementToDelete, setAnnouncementToDelete] = useState<Announcement | undefined>(undefined);

  const { mutationDeleteAnnouncement } = useDeleteAnnouncement();
  const { isLoading, data: { data: Announcements = [], totalPages = 0 } = {} } = usePagedAnnouncements();
  const { isFetching: isFetchingDataToExport, refetch: refetchDataToExport } = useExportAnnouncements();

  const { showLoading, hideLoading } = useLoaderStore();

  const handleClickAdd = () => {
    navigate('/announcements/new');
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
      { label: 'Fecha de publicación', key: 'publishedAt' },
      { label: 'Fecha de expiración', key: 'expiresAt' },
      { label: 'Estado', key: 'status' }
    ];

    downloadDataToCsvFile('Campañas & comunicados', headers, data);

    setTimeout(() => hideLoading(), 500);
  }

  const handleClickAdvancedFilters = () => {
    setIsOpenAdvancedFiltersPanel(true);
  }

  const handleClickEditRow = (item: Announcement) => {
    navigate(`/announcements/${item.id}`);
  }

  const handleClickDeleteRow = (item: Announcement) => {
    setAnnouncementToDelete(item);
    setIsOpenSingleDeleteModal(true);
  }

  const handleClickCancelDelteJobTitle = () => {
    setAnnouncementToDelete(undefined);
    setIsOpenSingleDeleteModal(false);
  }

  const handleClickDelteJobTitle = async () => {
    await mutationDeleteAnnouncement.mutateAsync(
      { id: AnnouncementToDelete?.id ?? undefined },
      {
        onSuccess: () => {
          toast.success('Concepto de pago eliminado correctamente');
          setAnnouncementToDelete(undefined);
          setIsOpenSingleDeleteModal(false);
        },
        onError: (error) => {
          console.warn(error);
          toast.error('Ocurrio un error al tratar de eliminar el concepto de pago');
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

        <CustomPageTitle title="Campañas & comunicados" subtitle="Gestiona las campañas & comunicados disponibles en el colegio y la organización" />

        <div className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <CustomTableListRibbon
            handleClickAdvancedFilters={handleClickAdvancedFilters}
            handleClickAdd={handleClickAdd}
            handleClickExport={handleClickExport}
            disabledExport={isFetchingDataToExport}
          />

          {/* Table content*/}
          <AnnouncementsTable
            data={Announcements ?? []}
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
            AnnouncementToDelete && (
              <CustomDeleteModal
                open={isOpenSingleDeleteModal}
                title={`¿Estas seguro de eliminar el registro ${AnnouncementToDelete?.name}`}
                message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                isLoading={mutationDeleteAnnouncement.isPending}
                handleClickConfirm={handleClickDelteJobTitle}
                handleClickCancel={handleClickCancelDelteJobTitle}
              />
            )
          }

          {/* Advanced filters panel */}
          {
            isOpenAdvancedFiltersPanel && (
              <AnnouncementsAdvancedFilters
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
