import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function EmptyState({
  icon: Icon,
  heading,
  description,
  actionText,
  onAction,
  actionComponent: ActionComponent,
}) {
  return (
    <Card className="border border-dashed border-border/80 bg-card/50 shadow-sm rounded-2xl py-12 px-6 text-center">
      <CardContent className="max-w-md mx-auto flex flex-col items-center justify-center space-y-4">
        {Icon && (
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <Icon className="h-8 w-8" />
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight text-foreground">{heading}</h3>
          {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
        </div>

        {ActionComponent ? (
          <div className="pt-2">{ActionComponent}</div>
        ) : actionText && onAction ? (
          <div className="pt-2">
            <Button onClick={onAction} size="sm" className="gap-1.5 font-semibold shadow-md px-5">
              {actionText}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default EmptyState
