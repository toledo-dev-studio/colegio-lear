// Sección de Tareas de una materia: lista de tareas paginada con botón de
// cargar más (tareas previas), estados vacío y de carga

import { History, Info } from "lucide-react";

import { Button } from "@/shared/shadcn/ui/button";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { SchoolSubjectTaskResponse } from "@/interfaces/responses/school-subject-task.response";
import { TaskCard } from "../task-card/TaskCard";

interface Props {
    tasks: SchoolSubjectTaskResponse[];
    isLoading: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onLoadMore: () => void;
}

export const TasksSection = ({ tasks, isLoading, hasNextPage, isFetchingNextPage, onLoadMore }: Props) => {
    return (
        <section className="flex flex-col gap-y-5">
            {
                isLoading ? (
                    <section className="flex flex-col gap-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                                <div className="pt-3 border-t border-border space-y-2">
                                    <Skeleton className="h-3 w-40" />
                                    <Skeleton className="h-7 w-52" />
                                </div>
                            </div>
                        ))}
                    </section>
                ) : tasks.length === 0 ? (
                    <section className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-200/40 rounded-md px-4 py-3">
                        <Info className="w-4 h-4 shrink-0" />
                        <p>Esta materia aún no tiene tareas asignadas.</p>
                    </section>
                ) : (
                    <>
                        <section className="flex flex-col gap-4">
                            {tasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </section>

                        {
                            hasNextPage && (
                                <section className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onLoadMore}
                                        disabled={isFetchingNextPage}
                                        className="h-9 rounded-full px-5 text-xs"
                                    >
                                        <History className="w-3.5 h-3.5" />
                                        {isFetchingNextPage ? "Cargando tareas previas…" : "Cargar más tareas"}
                                    </Button>
                                </section>
                            )
                        }
                    </>
                )
            }
        </section>
    );
}
