import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

/**
 * CustomSelect Component
 * Ultra-modern, elegant custom dropdown selector with floating animated menu,
 * hover highlights, selected checkmark indicators, and click-outside dismissal.
 */
export function CustomSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select option...",
  disabled = false,
  error = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Find selected item object
  const selectedOption = options.find((opt) => {
    const val = opt.id !== undefined ? opt.id : opt.value
    return String(val) === String(value)
  })

  const selectedLabel = selectedOption
    ? selectedOption.name || selectedOption.label
    : placeholder

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    const optionVal = option.id !== undefined ? option.id : option.value
    if (onChange) {
      // Pass synthetic-like event or direct value
      onChange({ target: { name: containerRef.current?.getAttribute("data-name"), value: optionVal } })
    }
    setIsOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full font-roboto ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-xl border bg-muted/20 px-3.5 text-xs font-medium transition-all shadow-xs cursor-pointer focus:outline-none ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20 bg-card"
            : error
            ? "border-rose-500 bg-rose-500/5 text-rose-600"
            : "border-border/70 hover:border-blue-500/40 hover:bg-card text-foreground"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className={`truncate ${!selectedOption ? "text-muted-foreground/70" : "text-foreground"}`}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-1.5 shadow-xl animate-fade-in font-roboto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              No options available
            </div>
          ) : (
            options.map((opt, idx) => {
              const optVal = opt.id !== undefined ? opt.id : opt.value
              const isSelected = String(optVal) === String(value)
              const optLabel = opt.name || opt.label

              return (
                <div
                  key={optVal || idx}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-500/10 text-blue-600 font-semibold"
                      : "text-foreground hover:bg-muted/70 hover:text-blue-600"
                  }`}
                >
                  <span className="truncate">{optLabel}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default CustomSelect
