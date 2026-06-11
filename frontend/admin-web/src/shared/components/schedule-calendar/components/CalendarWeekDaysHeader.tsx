import { DAY_OF_WEEKS } from "@/interfaces/entites/academic-cycle-group-school-subject-calendar";

export const CalendarWeekDaysHeader = () => {
    return (
        <>
            {/* Day headers */}
            <div className="flex sticky top-0 z-10">
                <div className="w-16 bg-muted/30 flex-shrink-0 border-b border-border" />
                {
                    DAY_OF_WEEKS.map((d) => (
                        <div key={d.key} className="min-w-[160px] bg-muted/30 flex-1 text-center py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-l border-border border-b" data-testid={`dyn-day-header-${d.key}`}>
                            {d.label}
                        </div>
                    ))
                }
            </div>
        </>
    )
}
