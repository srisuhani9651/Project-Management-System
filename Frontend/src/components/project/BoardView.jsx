import React from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Inbox, CheckCircle2, Clock, MoreHorizontal } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PriorityBadge } from "@/components/common/PriorityBadge"
import { CustomSelect } from "@/components/ui/custom-select"
import { useProject } from "@/context/ProjectContext"

/**
 * Modern BoardView Component
 * Integrated with CustomSelect and Dashboard font styling.
 */
export function BoardView({ tasks = [], onUpdateTaskStatus }) {
  const navigate = useNavigate()
  const { user, authorize } = useProject()

  const columns = [
    {
      id: "To Do",
      label: "To Do",
      headerClass: "bg-muted/80 text-foreground border-muted/80",
      emptyIcon: <Inbox className="h-10 w-10 text-muted-foreground/30" />,
    },
    {
      id: "In Progress",
      label: "In Progress",
      headerClass: "bg-blue-600 text-white border-blue-600 font-semibold",
      emptyIcon: <Clock className="h-10 w-10 text-muted-foreground/30" />,
    },
    {
      id: "Done",
      label: "Done",
      headerClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold",
      emptyIcon: <CheckCircle2 className="h-10 w-10 text-muted-foreground/30" />,
    },
  ]

  const statusOptions = [
    { id: "To Do", name: "Status: To Do" },
    { id: "In Progress", name: "Status: In Progress" },
    { id: "Done", name: "Status: Done" },
  ]

  const getInitials = (name) => {
    if (!name) return "U"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
  }

  const getAvatarColor = (name = "") => {
    const colors = ["bg-blue-600", "bg-violet-600", "bg-indigo-600", "bg-pink-600", "bg-amber-600"]
    const idx = name.charCodeAt(0) % colors.length
    return colors[idx]
  }

  return (
    <div className="pt-2 space-y-4 animate-fade-in font-roboto">

      {/* Info Bar */}
      <p className="text-xs text-muted-foreground font-medium">
        Kanban Board — Manage task status columns and workflow execution.
      </p>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => {
            const s = (t.status || "").toLowerCase()
            if (column.id === "To Do") return s === "to do" || s === "todo"
            if (column.id === "In Progress") return s === "in progress"
            if (column.id === "Done") return s === "done" || s === "completed"
            return false
          })

          return (
            <div
              key={column.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-xs min-h-[420px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-poppins font-semibold border ${column.headerClass}`}>
                    {column.label}
                  </span>
                  <span className="font-poppins text-xs font-semibold text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/60 cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => {
                    const currentStatusVal =
                      (task.status || "").toLowerCase().includes("done") ||
                      (task.status || "").toLowerCase().includes("completed")
                        ? "Done"
                        : (task.status || "").toLowerCase().includes("progress")
                        ? "In Progress"
                        : "To Do"

                    const canEdit = authorize ? authorize(user, "update", "task", task) : true

                    return (
                      <Card
                        key={task.task_id || task.id}
                        onClick={() => navigate(`/tasks/${task.task_id || task.id}`)}
                        className="border border-border/70 bg-card hover:border-blue-500/40 hover:shadow-md transition-all p-4 space-y-3 rounded-xl cursor-pointer group"
                      >
                        {/* Title + Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-poppins text-xs font-semibold text-foreground leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                            {task.name || task.title}
                          </h4>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        {/* Assignee + Due Date */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={`text-[10px] font-bold text-white ${getAvatarColor(task.assignee)}`}>
                                {getInitials(task.assignee || "User")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[90px]">
                              {task.assignee || "Unassigned"}
                            </span>
                          </div>

                          {task.dueDate && (
                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {task.dueDate}
                            </span>
                          )}
                        </div>

                        {/* Custom Select Status Dropdown */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <CustomSelect
                            disabled={!canEdit}
                            options={statusOptions}
                            value={currentStatusVal}
                            onChange={(e) => canEdit && onUpdateTaskStatus(task.id || task.task_id, e.target.value)}
                          />
                        </div>
                      </Card>
                    )
                  })
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border/60 rounded-xl bg-muted/10 h-full min-h-[280px]">
                    {column.emptyIcon}
                    <p className="text-xs text-muted-foreground font-medium">
                      No tasks in {column.label}
                    </p>
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
