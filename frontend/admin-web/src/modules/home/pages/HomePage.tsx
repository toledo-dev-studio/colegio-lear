import {
    LayoutDashboard,
    ArrowUpRight,
    Sparkles,
    Zap,
    ShieldHalf,
    Layers,
} from "lucide-react";
import { userStoreFullName } from "@/modules/auth/stores/auth.store.selectors";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { Link } from "react-router";
import { filterNavbarByPermissions } from "@/lib/helpers/navbar.helper";
import { NAVBAR } from "@/lib/constants/navbar.constant";
import { ICON_TONE } from "@/interfaces/components/navbar";
import { SectionHeader } from "@/modules/dashboard/components/SectionHeader";

const CAPABILITIES = [
    { icon: Layers, title: "Todo en un solo lugar", text: "Alumnos, docentes, pagos, ciclos y comunicación desde un mismo panel." },
    { icon: Zap, title: "Rápido y responsivo", text: "Interfaz optimizada, carga desacoplada y skeletons para no bloquear el flujo." },
    { icon: ShieldHalf, title: "Roles y permisos", text: "Control granular por perfil para que cada quien vea lo que le corresponde." },
];



function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
}

export const HomePage = () => {
    const { permissions } = useAuthStore();
    const fullName = useAuthStore(userStoreFullName);
    const firstName = fullName.split(" ")[0] ?? "";
    const navbar = filterNavbarByPermissions(NAVBAR, permissions);

    return (
        <section className="page-main-section py-8">

            <div className="space-y-10" data-testid="home-page">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-8 sm:p-10" data-testid="home-hero">
                    <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                    <div className="relative flex items-start gap-3 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-[11px] uppercase tracking-widest font-semibold">
                            <Sparkles className="w-3.5 h-3.5" />
                            Colegio Lear · Admin Suite
                        </span>
                    </div>
                    <h1 className="relative font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight">
                        {getGreeting()},{" "}
                        <span className="text-primary">{firstName || "bienvenido"}</span>.
                    </h1>
                    <p className="relative mt-3 text-base sm:text-lg text-muted-foreground max-w-3xl">
                        Este es tu panel administrativo. Desde aquí puedes gestionar alumnos, docentes, ciclos escolares,
                        pagos y comunicación con la comunidad educativa, todo con la seguridad y trazabilidad que tu colegio necesita.
                    </p>

                    <div className="relative mt-6 flex flex-wrap gap-3">
                        <Link to="/dashboard" data-testid="home-hero-cta-dashboard" className="inline-flex items-center gap-2 px-5 h-11 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-sm hover:opacity-90 transition-opacity">
                            <LayoutDashboard className="w-4 h-4" />
                            Ir al Dashboard
                        </Link>
                    </div>
                </section>

                {/* Capabilities info block */}
                <section data-testid="home-capabilities">
                    <SectionHeader label={"Funciones del sistema"}></SectionHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {CAPABILITIES.map((c) => {
                            const Icon = c.icon;
                            return (
                                <div key={c.title} className="bg-card rounded-3xl p-6 border border-border shadow-sm">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-primary/10 text-primary mb-4">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-heading font-bold text-base text-foreground mb-1">{c.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Quick access groups */}
                <section data-testid="home-quick-access" className="space-y-8">
                    {navbar.map((nav) => (
                        <div key={nav.title} className="grid">
                            <SectionHeader label={nav.title}></SectionHeader>
                            <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-5">
                                {nav.items.map((it) => {
                                    const Icon = it.icon;
                                    return (
                                        <Link
                                            key={it.module.key}
                                            to={`/${it.module.key}`}
                                            data-testid={it.testId}
                                            className="group bg-card rounded-3xl p-6 border border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ICON_TONE[it.tone]}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                            <h4 className="font-heading font-bold text-base text-foreground">{it.module.label}</h4>
                                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{it.description}</p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </section>
            </div>

        </section>
    );
}
