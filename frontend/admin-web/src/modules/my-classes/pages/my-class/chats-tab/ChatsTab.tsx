import { useState } from "react";
import { useOutletContext } from "react-router";

import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useGetAcademicCycleEnrollmentsBySchoolGroup } from "../../../hooks/shared/useGetAcademicCycleEnrollmentsBySchoolGroup";
import type { MyClassLayoutContext } from "../../../interfaces/my-class-layout-context";
import { StudentsList } from "./components/StudentsList";
import { ChatWindow } from "./components/ChatWindow";
import { ChatEmptyState } from "./components/ChatEmptyState";
import { ChatsSkeleton } from "./components/ChatsSkeleton";

export const ChatsTab = () => {
    // Component hooks & stores
    const { myClassId, academicCycleId, loggedInUserCanWrite } = useOutletContext<MyClassLayoutContext>();
    const { user } = useAuthStore();

    const enrollmentsQuery = useGetAcademicCycleEnrollmentsBySchoolGroup({ academicCycleId, academicCycleSchoolGroupId: myClassId });

    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | undefined>();

    const teacherId = user?.id;
    const selectedEnrollment = enrollmentsQuery.data?.find((enrollment) => enrollment.id === selectedEnrollmentId);

    return (
        <section className="flex flex-col gap-y-6">

            {/* Section title */}
            <SectionTitle
                title="CHAT CON ESTUDIANTES"
                description="Comunícate de forma individual con los estudiantes inscritos en este grupo escolar, consulta el historial de mensajes y envía mensajes de texto." />

            {/* Students and chat window */}
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-128">
                {
                    enrollmentsQuery.isLoading ? (
                        <ChatsSkeleton />
                    ) : (enrollmentsQuery.data?.length ?? 0) === 0 ? (
                        <ChatEmptyState
                            className="min-h-128"
                            title="No hay estudiantes inscritos"
                            description="Cuando haya estudiantes inscritos en este grupo escolar, podrás comunicarte con ellos desde aquí." />
                    ) : (
                        <>
                            {/* Students list */}
                            <aside className={`w-full lg:w-80 xl:w-96 shrink-0 border-b lg:border-b-0 border-border overflow-y-auto max-h-[70vh] ${selectedEnrollment ? "hidden lg:block" : "block"}`}>
                                <StudentsList
                                    enrollments={enrollmentsQuery.data ?? []}
                                    selectedEnrollmentId={selectedEnrollmentId}
                                    onSelectEnrollment={setSelectedEnrollmentId} />
                            </aside>

                            {/* Chat window */}
                            <main className={`flex-1 min-w-0 lg:border-l border-border ${selectedEnrollment ? "flex" : "hidden lg:flex"}`}>
                                {
                                    selectedEnrollment && teacherId ? (
                                        <ChatWindow
                                            enrollment={selectedEnrollment}
                                            teacherId={teacherId}
                                            canWrite={loggedInUserCanWrite}
                                            onBack={() => setSelectedEnrollmentId(undefined)} />
                                    ) : (
                                        <ChatEmptyState
                                            title="Selecciona un estudiante"
                                            description="Elige un estudiante de la lista para consultar y enviar mensajes." />
                                    )
                                }
                            </main>
                        </>
                    )
                }
            </section>
        </section>
    )
}

export default ChatsTab;