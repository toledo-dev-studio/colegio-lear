import * as React from "react";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";

import { es } from "date-fns/locale";
import { cn } from "@/lib/extensions/utils";
import { Calendar } from "@/shared/shadcn/ui/calendar";
import { useFormPermission } from "../form/FormPermissionContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/shadcn/ui/popover";

interface Props {
    value?: string; // ISO string
    onChange: (value?: string) => void;
    placeholder?: string;
    disabled?: boolean;
    minDate?: string; // ISO string
    maxDate?: string; // ISO string
}

export const DatePicker = (props: Props) => {
    const [open, setOpen] = React.useState(false)
    const dateValue = props.value ? new Date(props.value) : undefined;
    const { disabled } = useFormPermission();

    const toLocalDay = (value: string): Date => {
        const [year, month, day] = value.slice(0, 10).split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const disabledDates = [
        ...(props.minDate ? [{ before: toLocalDay(props.minDate) }] : []),
        ...(props.maxDate ? [{ after: toLocalDay(props.maxDate) }] : []),
    ];
    
    return (
        <>
            <div className="w-full relative">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger disabled={props.disabled || disabled} className="w-full relative cursor-not-allowed">
                        <span
                            className={
                                cn(
                                    "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                                    "border-border bg-transparent hover:bg-transparent hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
                                    "justify-start font-normal w-full h-12 rounded-full cursor-pointer pl-8 pr-10",
                                    !props.value && "text-muted-foreground hover:text-muted-foreground",
                                    (props.disabled || disabled) && "bg-input/50 hover:bg-input/50 dark:bg-input/80 dark:hover:bg-input/80 opacity-50 pointer-events-none"
                                )}
                        >
                            {props.value ? format(props.value, "yyyy/MM/dd") : props.placeholder}
                        </span>
                        <CalendarClock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </PopoverTrigger>

                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            className="rounded-lg border"
                            locale={es}
                            disabled={props.disabled || disabled || disabledDates}
                            captionLayout="dropdown"
                            selected={dateValue}
                            onSelect={(date) => {
                                props.onChange(date ? date.toISOString() : undefined)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </>
    )
}
