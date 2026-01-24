"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/70 backdrop-blur-xl",
        "border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-4",
        className
      )}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        className="p-2"
        classNames={{
          months: "flex flex-col sm:flex-row gap-4",
          month: "space-y-4",

          caption: "flex justify-center pt-2 relative items-center",
          caption_label:
            "text-sm font-medium text-neutral-700 tracking-wide",

          nav: "flex items-center gap-1",
          nav_button: cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-8 rounded-full bg-white/60 hover:bg-white/90 transition"
          ),

          table: "w-full border-collapse",
          head_row: "grid grid-cols-7",
          head_cell:
            "w-9 text-center text-xs font-medium text-neutral-400",

          row: "grid grid-cols-7",

          cell: "w-9 h-9 flex items-center justify-center",

          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 rounded-full font-normal text-neutral-700",
            "hover:bg-neutral-200/60 transition-all duration-200"
          ),

          day_selected:
            "bg-[#6B7CFF]/90 text-white hover:bg-[#6B7CFF] focus:bg-[#6B7CFF]",

          day_today:
            "bg-[#EDEEFF] text-[#4B5CFF] font-medium",

          day_outside:
            "text-neutral-300 aria-selected:bg-transparent aria-selected:text-neutral-300",

          day_disabled: "text-neutral-300 opacity-50",

          day_hidden: "invisible",

          ...classNames,
        }}
        {...props}
      />
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
