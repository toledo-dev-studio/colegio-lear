import { Link, useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Key, Mail } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/shared/shadcn/ui/input";
import { Button } from "@/shared/shadcn/ui/button";
import { isValidEmail } from "@/lib/extensions/validators";
import { AuthPagesHeader } from "../../components/AuthPagesHeader";
import { useLoaderStore } from "@/lib/zustand/stores/loader-store/LoaderStore";
import { useAuthStore } from "../../../../lib/zustand/stores/auth-store/auth.store";

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
        defaultValues: { email: "" }
    });

    const { requestResetPassword } = useAuthStore();
    const { showLoading, hideLoading, isLoading } = useLoaderStore();

    const onSubmit = async (credentials: { email: string }) => {
        showLoading("Validando datos");

        await requestResetPassword(credentials);

        hideLoading();

        toast.success("Si su correo electrónico es válido se le hará llegar una contraseña temporal para su ingreso al sistema", { position: "top-right" });
        navigate("/auth/login");
    }

    return (
        <>
            <AuthPagesHeader
                title="Recuperar contraseña"
                message="Ingresa tu correo electrónico para recibir instrucciones sobre cómo recuperar tu contraseña." />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="forgot-password-form">

                <div className="control-container">
                    <label className="label">Correo electrónico <span className="required">*</span>:</label>
                    <Controller
                        name="email"
                        control={control}
                        rules={{ required: true, validate: (value) => isValidEmail(value) || "El correo electrónico no es válido" }}
                        render={({ field }) => (
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    {...field}
                                    type="email"
                                    placeholder="usuario@dominio.com"
                                    className="pl-12" />
                            </div>
                        )}
                    />
                    {
                        errors.email && (
                            <p className="error">
                                El correo electrónico es obligatorio
                            </p>
                        )
                    }
                </div>

                <div className="w-full text-right mt-4">
                    <Link to="/auth/login">
                        <span className="w-full text-right text-sm text-muted-foreground hover:text-primary">
                            ¿Ya tienes cuenta? Inicia sesión aquí
                        </span>
                    </Link>
                </div>
                
                <Button type="submit" disabled={isLoading} data-testid="request-reset-password-submit-button" className="pill-btn-primary w-full justify-center py-3 mt-3">
                    {isLoading ? "Ingresando..." : "Recuperar contraseña"}
                    <Key className="w-8 h-8 ml-2" />
                </Button>
                <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                    Al hacer clic estas de acuerdo con los <a href="#">Terminos</a> y <a href="#">Politicas de uso</a>.
                </div>

            </form>
        </>
    )
}
