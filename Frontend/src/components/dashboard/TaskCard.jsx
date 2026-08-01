import React from "react"
import { Calendar, Tag } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TaskCard({ task }) {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "done":
        return <Badge variant="success">Completed</Badge>
      case "in progress":
        return <Badge variant="info">In Progress</Badge>
      default:
        return <Badge variant="secondary">Todo</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="warning">Medium</Badge>
      default:
        return <Badge variant="outline">Low</Badge>
    }
  }

  return (
    <Card className="border border-border/70 bg-card hover:shadow-sm transition-all p-3.5 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-primary tracking-wider uppercase flex items-center gap-1">
            <Tag className="h-3 w-3" /> {task.projectKey || "TASK"}
          </span>
          <h4 className="text-xs font-semibold text-foreground leading-snug">{task.name}</h4>
        </div>
        {getPriorityBadge(task.priority)}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
        {getStatusBadge(task.status)}
        {task.dueDate && (
          <span className="text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {task.dueDate}
          </span>
        )}
      </div>
    </Card>
  )
}

export default TaskCard
