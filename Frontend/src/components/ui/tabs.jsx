import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext({
  current: "",
  onTabChange: () => {},
})

const Tabs = React.forwardRef(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
  const [selectedTab, setSelectedTab] = React.useState(defaultValue || "")
  const current = value !== undefined ? value : selectedTab

  const handleTabChange = React.useCallback(
    (val) => {
      if (value === undefined) setSelectedTab(val)
      if (onValueChange) onValueChange(val)
    },
    [value, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ current, onTabChange: handleTabChange }}>
      <div ref={ref} className={cn("w-full space-y-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground border border-border/40",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, children, onClick, ...props }, ref) => {
  const { current, onTabChange } = React.useContext(TabsContext)
  const isSelected = current === value

  const handleClick = (e) => {
    if (onClick) onClick(e)
    if (onTabChange) onTabChange(value)
  }

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? "active" : "inactive"}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
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

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { current } = React.useContext(TabsContext)
  if (current !== value) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      data-state="active"
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
