import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { SchoolSubjectsTable } from "./components/SchoolSubjectsTable";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";
import { SchoolSubjectsAdvancedFilters } from "./components/SchoolSubjectsAdvancedFilters";
import { useDeleteSchoolSubject } from "../../hooks/useDeleteSchoolSubject";
import { useExportSchoolSubjects } from "../../hooks/useExportSchoolSubjects";
import { useGetPagedSchoolSubjects } from "../../hooks/useGetPagedSchoolSubjects";

export const SchoolSubjectsPage = () => {

  const navigate = useNavigate();

  const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
  const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
  const [schoolSubjectToDelete, setSchoolSubjectToDelete] = useState<SchoolSubject | undefined>(undefined);

  const pagedSchoolSubjectsQuery = useGetPagedSchoolSubjects();
  const deleteSchoolSubjectMutation = useDeleteSchoolSubject();
  const exportSchoolSubjectsMutation = useExportSchoolSubjects();

  const { showLoading, hideLoading } = useLoaderStore();

  const handleClickAdd = () => {
    navigate('/school-subjects/new');
  }

  const handleClickExport = async () => {
    showLoading('Descargando información', 'Por favor espere...');

    const data = await exportSchoolSubjectsMutation.mutateAsync();

    if (!data || !Array.isArray(data)) {
      hideLoading();
      toast.info('No se cuenta con información para descargar', { position: "top-right" });
      return;
    }

    const headers = [
      { label: 'Id', key: 'id' },
      { label: 'Nombre', key: 'name' },
      { label: 'Descripción', key: 'description' },
      { label: 'Estado', key: 'status' },
      { label: 'Nivel Académico', key: 'academicLevel.name' },
      { label: 'Grado Educativo', key: 'educationLevel.name' }
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
    await deleteSchoolSubjectMutation.mutateAsync(schoolSubjectToDelete?.id!,
      {
        onSuccess: () => {
          toast.success('Materia escolar eliminada correctamente', { position: "top-right" });
          setSchoolSubjectToDelete(undefined);
          setIsOpenSingleDeleteModal(false);
        },
        onError: (error: any) => {
          console.warn(error);
          toast.error('Ocurrio un error al tratar de eliminar la materia escolar', { position: "top-right" });
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
            { label: "Materias escolares", to: "/school-subjects" }
          ]} />
        </div>

        <CustomPageTitle title="Materias escolares" subtitle="Gestiona las materias escolares que estarán disponibles en el colegio" />

        <div className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <CustomTableListRibbon
            handleClickAdvancedFilters={handleClickAdvancedFilters}
            handleClickAdd={handleClickAdd}
            handleClickExport={handleClickExport}
            disabledExport={exportSchoolSubjectsMutation.isPending}
          />

          {/* Table content*/}
          <SchoolSubjectsTable
            data={pagedSchoolSubjectsQuery.data}
            isLoading={pagedSchoolSubjectsQuery.isFetching}
            handleClickEditRow={handleClickEditRow}
            handleClickDeleteRow={handleClickDeleteRow}
          />

          {/* Pagination top element */}
          {
            (!pagedSchoolSubjectsQuery.isFetching && pagedSchoolSubjectsQuery.itemsCount > 0) && (
              <div className="flex items-center justify-center my-8">
                <CustomPagination totalPages={pagedSchoolSubjectsQuery.totalPages} />
              </div>
            )
          }

          <CustomDeleteModal
            open={isOpenSingleDeleteModal}
            title={`¿Estas seguro de eliminar el registro ${schoolSubjectToDelete?.name}`}
            message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
            isLoading={deleteSchoolSubjectMutation.isPending}
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