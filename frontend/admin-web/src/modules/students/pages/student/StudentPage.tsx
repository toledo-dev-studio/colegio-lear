import { toast } from "sonner";
import { useState } from "react";
import { Navigate, useParams } from "react-router";
import { BanknoteArrowUp, CalendarDays, HeartPlus, InfoIcon, ShieldPlus, UserCircle2 } from "lucide-react";

import { cn } from "@/lib/extensions/utils";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { StudentForm } from "./components/student-tab/StudentForm";
import { StudentMedicalInformationForm } from "./components/student-medical-tab/StudentMedicalInformationForm";
import { useGetByIdStudentGeneralInformation } from "../../hooks/students/useGetByIdStudentGeneralInformation";
import { StudentGuardiansForm } from "./components/student-guardians-tab/StudentGuardiansForm";

export const StudentPage = () => {
    const { id } = useParams();

    const [formSection, setFormSection] = useState<"main-information" | "guardians" | "academic-cycles" | "payments" | "medical-information">("main-information");

    const studentQuery = useGetByIdStudentGeneralInformation(id || "");
    const isNew = id === "new";
    const title = isNew ? "Registro de estudiante" : "Edición de estudiante";

    if (studentQuery.isError) {
        toast.error("No fue posible obtener la información del estudiante", { position: "top-right" });
        return <Navigate to="/students" />;
    }

    if (studentQuery.isLoading) {
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

                <div className="mb-10">
                    <CustomBreadcrumb items={[
                        { label: "Seguimiento escolar" },
                        { label: "Estudiantes", to: "/students" },
                        { label: isNew ? "Nuevo estudiante" : studentQuery.data?.enrollment || "Edición de estudiante" },
                    ]} />
                </div>

                <CustomPageTitle
                    title={title}
                    subtitle="Gestiona la información de los estudiantes que estará disponible en la organización" />

                <div className="flex-1">
                    <div className="flex flex-col min-h-full gap-5 mt-6">

                        {/* Form tabs */}
                        <div className="border-b border-default overflow-x-auto no-scrollbar w-full">
                            <ul className="flex flex-row text-sm font-medium text-muted-foreground">
                                <li className="mr-2 text-nowrap">
                                    <button
                                        className={
                                            cn("cursor-pointer inline-flex items-center justify-center p-4 border-b border-transparent rounded-t-base hover:text-fg-brand hover:border-brand group transition transition-all",
                                                formSection === "main-information" && "border-primary text-primary"
                                            )}
                                        onClick={() => setFormSection("main-information")}>
                                        <UserCircle2 className="w-4 h-4 me-2 text-muted-foreground group-hover:text-fg-brand" aria-hidden="true" />
                                        Información general
                                    </button>
                                </li>
                                <li className="mr-2 text-nowrap">
                                    <button
                                        className={
                                            cn("cursor-pointer inline-flex items-center justify-center p-4 border-b border-transparent rounded-t-base hover:text-fg-brand hover:border-brand group transition transition-all",
                                                formSection === "medical-information" && "border-primary text-primary",
                                                isNew && "cursor-not-allowed opacity-50"
                                            )}
                                        onClick={() => !isNew && setFormSection("medical-information")}>
                                        <HeartPlus className="w-4 h-4 me-2 text-muted-foreground group-hover:text-fg-brand" aria-hidden="true" />
                                        Información médica
                                    </button>
                                </li>
                                <li className="mr-2 text-nowrap">
                                    <button
                                        className={
                                            cn("cursor-pointer inline-flex items-center justify-center p-4 border-b border-transparent rounded-t-base hover:text-fg-brand hover:border-brand group transition transition-all",
                                                formSection === "guardians" && "border-primary text-primary",
                                                isNew && "cursor-not-allowed opacity-50"
                                            )}
                                        onClick={() => !isNew && setFormSection("guardians")}>
                                        <ShieldPlus className="w-4 h-4 me-2 text-muted-foreground group-hover:text-fg-brand" aria-hidden="true" />
                                        Tutores del estudiante
                                    </button>
                                </li>
                                <li className="mr-2 text-nowrap">
                                    <button
                                        className={
                                            cn("cursor-pointer inline-flex items-center justify-center p-4 border-b border-transparent rounded-t-base hover:text-fg-brand hover:border-brand group transition transition-all",
                                                formSection === "academic-cycles" && "border-primary text-primary",
                                                isNew && "cursor-not-allowed opacity-50"
                                            )}
                                        onClick={() => !isNew && setFormSection("academic-cycles")}>
                                        <CalendarDays className="w-4 h-4 me-2 text-muted-foreground group-hover:text-fg-brand" aria-hidden="true" />
                                        Ciclos escolares
                                    </button>
                                </li>
                                <li className="mr-2 text-nowrap">
                                    <button
                                        className={
                                            cn("cursor-pointer inline-flex items-center justify-center p-4 border-b border-transparent rounded-t-base hover:text-fg-brand hover:border-brand group transition transition-all",
                                                formSection === "payments" && "border-primary text-primary",
                                                isNew && "cursor-not-allowed opacity-50"
                                            )}
                                        onClick={() => !isNew && setFormSection("payments")}>
                                        <BanknoteArrowUp className="w-4 h-4 me-2 text-muted-foreground group-hover:text-fg-brand" aria-hidden="true" />
                                        Registro de pagos
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {
                            isNew && (
                                <div className="flex flex-col items-start gap-y-4 border-b border-border mt-2 mb-2 border-solid border p-6 rounded-xl bg-primary/90 dark:bg-primary/20">
                                    <h2 className="w-full text-white flex gap-x-4 items-center">
                                        <InfoIcon /> RECORDATORIO SOBRE EL REGISTRO DEL ESTUDIANTE
                                    </h2>
                                    <p className="text-xs text-white">
                                        Una vez guardada la información general del estudiante, se generará automáticamente su matrícula, de igual modo podrás dar seguimiento a los ciclos escolares, así como para llevar el registro de sus pagos, además de que podrás
                                        complementar su información general con su información médica, así como también agregar a sus tutores legales para que puedan tener acceso al portal del alumno y recibir notificaciones importantes sobre el estudiante.
                                    </p>
                                </div>
                            )
                        }

                        {formSection === "main-information" && <StudentForm student={studentQuery.data} isNew={isNew} />}
                        {formSection === "medical-information" && <StudentMedicalInformationForm id={id!} />}
                        {formSection === "guardians" && <StudentGuardiansForm studentId={id!} />}

                    </div>
                </div>
            </div>
        </>
    )
}
