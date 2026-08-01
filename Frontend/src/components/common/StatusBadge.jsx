import React from "react"
import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase()

  if (normalized === "completed" || normalized === "done") {
    return <Badge variant="success">Done</Badge>
  }
  if (normalized === "in progress") {
    return <Badge variant="info">In Progress</Badge>
  }
  return <Badge variant="secondary">To Do</Badge>
}

export default StatusBadge
