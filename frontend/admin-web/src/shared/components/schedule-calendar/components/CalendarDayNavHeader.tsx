import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/shadcn/ui/button";

interface Props {
    dayLabel: string;
    canGoPrevious: boolean;
    canGoNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

export const CalendarDayNavHeader = ({ dayLabel, canGoPrevious, canGoNext, onPrevious, onNext }: Props) => {
    return (
        <div className="flex sticky top-0 z-10">
            <div className="w-16 bg-muted/30 shrink-0 border-b border-border" />
            <div className="flex-1 bg-muted/30 border-b border-border flex items-center justify-center gap-x-4 py-1" data-testid="dyn-day-nav-header">
                <Button type="button" variant="ghost" size="sm" disabled={!canGoPrevious} onClick={onPrevious} aria-label="Día anterior">
                    <ChevronLeft />
                </Button>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {dayLabel}
                </span>
                <Button type="button" variant="ghost" size="sm" disabled={!canGoNext} onClick={onNext} aria-label="Día siguiente">
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
};
