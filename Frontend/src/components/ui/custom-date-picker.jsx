import React, { useRef } from "react"
import { Calendar as CalendarIcon } from "lucide-react"

/**
 * CustomDatePicker Component
 * Modern, elegant date picker wrapper featuring formatted date badges,
 * calendar icon triggers, and clean focus states.
 */
export function CustomDatePicker({
  value = "",
  onChange,
  name = "date",
  disabled = false,
  error = false,
  className = "",
  min,
  max,
}) {
  const inputRef = useRef(null)

  // Format date string for user friendly badge display e.g. "Aug 2, 2026"
  const getFormattedDate = (val) => {
    if (!val) return "Select date"
    try {
      const d = new Date(val + "T00:00:00")
      if (isNaN(d.getTime())) return val
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return val
    }
  }

  const handleContainerClick = () => {
    if (disabled) return
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === "function") {
        inputRef.current.showPicker()
      } else {
        inputRef.current.focus()
      }
    }
  }

  return (
    <div className={`relative w-full font-roboto ${className}`}>
      {/* Visual Trigger Box */}
      <div
        onClick={handleContainerClick}
        className={`flex h-10 w-full items-center justify-between rounded-xl border bg-muted/20 px-3.5 text-xs font-medium transition-all shadow-xs cursor-pointer ${
          error
            ? "border-rose-500 bg-rose-500/5 text-rose-600"
            : "border-border/70 hover:border-blue-500/40 hover:bg-card text-foreground"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className={`truncate font-medium ${!value ? "text-muted-foreground/70" : "text-foreground"}`}>
          {getFormattedDate(value)}
        </span>

        <div className="flex items-center gap-1 text-muted-foreground group-hover:text-blue-600">
          <CalendarIcon className="h-4 w-4 stroke-[1.8]" />
        </div>
      </div>

      {/* Hidden Native Input overlaid transparently for full native calendar popup support */}
      <input
        ref={inputRef}
        type="date"
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        min={min}
        max={max}
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer pointer-events-auto"
      />
    </div>
  )
}

export default CustomDatePicker
