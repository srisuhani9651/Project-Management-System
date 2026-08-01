import * as React from "react"
import { Button } from "@/components/ui/button"

function AlertDialog({ open, onOpenChange, title, description, confirmText = "Confirm", cancelText = "Cancel", onConfirm, variant = "destructive" }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="space-y-2">
          <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="sm"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { AlertDialog }
