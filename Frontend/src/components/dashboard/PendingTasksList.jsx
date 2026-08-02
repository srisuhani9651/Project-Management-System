import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  CheckCircle,
  CircleDot,
  Calendar
} from "lucide-react"

/**
 * PendingTasksList Component
 * Refined font weights: Poppins for titles, Roboto for item content.
 */
export function PendingTasksList({ tasks = [], onToggleTaskStatus, title = "Pending Tasks" }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")

  const defaultTasks = [
    {
      id: "task-101",
      title: "Design dynamic analytics wireframes & color system",
      projectName: "Project management",
      projectKey: "PRO",
      status: "In Progress",
      priority: "High",
      dueDate: "Today, 5:00 PM",
      urgent: true,
    },
    {
      id: "task-102",
      title: "Integrate JWT token authentication & policy check logic",
      projectName: "Inventory Management",
      projectKey: "INV",
      status: "To Do",
      priority: "Medium",
      dueDate: "Tomorrow",
      urgent: false,
    },
    {
      id: "task-103",
      title: "Optimize SVG pie chart responsiveness & legend tooltips",
      projectName: "New Web Application",
      projectKey: "NEW",
      status: "In Progress",
      priority: "Low",
      dueDate: "Aug 5, 2026",
      urgent: false,
    },
    {
      id: "task-104",
      title: "Set up monthly productivity calculations API schema",
      projectName: "Project management",
      projectKey: "PRO",
      status: "To Do",
      priority: "High",
      dueDate: "Aug 6, 2026",
      urgent: true,
    },
  ]

  const displayTasks = tasks.length > 0 ? tasks : defaultTasks

  const pendingTasks = displayTasks.filter((t) => {
    const status = (t.status || "").toLowerCase()
    return status !== "done" && status !== "completed"
  })

  const filteredTasks = pendingTasks.filter((t) => {
    const status = (t.status || "").toLowerCase()
    const priority = (t.priority || "").toLowerCase()
    if (filter === "todo") return status === "to do" || status === "todo"
    if (filter === "in_progress") return status.includes("progress")
    if (filter === "high_priority") return priority === "high" || priority === "urgent" || t.urgent
    return true
  })

  const priorityBadgeStyle = (priority) => {
    const p = (priority || "").toLowerCase()
    if (p === "high" || p === "urgent") return "bg-rose-500/10 text-rose-600 border-rose-500/20"
    if (p === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    return "bg-blue-500/10 text-blue-600 border-blue-500/20"
  }

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card hover:shadow-md transition-all space-y-4 w-full h-full font-roboto">
      
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-poppins text-sm font-semibold text-foreground">{title}</h3>
              <span className="font-poppins px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                {pendingTasks.length} Pending
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Tasks requiring your attention</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "in_progress", label: "In Progress" },
            { id: "todo", label: "To Do" },
            { id: "high_priority", label: "High Priority" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                filter === tab.id
                  ? "bg-card text-foreground shadow-xs border border-border/50 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-2.5 my-auto overflow-y-auto max-h-[300px] pr-1">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 stroke-[1.5]" />
            <p className="font-poppins text-xs font-semibold text-foreground">No pending tasks matching this filter!</p>
            <p className="text-[11px] text-muted-foreground">You are all caught up.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = (task.status || "").toLowerCase() === "done"
            return (
              <div
                key={task.id || task.task_id}
                className="group flex items-start justify-between gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-card hover:border-blue-500/30 transition-all shadow-xs"
              >
                {/* Left check trigger & title details */}
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleTaskStatus && onToggleTaskStatus(task)}
                    className="mt-0.5 text-muted-foreground hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                    title="Mark as completed"
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <CircleDot className="h-5 w-5 text-muted-foreground hover:text-emerald-600" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-medium text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                      {task.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      {/* Project Tag */}
                      <span className="font-medium bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                        {task.projectName || task.projectKey || "Project"}
                      </span>

                      {/* Priority Tag */}
                      <span className={`font-semibold px-2 py-0.5 rounded-md border ${priorityBadgeStyle(task.priority)}`}>
                        {task.priority || "Medium"}
                      </span>

                      {/* Due Date */}
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${task.urgent ? "text-rose-600 font-semibold" : "text-muted-foreground"}`}>
                          <Calendar className="h-3 w-3" />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Button */}
                <button
                  type="button"
                  onClick={() => navigate(`/tasks/${task.id || task.task_id || ""}`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  title="View Details"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Footer link */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
        <span className="text-[11px] text-muted-foreground">Showing {filteredTasks.length} pending items</span>
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="font-poppins text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          View All Tasks <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  )
}

export default PendingTasksList
