import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
  const [selectedTab, setSelectedTab] = React.useState(defaultValue || "")
  const current = value !== undefined ? value : selectedTab

  const handleTabChange = (val) => {
    if (value === undefined) setSelectedTab(val)
    if (onValueChange) onValueChange(val)
  }

  return (
    <div ref={ref} className={cn("w-full space-y-4", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null
        return React.cloneElement(child, { current, onTabChange: handleTabChange })
      })}
    </div>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, current, onTabChange, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground border border-border/40",
      className
    )}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return null
      return React.cloneElement(child, { current, onTabChange })
    })}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, current, onTabChange, children, ...props }, ref) => {
  const isSelected = current === value
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onTabChange && onTabChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-background text-foreground shadow-xs"
          : "hover:bg-background/50 hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, current, children, ...props }, ref) => {
  if (current !== value) return null
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none animate-in fade-in-50 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
