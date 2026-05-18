import * as React from "react"
import { format } from "date-fns"

import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/popover"
import { es } from "date-fns/locale"
import { CalendarClock, Search } from "lucide-react"
import { cn } from "@/lib/extensions/utils"

interface Props {
    value?: string // ISO string
    onChange: (value?: string) => void
    placeholder?: string
}

export function CustomDatePicker({ value, onChange, placeholder = "Selecciona una fecha" }: Props) {
    const [open, setOpen] = React.useState(false)
    const dateValue = value ? new Date(value) : undefined
    return (
        <>
            <div className="w-full relative">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger className="w-full relative">
                        <span
                            className={
                                cn(
                                    "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                                    "border-border bg-transparent hover:bg-transparent hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
                                    "justify-start font-normal w-full h-12 rounded-full cursor-pointer px-10",
                                    !value && "text-muted-foreground hover:text-muted-foreground"
                                )}
                        >
                            {value ? format(value, "yyyy/MM/dd") : placeholder}
                        </span>
                        <CalendarClock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </PopoverTrigger>

                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            className="rounded-lg border"
                            locale={es}
                            captionLayout="dropdown"
                            selected={dateValue}
                            onSelect={(date) => {
                                onChange(date ? date.toISOString() : undefined)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </>
    )
}
