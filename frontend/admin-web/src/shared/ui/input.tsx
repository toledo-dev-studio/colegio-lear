import * as React from "react"

import { cn } from "@/lib/extensions/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-full border border-input bg-transparent disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80 px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "pill-input w-full px-8",
        className
      )}
      {...props}
    />
  )
}

export { Input }
