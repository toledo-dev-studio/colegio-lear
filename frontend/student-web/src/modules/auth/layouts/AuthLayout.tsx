import { Outlet } from "react-router";
import { GraduationCap } from "lucide-react";

import background from "@/assets/images/login-background.jpg";
export const AuthLayout = () => {
  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted">
        <div className="w-full">
          <div className="min-h-screen flex bg-background" data-testid="login-page">

            {/* Left panel */}
            <div className="relative flex-1 flex items-center justify-center p-6 sm:p-12 bg-cover bg-center after:absolute after:inset-0 after:bg-black/40 after:content-['']" style={{ backgroundImage: `url(${background})` }}>
              <div className="w-full max-w-xl border border-white-400 shadow-md rounded-lg p-12 bg-card z-10">
                <Outlet />
              </div>
            </div>

            {/* Right panel */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-linear-to-br from-primary via-[#1659B6] to-[#0b3c82] items-center justify-center p-12">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "radial-gradient(circle at 25% 30%, rgba(255,255,255,0.25) 0%, transparent 35%), radial-gradient(circle at 75% 70%, rgba(255,255,255,0.18) 0%, transparent 40%)"
              }} />
              <div className="relative text-white max-w-md">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-12! h-12! rounded-full bg-card/15 backdrop-blur flex items-center justify-center">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="font-heading font-extrabold text-2xl tracking-tight">COLEGIO LEAR</span>
                </div>
                <h1 className="font-heading text-4xl font-bold leading-tight mb-4">
                  Gestiona tu vida escolar con claridad y control.
                </h1>
                <p className="text-white/80 text-lg leading-relaxed">
                  Consulta calificaciones, tareas y avisos en una sola plataforma diseñada para tu aprendizaje.
                </p>
                <div className="mt-10 space-y-3">
                  {["Calificaciones y avance al instante", "Tareas y asignaciones en un solo lugar", "Avisos y comunicaciones de tu institución"].map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white/80" />
                      <p className="text-white/90 text-sm">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default AuthLayout;