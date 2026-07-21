import { useNavigate } from "react-router";
import { Megaphone } from "lucide-react";

import { KpiCard } from "@/shared/components/kpi-card/KpiCard";
import { SectionHeader } from "@/modules/dashboard/components/SectionHeader";
import { AnnouncementsViewedPercentageCard } from "./AnnouncementsViewedPercentageCard";
import { useGetAnnouncementsSummary } from "@/modules/dashboard/hooks/useGetAnnouncementsSummary"

export const AnnouncementsSummary = () => {
    // Components hooks and stores
    const navigate = useNavigate();
    const { data, isFetching } = useGetAnnouncementsSummary();

    return (
        <>
            <section data-testid="dash-announcement-summary">
                <SectionHeader label="Resumen de campañas" tone="emerald" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <KpiCard
                        label="Comunicados & campañas activas"
                        value={data?.activeAnnouncementsCount ?? 0}
                        icon={Megaphone}
                        tone="sky"
                        hint="Publicaciones dentro de su fecha de vigencia"
                        loading={isFetching}
                        testid="dash-announcements-active"
                        onArrowUpClick={() => navigate("/announcements")} />
                    <AnnouncementsViewedPercentageCard
                        value={data?.viewedPercentage}
                        loading={isFetching} />
                </div>
            </section>
        </>
    )
}
