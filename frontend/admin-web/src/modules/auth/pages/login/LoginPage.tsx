import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Eye, EyeOff, GraduationCap, Lock, LogIn, Mail } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import background from "@/assets/images/login-background.jpg";

export const LoginPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "admin@learn.com", password: "admin123" });
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate("/dashboard");
    }

    return (
        <>
            <div className="relative flex-1 flex items-center justify-center p-6 sm:p-12 bg-cover bg-center after:absolute after:inset-0 after:bg-black/40 after:content-['']" style={{backgroundImage: `url(${background})`}}>
                <div className="w-full max-w-xl border border-white-400 shadow-md rounded-lg p-12 bg-card z-10">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="font-heading font-extrabold text-xl text-foreground">COLEGIO LEAR</span>
                    </div>
                    <div className="flex items-start gap-4 mb-8 relative">
                        <div className="page-title-bar"></div>
                        <div className="ml-8">
                            <h2 className="font-heading text-3xl font-bold text-foreground">Iniciar sesión</h2>
                            <p className="text-sm text-muted-foreground mt-1">Ingresa tus credenciales para acceder al panel administrativo.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    data-testid="login-email-input"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="correo@colegio.com"
                                    className="pill-input w-full pl-12"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    data-testid="login-password-input"
                                    type={show ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="pill-input w-full pl-12 pr-12"
                                    required
                                />
                                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="w-full text-right mt-4">
                                <Link to="/auth/forgot-password">
                                    <span className="w-full text-right text-sm text-muted-foreground hover:text-primary">
                                        ¿Olvidaste tu contraseña?
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
                            {loading ? "Ingresando..." : "Iniciar sesión"}
                            <LogIn className="w-8 h-8 ml-2" />
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
