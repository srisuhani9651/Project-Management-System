import React from "react"
import { Calendar, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PriorityBadge } from "@/components/common/PriorityBadge"
import { PermissionButton } from "@/components/common/PermissionButton"

export function BoardView({ tasks = [], onUpdateTaskStatus, onCreateTask }) {
  const columns = [
    { id: "To Do", label: "To Do", color: "bg-muted/80 text-foreground" },
    { id: "In Progress", label: "In Progress", color: "bg-blue-500/10 text-blue-600" },
    { id: "Done", label: "Done", color: "bg-emerald-500/10 text-emerald-600" },
  ]

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="pt-2 space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Kanban Board — Select status dropdown on any card to move between columns.
        </p>
        <PermissionButton
          action="create"
          resource="task"
          size="sm"
          onClick={onCreateTask}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" /> Add Task
        </PermissionButton>
      </div>

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => {
            const status = (t.status || "").toLowerCase()
            if (column.id === "To Do") return status === "to do" || status === "todo"
            if (column.id === "In Progress") return status === "in progress"
            if (column.id === "Done") return status === "done" || status === "completed"
            return false
          })

          return (
            <div
              key={column.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs min-h-[450px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${column.color}`}>
                    {column.label}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">{columnTasks.length}</span>
                </div>
              </div>

              {/* Task Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border border-border/80 bg-card hover:shadow-md transition-all p-4 space-y-3 rounded-xl"
                    >
                      {/* Title & Priority */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-foreground leading-snug">{task.name}</h4>
                        <PriorityBadge priority={task.priority} />
                      </div>

                      {/* Description snippet */}
                      {task.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Assignee & Due Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                              {getInitials(task.assignee || "Suhani")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[90px]">
                            {task.assignee || "Suhani"}
                          </span>
                        </div>

                        {task.dueDate && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {task.dueDate}
                          </span>
                        )}
                      </div>

                      {/* Status Dropdown Switcher */}
                      <div className="pt-1">
                        <select
                          value={
                            (task.status || "").toLowerCase().includes("done") ||
                            (task.status || "").toLowerCase().includes("completed")
                              ? "Done"
                              : (task.status || "").toLowerCase().includes("progress")
                              ? "In Progress"
                              : "To Do"
                          }
                          onChange={(e) => onUpdateTaskStatus(task.id, e.target.value)}
                          className="w-full text-[11px] font-semibold h-7 rounded-md border border-input bg-muted/40 px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="To Do">Status: To Do</option>
                          <option value="In Progress">Status: In Progress</option>
                          <option value="Done">Status: Done</option>
                        </select>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                    No tasks in {column.label}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BoardView
