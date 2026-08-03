import React from "react"
import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status, className = "" }) {
  const normalized = (status || "").toLowerCase().trim()

  if (normalized === "completed" || normalized === "done") {
    return <Badge variant="success" className={className}>Completed</Badge>
  }
  if (normalized === "in progress") {
    return <Badge variant="info" className={className}>In Progress</Badge>
  }
  return <Badge variant="secondary" className={className}>Todo</Badge>
}

export default StatusBadge
