import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { AcademicLevelForm } from "./components/AcademicLevelForm";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { useGetByIdAcademicLevel } from "../../hooks/useGetByIdAcademicLevel";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useCreateUpdateAcademicLevel } from "../../hooks/useCreateUpdateAcademicLevel";

export const AcademicLevelPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { showLoading, hideLoading } = useLoaderStore();
    const academicLevelQuery = useGetByIdAcademicLevel(id || "");
    const createUpdateAcademicLevelMutation = useCreateUpdateAcademicLevel();
    const title = id === "new" ? "Registro de nivel académico" : "Edición de nivel académico";

    const handleSubmit = async (academicLevelLike: Partial<AcademicLevel>) => {
        try {
            showLoading("Guardando registro");
            await createUpdateAcademicLevelMutation.mutateAsync(academicLevelLike, {
                onSuccess: (response) => {
                    toast.success("Nivel académico actualizado correctamente", { position: "top-right" });
                    hideLoading();
                    navigate(`/academic-levels/${response.id}`);
                },
            });
        } catch (error) {
            console.warn(error);
            hideLoading();
            toast.error("Ocurrio un error al tratar de actualizar el nivel académico", { position: "top-right" });
        }
    }

    if (academicLevelQuery.isError) {
        toast.error("No fue posible obtener la información del nivel académico", { position: "top-right" });
        return <Navigate to="/academic-levels" />;
    }

    if (academicLevelQuery.isLoading) {
        return (
            <>
                <div className="w-full relative mx-auto h-full mt-30">
                    <CustomFullScreenLoading title="Cargando información" subtitle="Por favor espere..." />
                </div>
            </>
        )
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">
                <CustomPageTitle
                    title={title}
                    subtitle="Gestiona la información del nivel académico para que este disponible en el sistema" />

                <div className="flex-1">
                    <div className="flex flex-col min-h-full gap-8 mt-14">

                        <AcademicLevelForm
                            academicLevel={academicLevelQuery.data}
                            isSubmitting={createUpdateAcademicLevelMutation.isPending}
                            onSubmit={handleSubmit}
                        />

                    </div>
                </div>
            </div>

        </>
    )
}
