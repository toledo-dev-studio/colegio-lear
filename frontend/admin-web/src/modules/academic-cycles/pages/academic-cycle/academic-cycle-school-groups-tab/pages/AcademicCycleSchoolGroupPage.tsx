import { Navigate, useParams } from "react-router";
import { toast } from "sonner";

import { Loader } from "@/shared/components/loader/Loader";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { useAcademicCycleSchoolGroupPage } from "../hooks/useAcademicCycleSchoolGroupPage";
import type { AcademicCycleSchoolGroupRequest } from "@/interfaces/requests/academic-cycle-school-group.request";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { AcademicCycleSchoolGroupForm } from "./components/AcademicCycleSchoolGroupForm";

export const AcademicCycleSchoolGroupPage = () => {
    // Component hooks & stores
    const { schoolGroupId } = useParams();

    // Context hooks & stores configuration
    const { context, queries, mutations, loader, isLoadingPage, isLoadingPageError } = useAcademicCycleSchoolGroupPage({ id: schoolGroupId! });

    // Constant configuration variables
    const title = schoolGroupId === "new" ? "Registro de grupo escolar" : "Edición de grupo escolar";


    // Component functions
    const onSubmit = async (academicCycleSchoolGroupRequestLike: Partial<AcademicCycleSchoolGroupRequest>) => {
        try {
            loader.show("Guardando");
            await mutations.academicCycleSchoolGroup.createUpdate.mutateAsync({
                id: schoolGroupId!,
                academicCycleSchoolGroupRequestLike
            }, {
                onSuccess: () => {
                    toast.success("Grupo escolar agregado al ciclo escolar correctamente", { position: "top-right" });
                    loader.hide();
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            toast.error("Ocurrió un error al tratar de registrar el grupo escolar", { position: "top-right" });
        }
    }

    if (isLoadingPageError) {
        toast.error("No fue posible obtener la información relacionada con el grupo escolar", { position: "top-right" });
        return <Navigate to={`/academic-cycles/${context.academicCycleId}/school-groups`} />;
    }

    if (isLoadingPage) {
        return (
            <>
                <div className="w-full relative mx-auto h-full mt-30">
                    <Loader title="Cargando información" subtitle="Por favor espere..." fullScreen={true} size="default" />
                </div>
            </>
        )
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">

                <div className="mb-10">
                    <div className="mb-10">
                        <Breadcrumb items={[
                            { label: "Seguimiento escolar" },
                            { label: "Ciclos escolares", to: "/academic-cycles" },
                            { label: context.academicCycle?.code || "Edición de ciclo escolar", to: `/academic-cycles/${context.academicCycleId}/school-groups` },
                            { label: title }
                        ]} />
                    </div>
                </div>

                <PageTitle
                    title="REGISTRO & EDICIÓN DE GRUPOS ESCOLARES"
                    subtitle="En esta sección podrás configurar aquellos grupos escolares que estarán disponibles para los alumnos al momento de su incripción en el ciclo escolar." />

                <div className="flex-1">
                    <section className="flex flex-col min-h-full gap-8 mt-14">

                        <AcademicCycleSchoolGroupForm
                            isSubmitting={mutations.academicCycleSchoolGroup.createUpdate.isPending}
                            teachersResponse={queries.teachers.get.data}
                            schoolSubjectsResponse={queries.schoolSubjects.get.data}
                            academicCycleSchoolGroupResponse={queries.schoolGroups.getById.data}
                            onSubmit={onSubmit}
                        />

                    </section>
                </div>
            </div>
        </>
    )
}
