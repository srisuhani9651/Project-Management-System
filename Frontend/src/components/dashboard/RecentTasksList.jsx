import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  History,
  PlusCircle,
  RefreshCw,
  Calendar,
  User,
  ChevronRight,
  Sparkles,
  Clock
} from "lucide-react"
import { PriorityBadge } from "@/components/common/PriorityBadge"
import { StatusBadge } from "@/components/common/StatusBadge"
import { useProject } from "@/context/ProjectContext"

/**
 * RecentTasksList Component
 * Displays recently created or updated tasks by the logged-in user and team.
 */
export function RecentTasksList({ recentData, recentTasks = [], title = "Recent Tasks" }) {
  const navigate = useNavigate()
  const { user } = useProject()
  const [filter, setFilter] = useState("all")

  const currentUserId = user?.id || user?.user_id || ""
  const currentUserName = (user?.fullName || user?.full_name || "").toLowerCase()

  const tasksList = recentData?.tasks || recentTasks || []

  // Filter logic
  const filteredTasks = tasksList.filter((task) => {
    if (filter === "created") return (task.action || "").toLowerCase() === "created"
    if (filter === "updated") return (task.action || "").toLowerCase() === "updated"
    if (filter === "mine") {
      const creatorId = task.creator_id || ""
      const creatorName = (task.creator_name || "").toLowerCase()
      return (
        (currentUserId && creatorId === currentUserId) ||
        (currentUserName && creatorName.includes(currentUserName))
      )
    }
    return true
  })

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card hover:shadow-md transition-all space-y-4 w-full h-full font-roboto">

      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <History className="h-4 w-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-poppins text-sm font-semibold text-foreground">{title}</h3>
              <span className="font-poppins px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                {tasksList.length} Recent
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Tasks recently modified in database</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "mine", label: "By Me" },
            { id: "created", label: "Created" },
            { id: "updated", label: "Updated" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${filter === tab.id
                  ? "bg-card text-foreground shadow-xs border border-border/50 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Feed */}
      <div className="space-y-2.5 my-auto overflow-y-auto max-h-[300px] pr-1">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <Sparkles className="h-8 w-8 text-muted-foreground/40 stroke-[1.5]" />
            <p className="font-poppins text-xs font-semibold text-foreground">No recent activity matching filter</p>
            <p className="text-[11px] text-muted-foreground">Create or edit a task to see recent activity here.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCreated = (task.action || "").toLowerCase() === "created"
            const taskKey = task.id || task.task_id

            return (
              <div
                key={taskKey}
                onClick={() => navigate(`/tasks/${taskKey}`)}
                className="group flex items-start justify-between gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-card hover:border-blue-500/30 transition-all shadow-xs cursor-pointer"
              >
                {/* Left Action Icon + Title */}
                <div className="flex items-start gap-3 min-w-0 flex-1">

                  {/* Action Badge Icon */}
                  <div
                    className={`mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border ${isCreated
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                      }`}
                    title={isCreated ? "Recently Created Task" : "Recently Updated Task"}
                  >
                    {isCreated ? (
                      <PlusCircle className="h-3.5 w-3.5" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">

                    {/* Header Row: Title & Action Tag */}
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate">
                        {task.title || task.name}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider shrink-0 ${isCreated
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                          }`}
                      >
                        {isCreated ? "Created" : "Updated"}
                      </span>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      {/* Project Name */}
                      <span className="font-medium bg-muted px-2 py-0.5 rounded-md text-muted-foreground truncate max-w-[120px]">
                        {task.projectName || "Project"}
                      </span>

                      {/* Status */}
                      <StatusBadge status={task.status} />

                      {/* Priority */}
                      <PriorityBadge priority={task.priority} />

                      {/* Creator User */}
                      {task.creator_name && (
                        <span className="text-muted-foreground flex items-center gap-1 font-medium">
                          <User className="h-3 w-3 text-blue-500" />
                          {task.creator_name}
                        </span>
                      )}

                      {/* Timestamp */}
                      {task.formatted_time && (
                        <span className="text-muted-foreground flex items-center gap-1 font-medium ml-auto">
                          <Clock className="h-3 w-3 text-muted-foreground/70" />
                          {task.formatted_time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Arrow Navigation */}
                <div className="p-1 rounded-lg text-muted-foreground group-hover:text-foreground shrink-0 mt-0.5">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
        <span className="text-[11px] text-muted-foreground">
          Showing {filteredTasks.length} recent activities
        </span>
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

export default RecentTasksList
