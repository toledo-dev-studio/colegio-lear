import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { QUICK_ACCESS_NAVBAR } from "@/lib/constants/navbar.constant";
import { filterNavbarByPermissions } from "@/lib/helpers/navbar.helper";
import { cn } from "@/lib/extensions/utils";

export const QuickAccess = () => {
    const { permissions } = useAuthStore();
    const navbar = filterNavbarByPermissions(QUICK_ACCESS_NAVBAR, permissions);

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
                                            to={`/${item.module.key}`}
                                            data-testid={item.testId}
                                            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Icon className={cn("w-5 h-5", item.colorClass)} />
                                                <span className="font-medium text-sm capitalize">{item.module.label}</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
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
