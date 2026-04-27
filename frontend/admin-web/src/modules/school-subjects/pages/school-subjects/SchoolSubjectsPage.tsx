import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner"

import { CustomPageTitle } from "@/shared/components/CustomPageTitle"
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon"
import { usePagedSchoolSubjects } from "../../hooks/usePagedSchoolSubjects";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { useExportSchoolSubjects } from "../../hooks/useExportSchoolSubjects";
import { downloadDataToCsvFile } from "@/lib/utils";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { SchoolSubjectsTable } from "./components/SchoolSubjectsTable";
import { SchoolSubjectsAdvancedFilters } from "./components/SchoolSubjectsAdvancedFilters";
import { useDeleteSchoolSubject } from "../../hooks/useDeleteSchoolSubject";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";

export const SchoolSubjectsPage = () => {

  const navigate = useNavigate();

  const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
  const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
  const [schoolSubjectToDelete, setSchoolSubjectToDelete] = useState<SchoolSubject | undefined>(undefined);

  const { deleteSchoolSubject } = useDeleteSchoolSubject();
  const { isLoading, data: { data: schoolSubjects = [], totalPages = 0 } = {} } = usePagedSchoolSubjects();
  const { isFetching: isFetchingDataToExport, refetch: refetchDataToExport } = useExportSchoolSubjects();

  const { showLoading, hideLoading } = useLoaderStore();

  const handleClickAdd = () => {
    navigate('/school-subjects/new');
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
      { label: 'Estado', key: 'status' },
      { label: 'Nivel Académico', key: 'academicLevel.name' },
      { label: 'Grado Educativo', key: 'educationLevelId.name' }
    ];

    downloadDataToCsvFile('Materias escolares', headers, data);

    setTimeout(() => hideLoading(), 500);
  }

  const handleClickAdvancedFilters = () => {
    setIsOpenAdvancedFiltersPanel(true);
  }

  const handleClickEditRow = (schoolSubject: SchoolSubject) => {
    navigate(`/school-subjects/${schoolSubject.id}`);
  }

  const handleClickDeleteRow = (schoolSubject: SchoolSubject) => {
    setSchoolSubjectToDelete(schoolSubject);
    setIsOpenSingleDeleteModal(true);
  }

  const handleClickCancelDelteSchoolSubject = () => {
    setSchoolSubjectToDelete(undefined);
    setIsOpenSingleDeleteModal(false);
  }

  const handleClickDelteSchoolSubject = async () => {
    await deleteSchoolSubject.mutateAsync(
      { id: schoolSubjectToDelete?.id ?? undefined },
      {
        onSuccess: () => {
          toast.success('Materia escolar eliminada correctamente');
          setSchoolSubjectToDelete(undefined);
          setIsOpenSingleDeleteModal(false);
        },
        onError: (error: any) => {
          console.warn(error);
          toast.error('Ocurrio un error al tratar de eliminar la materia escolar');
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

        <CustomPageTitle title="Materias escolares" subtitle="Gestiona las materias escolares disponibles en la organización" />

        <div className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <CustomTableListRibbon
            handleClickAdvancedFilters={handleClickAdvancedFilters}
            handleClickAdd={handleClickAdd}
            handleClickExport={handleClickExport}
            disabledExport={isFetchingDataToExport}
          />

          {/* Table content*/}
          <SchoolSubjectsTable
            schoolSubjects={schoolSubjects ?? []}
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
            title={`¿Estas seguro de eliminar el registro ${schoolSubjectToDelete?.name}`}
            message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
            isLoading={deleteSchoolSubject.isPending}
            handleClickConfirm={handleClickDelteSchoolSubject}
            handleClickCancel={handleClickCancelDelteSchoolSubject}
          />

          {
            isOpenAdvancedFiltersPanel && (
              <SchoolSubjectsAdvancedFilters
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