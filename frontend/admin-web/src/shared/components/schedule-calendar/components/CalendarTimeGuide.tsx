import { minutesToHHMM } from "../lib/schedule-calendar";
import { DAY_START_MIN, SLOT_MIN, SLOT_PX, TOTAL_SLOTS } from "../lib/schedule-calendar-consts";

export const CalendarTimeGuide = () => {
    return (
        <>
            <div className="w-16 shrink-0 border-r border-border bg-muted/20">
                {
                    Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
                        const m = DAY_START_MIN + i * SLOT_MIN;
                        const onHour = m % 60 === 0;
                        return (
                            <div key={i} className="relative" style={{ height: SLOT_PX }}>
                                {onHour && (
                                    <span className="absolute top-2 left-2 right-0 text-[10px] text-muted-foreground font-mono">
                                        {minutesToHHMM(m)}
                                    </span>
                                )}
                            </div>
                        );
                    })
                }
            </div>
        </>
    )
}
