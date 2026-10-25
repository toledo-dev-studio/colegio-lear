import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";

import { NAVBAR } from "@/lib/constants/navbar.constant";
import { ICON_TONE } from "@/interfaces/components/navbar";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { filterNavbarByPermissions } from "@/lib/helpers/navbar.helper";

export const QuickAccess = () => {
    const { permissions } = useAuthStore();
    const navbar = filterNavbarByPermissions(NAVBAR, permissions);

    return (
        <>
            <section data-testid="dashboard-quick-actions">
                <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
                    <h3 className="font-heading font-bold text-lg mb-5">Accesos rápidos</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {
                            navbar.map((nav) => (
                                nav.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.module.key}
                                            to={`/${item.module.key}`}
                                            data-testid={item.testId}
                                            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`min-w-12 min-h-12 rounded-full! flex items-center justify-center ${ICON_TONE[item.tone]}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium text-sm capitalize truncate">{item.module.label}</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                                        </Link>
                                    )
                                })
                            ))
                        }
                    </div>
                </div>
            </section>
        </>
    )
}
