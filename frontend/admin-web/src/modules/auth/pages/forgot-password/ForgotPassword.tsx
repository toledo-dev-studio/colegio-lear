import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { GraduationCap, Key, Mail } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import background from "@/assets/images/login-background.jpg";


export const ForgotPassword = () => {
  const navigate = useNavigate();
    const [form, setForm] = useState({ email: "admin@learn.com", password: "admin123" });
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate("/auth/login");
    }

    return (
        <>
            <div className="relative flex-1 flex items-center justify-center p-6 sm:p-12 bg-cover bg-center after:absolute after:inset-0 after:bg-black/40 after:content-['']" style={{backgroundImage: `url(${background})`}}>
                <div className="w-full max-w-xl border border-white-200 shadow-md rounded-lg p-12 bg-card z-10">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="font-heading font-extrabold text-xl text-foreground">COLEGIO LEAR</span>
                    </div>
                    <div className="flex items-start gap-4 mb-8 relative">
                        <div className="page-title-bar"></div>
                        <div className="ml-8">
                            <h2 className="font-heading text-3xl font-bold text-foreground">Recuperar contraseña</h2>
                            <p className="text-sm text-muted-foreground mt-1">Ingresa tu correo electrónico para recibir instrucciones sobre cómo recuperar tu contraseña.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" data-testid="forgot-password-form">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    data-testid="forgot-password-email-input"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="correo@colegio.com"
                                    className="pill-input w-full pl-12"
                                    required
                                />
                            </div>
                            <div className="w-full text-right mt-4">
                                <Link to="/auth/login">
                                    <span className="w-full text-right text-sm text-muted-foreground hover:text-primary">
                                        ¿Ya tienes cuenta? Inicia sesión aquí
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {error && <p className="text-sm text-destructive" data-testid="login-error">{error}</p>}

                        <Button
                            type="submit"
                            disabled={loading}
                            data-testid="login-submit-button"
                            className="pill-btn-primary w-full justify-center py-3 mt-3"
                        >
                            {loading ? "Ingresando..." : "Recuperar contraseña"}
                            <Key className="w-8 h-8 ml-2" />
                        </Button>
                        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                            Al hacer clic estas de acuerdo con los <a href="#">Terminos</a> y <a href="#">Politicas de uso</a>.
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
