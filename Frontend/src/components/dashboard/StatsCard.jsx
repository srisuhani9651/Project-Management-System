import React from "react"
import { Card, CardContent } from "@/components/ui/card"

export function StatsCard({ icon: Icon, title, count, trend, iconColor = "bg-primary/10 text-primary", onClick }) {
  return (
    <Card
      onClick={onClick}
      className={`border border-border/70 bg-card shadow-xs transition-all duration-200 rounded-xl ${
        onClick ? "cursor-pointer hover:shadow-md hover:border-primary/40 hover:scale-[1.02] active:scale-[0.99]" : ""
      }`}
    >
      <CardContent className="p-4 sm:p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{count}</p>
          {trend ? (
            <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">{trend}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground opacity-0">Placeholder</p>
          )}
        </div>
        <div className={`h-11 w-11 rounded-xl ${iconColor} flex items-center justify-center shrink-0 shadow-inner border border-primary/10`}>
          {Icon && <Icon className="h-5.5 w-5.5" />}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatsCard
