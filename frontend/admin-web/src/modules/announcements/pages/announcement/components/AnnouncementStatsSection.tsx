import { Users, Eye } from "lucide-react";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";

interface Props {
  recipientsCount: number;
  viewedCount: number;
}

/**
 * Read-only statistics section shown inside the announcement edit form.
 * Displays how many people the campaign was assigned to (universe),
 * how many have actually read it, and a progress bar with the ratio.
 */
export const AnnouncementStatsSection = ({ recipientsCount, viewedCount }: Props) => {
  const safeRecipients = Math.max(0, recipientsCount ?? 0);
  const rawViewed = viewedCount ?? 0;
  const cap = safeRecipients > 0 ? safeRecipients : rawViewed;
  const safeViewed = Math.max(0, Math.min(rawViewed, cap));
  const percentage = safeRecipients > 0 ? Math.min(100, (safeViewed / safeRecipients) * 100) : 0;
  const pctLabel = `${percentage.toFixed(1)}%`;

  return (
    <section data-testid="an-form-stats" className="border-b border-border pb-5">

      <SectionTitle
        title="ESTADÍSTICAS DE VISUALIZACIÓN"
        description="Detalle de visualizaciones de la campaña - Solo lectura." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-md" data-testid="an-form-stats-recipients">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Personas asignadas</p>
            <p className="font-heading text-2xl font-bold text-foreground mt-0.5" data-testid="an-form-stats-recipients-value">
              {safeRecipients.toLocaleString("es-MX")}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Universo inicial de la campaña</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-md" data-testid="an-form-stats-viewed">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-600 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Personas que la vieron</p>
            <p className="font-heading text-2xl font-bold text-foreground mt-0.5" data-testid="an-form-stats-viewed-value">
              {safeViewed.toLocaleString("es-MX")}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Lecturas registradas hasta ahora</p>
          </div>
        </div>
      </div>

      <div className="mt-5" data-testid="an-form-stats-progress">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progreso de visualizaciones</span>
          <span className="text-sm font-heading font-bold text-primary" data-testid="an-form-stats-progress-percentage">
            {pctLabel}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-linear-to-r from-primary/90 to-primary transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
            data-testid="an-form-stats-progress-bar"
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          {safeViewed.toLocaleString("es-MX")} de {safeRecipients.toLocaleString("es-MX")} personas han visto esta
          campaña.
        </p>
      </div>
    </section>
  );
}
