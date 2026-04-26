import { Navigate, useNavigate, useParams } from "react-router"
import { toast } from "sonner";

import { useAcademicLevel } from "../../hooks/useAcademicLevel";
import { AcademicLevelForm } from "./components/AcademicLevelForm";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle"
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useLoaderStore } from "@/shared/stores/LoaderStore";

export const AcademicLevelPage = () => {

    const navigate = useNavigate();
    const { id } = useParams();

    const title = id === "new" ? 'Registro de nivel académico' : 'Edición de nivel académico';
    const { isLoading, isError, data: academicLevel, mutation } = useAcademicLevel(id || '');
    const { showLoading, hideLoading } = useLoaderStore();

    const handleSubmit = async (academicLevelLike: Partial<AcademicLevel>) => {
        try {
            showLoading('Guardando registro');
            !academicLevelLike.id && (academicLevelLike.id = "new");
            await mutation.mutateAsync(academicLevelLike, {
                onSuccess: (product) => {
                    toast.success('Nivel académico actualizado correctamente');
                    navigate(`/academic-levels/${product.id}`);
                },
            });
        } catch (error) {
            console.warn(error);
            hideLoading();
            toast.error('Ocurrio un error al tratar de actualizar el nivel académico');
        }
    }

    if (isError) {
        toast.error("No fue posible obtener la información del nivel académico");
        return <Navigate to="/academic-levels" />;
    }

    if (isLoading) {
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
                            academicLevel={academicLevel}
                            isSubmitting={mutation.isPending}
                            onSubmit={handleSubmit}
                        />

                    </div>
                </div>
            </div>

        </>
    )
}
