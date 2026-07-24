import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Modal } from "@/shared/components/modal/Modal";
import { Table } from "@/shared/components/table/Table";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { useAcademicCycleSchoolSubjectsTab } from "./hooks/useAcademicCycleSchoolSubjectsTab";
import { useAcademicCycleSchoolSubjectsTable } from "./hooks/useAcademicCycleSchoolSubjectsTable";
import { AcademicCycleSchoolSubjectPanelForm } from "./components/AcademicCycleSchoolSubjectPanelForm";
import type { AcademicCycleSchoolSubjectRequest } from "@/interfaces/requests/academic-cycle-school-subject.request";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";

export const AcademicCycleSchoolSubjectsTab = () => {
    // Context hooks & stores configuration
    const { context, queries, mutations, deleteModal, loader } = useAcademicCycleSchoolSubjectsTab();

    // Componet hooks and stores
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpenCreateUpdatePanelForm, setIsOpenCreateUpdatePanelForm] = useState<boolean>(false);
    const [academicCycleSchoolSubjectToEdit, setAcademicCycleSchoolSubjectToEdit] = useState<Partial<AcademicCycleSchoolSubjectResponse>>();

    // Table hook configuration
    const { columns, properties, actions } = useAcademicCycleSchoolSubjectsTable({
        handleClickEdit: (item: AcademicCycleSchoolSubjectResponse) => {
            setAcademicCycleSchoolSubjectToEdit(item);
            setIsOpenCreateUpdatePanelForm(true);
        },
        handleClickDelete: deleteModal.open
    });

    // Filtering data using memo
    const associatedSchoolSubjects = useMemo(() => {
        const data = queries.schoolSubject.get.data ?? [];

        if (!searchQuery.trim())
            return data;

        const query = searchQuery.toLowerCase();

        return data.filter(item =>
            item.schoolSubject?.name?.toLowerCase().includes(query)
        );
    }, [queries.schoolSubject.get.data, searchQuery]);

    // Component functions
    const handleClickConfirmDeleteAcademicCycleSchoolSubject = async () => {
        if (!deleteModal.record)
            return;
        await mutations.schoolSubject.delete.mutateAsync({
            id: deleteModal.record.id,
            academicCycleId: context.academicCycleId!,
        },
            {
                onSuccess: () => {
                    toast.success("La materia se desasocio correctamente del ciclo escolar", { position: "top-right" });
                    deleteModal.close();
                    setAcademicCycleSchoolSubjectToEdit({});
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de desasociar la materia del ciclo escolar", { position: "top-right" });
                }
            }
        )
    }

    const onSubmit = async (academicCycleSchoolSubjectRequestLike: Partial<AcademicCycleSchoolSubjectRequest>) => {
        try {
            if (queries.schoolSubject.get.data.some(item => item.schoolSubjectId === academicCycleSchoolSubjectRequestLike.schoolSubjectId && item.id !== academicCycleSchoolSubjectToEdit?.id)) {
                toast.warning("La materia seleccionada ya se encuentra asociada al ciclo escolar", { position: "top-right" });
                return;
            }

            loader.show("Guardando");
            await mutations.schoolSubject.createUpdate.mutateAsync({
                id: academicCycleSchoolSubjectToEdit?.id || "new",
                academicCycleSchoolSubjectRequestLike
            }, {
                onSuccess: () => {
                    toast.success("Materia escolar agregada al ciclo escolar correctamente", { position: "top-right" });
                    loader.hide();
                    setAcademicCycleSchoolSubjectToEdit({});
                    setIsOpenCreateUpdatePanelForm(false)
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            toast.error("Ocurrió un error al tratar de asociar la materia al ciclo escolar", { position: "top-right" });
        }
    }

    if (queries.schoolSubject.get.isError) {
        toast.error("No fue posible obtener información de las materias asociadas al ciclo escolar", { position: "top-right" });
    }

    return (
        <>
            {/* School subjects table section */}
            <section className="flex flex-col gap-y-6">
                <SectionTitle
                    title="LISTADO DE MATERIAS ASIGNADAS PARA EL CICLO ESCOLAR"
                    description="El siguiente listado contiene la información de las materias que serán impartidas para los alumnos que sean inscritos a este ciclo escolar." />
                <TableRibbon
                    className="mb-0"
                    filterButton={{ show: false }}
                    exportButton={{ show: false }}
                    addButton={{
                        show: !context.isLocked,
                        label: "Asociar nueva materia",
                        disabled: queries.schoolSubject.get.isLoading || queries.schoolSubject.get.isError,
                        handleClick: () => {
                            setAcademicCycleSchoolSubjectToEdit({});
                            setIsOpenCreateUpdatePanelForm(true);
                        }
                    }}
                    searchInput={{
                        show: true,
                        disabled: queries.schoolSubject.get.isLoading || queries.schoolSubject.get.isError,
                        placeholder: "Búsqueda general por materia",
                        tooltip: "Búsqueda general por materia",
                        onKeyDown: () => { },
                        onChange: (event) => setSearchQuery(event.target.value || ""),
                        onClickClear: () => setSearchQuery("")
                    }}
                />
                <Table
                    data={associatedSchoolSubjects}
                    isLoading={queries.schoolSubject.get.isLoading}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                    skeletonRows={4}
                />
            </section>

            {/* Create & update school subject relation form */}
            {
                (!context.isLocked && isOpenCreateUpdatePanelForm) && (
                    <AcademicCycleSchoolSubjectPanelForm
                        academicCycleSchoolSubjectResponse={academicCycleSchoolSubjectToEdit}
                        handleClickClose={() => {
                            setAcademicCycleSchoolSubjectToEdit({});
                            setIsOpenCreateUpdatePanelForm(false);
                        }}
                        onSubmit={onSubmit}
                    />
                )
            }

            {/* Delete single record modal */}
            {
                (!context.isLocked && deleteModal.record)  && (
                    <Modal
                        open={deleteModal.isOpen}
                        type="delete"
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.schoolSubject?.name}?`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.schoolSubject.delete.isPending}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => deleteModal.close()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDeleteAcademicCycleSchoolSubject
                        }}
                    />
                )
            }
        </>
    )
}
