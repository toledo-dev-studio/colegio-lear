import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { useLoaderStore } from "@/stores/LoaderStore";
import { AcademicLevelForm } from "./components/AcademicLevelForm";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { AcademicLevelFormSkeleton } from "./components/AcademicLevelFormSkeleton";
import type { AcademicLevelRequest } from "@/interfaces/requests/academic-level.request";
import { useGetAcademicLevelById } from "../../hooks/academic-levels/useGetAcademicLevelById";
import { useCreateUpdateAcademicLevel } from "../../hooks/academic-levels/useCreateUpdateAcademicLevel";

export const AcademicLevelPage = () => {
    // Component hooks & stores
    const navigate = useNavigate();
    const { id } = useParams();

    const { showLoading, hideLoading } = useLoaderStore();
    const academicLevelQuery = useGetAcademicLevelById({ id: id! });
    const createUpdateAcademicLevelMutation = useCreateUpdateAcademicLevel();
    const title = id === "new" ? "Registro de nivel académico" : "Edición de nivel académico";

    const handleSubmit = async (academicLevelRequestLike: Partial<AcademicLevelRequest>) => {
        try {
            showLoading("Guardando registro");
            await createUpdateAcademicLevelMutation.mutateAsync({ id: id!, academicLevelRequestLike }, {
                onSuccess: (response) => {
                    toast.success("Nivel académico actualizado correctamente", { position: "top-right" });
                    hideLoading();
                    navigate(`/academic-levels/${response.id}`);
                },
            });
        } catch (error) {
            console.warn(error);
            hideLoading();
            showApiErrorToast(error, "Ocurrio un error al tratar de actualizar el nivel académico");
        }
    }

    if (academicLevelQuery.isError) {
        showApiErrorToast(academicLevelQuery.error, "No fue posible obtener la información del nivel académico");
        return <Navigate to="/academic-levels" />;
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">

                <div className="mb-10">
                    <Breadcrumb items={[
                        { label: "Configuración escolar" },
                        { label: "Niveles academicos", to: "/academic-levels" },
                        { label: id === "new" ? "Nuevo nivel académico" : academicLevelQuery.data?.name || "Edición de nivel académico" },
                    ]} />
                </div>

                <PageTitle
                    title={title}
                    subtitle="Gestiona la información del nivel académico para que este disponible en el sistema" />

                <div className="flex-1">
                    <div className="flex flex-col min-h-full gap-8 mt-5">

                        {
                            academicLevelQuery.isLoading ?
                                <AcademicLevelFormSkeleton /> :
                                <AcademicLevelForm
                                    isNew={id === "new"}
                                    academicLevelResponse={academicLevelQuery.data}
                                    isSubmitting={createUpdateAcademicLevelMutation.isPending}
                                    onSubmit={handleSubmit}
                                />
                        }

                    </div>
                </div>
            </div>

        </>
    )
}
