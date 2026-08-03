import React from "react"
import { Badge } from "@/components/ui/badge"

export function PriorityBadge({ priority, className = "" }) {
  const normalized = (priority || "").toLowerCase().trim()

  if (normalized === "high" || normalized === "urgent") {
    return <Badge variant="destructive" className={className}>High</Badge>
  }
  if (normalized === "medium") {
    return <Badge variant="warning" className={className}>Medium</Badge>
  }
  return <Badge variant="outline" className={className}>Low</Badge>
}

export default PriorityBadge
