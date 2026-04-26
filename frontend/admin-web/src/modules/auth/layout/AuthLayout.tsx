import { GraduationCap } from "lucide-react";
import { Outlet } from "react-router";

export const AuthLayout = () => {
  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted">
        <div className="w-full">
          <div className="min-h-screen flex bg-background" data-testid="login-page">
            
            {/* Left panel */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-primary via-[#1659B6] to-[#0b3c82] items-center justify-center p-12">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "radial-gradient(circle at 25% 30%, rgba(255,255,255,0.25) 0%, transparent 35%), radial-gradient(circle at 75% 70%, rgba(255,255,255,0.18) 0%, transparent 40%)"
              }} />
              <div className="relative text-white max-w-md">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="font-heading font-extrabold text-2xl tracking-tight">COLEGIO LEAR</span>
                </div>
                <h1 className="font-heading text-4xl font-bold leading-tight mb-4">
                  Administra tu colegio con claridad y control.
                </h1>
                <p className="text-white/80 text-lg leading-relaxed">
                  Centraliza usuarios, roles y puestos en una sola plataforma diseñada para la operación escolar moderna.
                </p>
                <div className="mt-10 space-y-3">
                  {["Gestión unificada de accesos", "Privilegios granulares por módulo", "Reportes y exportación instantánea"].map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white/80" />
                      <p className="text-white/90 text-sm">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <Outlet />
            
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthLayout;