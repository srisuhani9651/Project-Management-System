import React from "react"
import { Badge } from "@/components/ui/badge"

export function PriorityBadge({ priority }) {
  const normalized = (priority || "").toLowerCase()

  if (normalized === "high") {
    return <Badge variant="destructive">High</Badge>
  }
  if (normalized === "medium") {
    return <Badge variant="warning">Medium</Badge>
  }
  return <Badge variant="outline">Low</Badge>
}

export default PriorityBadge
