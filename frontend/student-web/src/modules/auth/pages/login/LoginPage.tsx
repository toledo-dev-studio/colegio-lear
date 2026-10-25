import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/shared/shadcn/ui/input";
import { Button } from "@/shared/shadcn/ui/button";
import { AuthPagesHeader } from "../../components/AuthPagesHeader";
import type { AuthRequest } from "@/interfaces/requests/auth.request";
import { useAuthStore } from "@/stores/auth-store/auth.store";
import { useLoaderStore } from "@/stores/loader-store/LoaderStore";

export const LoginPage = () => {
    // Component hooks & stores
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<AuthRequest>({
        defaultValues: { username: undefined, password: undefined }
    });

    const { login } = useAuthStore();
    const { showLoading, hideLoading, isLoading } = useLoaderStore();

    const onSubmit = async (credentials: AuthRequest) => {
        showLoading("Iniciando sesión");
        const isSuccess = await login(credentials);
        hideLoading();
        if (isSuccess) {
            navigate("/dashboard");
            return;
        }
        toast.error("Correo y/o contraseña no validos", { position: "top-right" });
    }

    return (
        <>
            <AuthPagesHeader
                title="Iniciar sesión"
                message="Ingresa tus credenciales para acceder al panel administrativo." />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="login-form">
                <div className="control-container">
                    <label className="label">Matrícula / correo electrónico:</label>
                    <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            {...register("username", { required: true })}
                            type="text"
                            placeholder="correo@colegio.com"
                            className="pill-input w-full pl-12"
                            required
                        />
                    </div>
                    {
                        errors.username && (
                            <p className="text-red-500 text-sm mt-2">
                                Matrícula / correo electrónico es obligatorio para el inicio de sesión
                            </p>
                        )
                    }
                </div>
                
                <div className="control-container">
                    <label className="label">Contraseña:</label>
                    <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            {...register("password", { required: true })}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pill-input w-full pl-12 pr-12"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {
                        errors.password && (
                            <p className="text-red-500 text-sm mt-2">
                                La contraseña es obligatoria para el inicio de sesión
                            </p>
                        )
                    }
                    <div className="w-full text-right mt-4">
                        <Link to="/auth/forgot-password">
                            <span className="w-full text-right text-sm text-muted-foreground hover:text-primary">
                                ¿Olvidaste tu contraseña?
                            </span>
                        </Link>
                    </div>
                </div>

                <Button type="submit" disabled={isLoading} data-testid="login-submit-button" className="pill-btn-primary w-full justify-center py-3 mt-3">
                    {isLoading ? "Ingresando..." : "Iniciar sesión"}
                    <LogIn className="w-8 h-8 ml-2" />
                </Button>
                <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                    Al hacer clic estas de acuerdo con los <a href="#">Terminos</a> y <a href="#">Politicas de uso</a>.
                </div>
            </form>
        </>
    )
}
