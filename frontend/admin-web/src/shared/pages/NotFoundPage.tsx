import { Link } from "react-router";
import { GraduationCap } from "lucide-react";

export const NotFoundPage = () => {
    return (
        <>
            <main className="flex-1 grid place-items-center px-4 py-12">
                <div className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-xl p-8 sm:p-10 text-center">
                    <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-primary/10 grid place-items-center relative">
                        <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
                        <GraduationCap className="h-10 w-10 text-primary relative" />
                    </div>

                    <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-primary" />

                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Página no encontrada
                    </h1>

                    <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        La página que buscas{" "}
                        <span className="text-foreground font-medium">
                            no existe o ha sido movida
                        </span>
                        . Verifica la URL o regresa al inicio para continuar.
                    </p>

                    <div className="mt-8">
                        <Link to="/home" className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                            Ir al inicio
                        </Link>
                    </div>
                </div>
            </main>
        </>
    )
}
