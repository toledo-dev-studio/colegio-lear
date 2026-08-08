import { useState } from "react";
import { useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Eye, EyeOff, Key, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/shared/shadcn/ui/input";
import { Button } from "@/shared/shadcn/ui/button";
import { AuthPagesHeader } from "../../components/AuthPagesHeader";
import { useLoaderStore } from "@/lib/zustand/stores/loader-store/LoaderStore";
import { useAuthStore } from "../../../../lib/zustand/stores/auth-store/auth.store";
import type { AuthResetPasswordRequest } from "@/interfaces/requests/auth-reset-password.request";

export const ResetPasswordPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const { resetPassword, logout, user } = useAuthStore();
  const { showLoading, hideLoading, isLoading } = useLoaderStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AuthResetPasswordRequest>({
    defaultValues: {
      id: user?.id,
      code: "",
      password: "",
      confirmPassword: "",
    },
  });
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (credentials: AuthResetPasswordRequest) => {
    showLoading("Restableciendo contraseña");
    const isSuccess = await resetPassword(credentials);
    if (isSuccess) {
      toast.success("Contraseña restablecida con éxito", {
        position: "top-right",
      });
      await logout();
      hideLoading();
      navigate("/auth/login");
      return;
    }
    hideLoading();
    toast.error(
      "No fue posible restablecer su contraseña, favor de comunícarse con un administrador",
      { position: "top-right" },
    );
  };

  return (
    <>
      <AuthPagesHeader
        title="Restablecer contraseña"
        message="Antes de poder ingresar al sistema es necesario que actualices tu contraseña nuevamente."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        data-testid="login-form"
      >
        <div className="control-container">
          <label className="label">
            Código de seguridad <span className="required">*</span>:
          </label>
          <Controller
            name="code"
            control={control}
            rules={{ required: "El código de seguridad es obligatorio" }}
            render={({ field }) => (
              <div className="relative">
                <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  {...field}
                  type="text"
                  placeholder="Código de seguridad..."
                  className="pl-12"
                />
              </div>
            )}
          />
          {errors.code && <p className="error">{errors.code.message}</p>}
          <p className="control-info">
            Código recibido por medio de correo electrónico
          </p>
        </div>

        <div className="control-container">
          <label className="label">
            Nueva contraseña <span className="required">*</span>:
          </label>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "La contraseña es obligatoria para el inicio de sesión",
              validate: (value) =>
                value === confirmPassword || "La contraseña debe de coincidir",
            }}
            render={({ field }) => (
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pill-input w-full pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          />
          {errors.password && (
            <p className="error">{errors.password.message}</p>
          )}
        </div>

        <div className="control-container">
          <label className="label">
            Confirmar nueva contraseña <span className="required">*</span>:
          </label>
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "La contraseña es obligatoria para el inicio de sesión",
              validate: (value) =>
                value === password || "La contraseña debe de coincidir",
            }}
            render={({ field }) => (
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  {...field}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pill-input w-full pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          data-testid="reset-password-submit-button"
          className="pill-btn-primary w-full justify-center py-3 mt-3"
        >
          {isLoading ? "Ingresando..." : "Restablecer contraseña"}
          <Key className="w-8 h-8 ml-2" />
        </Button>

        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          Al hacer clic estas de acuerdo con los <a href="#">Terminos</a> y{" "}
          <a href="#">Politicas de uso</a>.
        </div>
      </form>
    </>
  );
};
