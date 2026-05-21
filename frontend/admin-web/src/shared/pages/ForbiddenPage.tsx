import { Button } from "../ui/button";
import { LogOut, ShieldAlert } from "lucide-react";

export const ForbiddenPage = () => {
    return (
        <>
            <main className="flex-1 grid place-items-center px-4 py-12">
                <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-xl p-8 sm:p-10 text-center">
                    <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-primary/10 grid place-items-center relative">
                        <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
                        <ShieldAlert className="h-10 w-10 text-primary relative" />
                    </div>

                    <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-primary" />

                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Acceso sin permisos asignados
                    </h1>

                    <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        Tu cuenta fue autenticada correctamente, pero actualmente{" "}
                        <span className="text-foreground font-medium">
                            no tienes ningún permiso asignado
                        </span>{" "}
                        dentro del sistema. Contacta al administrador de tu organización
                        para que te asigne un rol de seguridad con los privilegios que necesites.
                    </p>

                    <div className="mt-8">
                        <Button
                            size="lg"
                            variant="destructive"
                            onClick={() => {

                            }}
                            className="w-full sm:w-auto px-8 rounded-full"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Cerrar sesión
                        </Button>
                    </div>
                </div>
            </main>
        </>
    )
}
