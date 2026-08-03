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
  Clock,
  Search,
} from "lucide-react"
import { PriorityBadge } from "@/components/common/PriorityBadge"
import { StatusBadge } from "@/components/common/StatusBadge"

/**
 * Modern RecentTasksList Component
 * Features top-right search & live sync indicator in the header,
 * plus Jira/Linear neutral palette & right-side task summary column.
 */
export function RecentTasksList({ recentData, recentTasks = [], title = "Recent Tasks" }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  const tasksList = recentData?.tasks || recentTasks || []

  const filteredTasks = tasksList.filter((task) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const tTitle = (task.title || task.name || "").toLowerCase()
    const tProj = (task.projectName || task.project_name || "").toLowerCase()
    const tUser = (task.assignee || task.creator_name || task.assigned_to || "").toLowerCase()
    const tStatus = (task.status || "").toLowerCase()
    return tTitle.includes(q) || tProj.includes(q) || tUser.includes(q) || tStatus.includes(q)
  })

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card hover:shadow-xs transition-all space-y-4 w-full h-full font-roboto">

      {/* Header Row: Left Title & Right Search / Sync Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        {/* Left: Title & Subtitle */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <History className="h-4 w-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-poppins text-sm font-bold text-foreground">{title}</h3>
              <span className="font-poppins px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE]">
                {tasksList.length} Recent
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-normal">Tasks recently modified in database</p>
          </div>
        </div>

        {/* Right Header Area: Search Bar & Live Sync Badge */}
        <div className="flex items-center gap-2.5">
          {/* Recent Task Search Bar */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search recent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full sm:w-44 rounded-xl border border-border/70 bg-muted/20 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-card transition-all"
            />
          </div>

          {/* Live Sync Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] text-[10px] font-bold shrink-0 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] animate-pulse"></span>
            <span>Live Sync</span>
          </div>
        </div>
      </div>

      {/* Task Feed */}
      <div className="space-y-3 my-auto overflow-y-auto max-h-[320px] pr-1">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <Sparkles className="h-8 w-8 text-muted-foreground/40 stroke-[1.5]" />
            <p className="font-poppins text-xs font-semibold text-foreground">No matching recent tasks</p>
            <p className="text-[11px] text-muted-foreground">Try adjusting your search query above.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCreated = (task.action || "").toLowerCase() === "created"
            const taskKey = task.id || task.task_id
            const assigneeName = task.assignee || task.creator_name || task.assigned_to

            return (
              <div
                key={taskKey}
                onClick={() => navigate(`/tasks/${taskKey}`)}
                className="group flex items-center justify-between gap-4 p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/20 hover:border-blue-500/30 transition-all shadow-2xs cursor-pointer"
              >
                {/* Left Side: Icon, Title & Badges */}
                <div className="flex items-center gap-3 min-w-0 flex-1">

                  {/* Action Icon */}
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      isCreated
                        ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                        : "bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]"
                    }`}
                    title={isCreated ? "Recently Created Task" : "Recently Updated Task"}
                  >
                    {isCreated ? (
                      <PlusCircle className="h-4 w-4" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">

                    {/* Title & Action Tag */}
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors truncate">
                        {task.title || task.name}
                      </h4>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 border ${
                          isCreated
                            ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                            : "bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]"
                        }`}
                      >
                        {isCreated ? "CREATED" : "UPDATED"}
                      </span>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      {/* Project Badge */}
                      <span className="font-semibold bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] px-2 py-0.5 rounded-md truncate max-w-[130px]">
                        {task.projectName || task.project_name || "Project"}
                      </span>

                      {/* Status */}
                      <StatusBadge status={task.status} />

                      {/* Priority */}
                      <PriorityBadge priority={task.priority} />

                      {/* Assignee / User */}
                      {assigneeName && (
                        <span className="text-[#475569] flex items-center gap-1 font-medium text-[10px] ml-0.5">
                          <User className="h-3 w-3 text-blue-600" />
                          {assigneeName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Compact Summary & Navigation */}
                <div className="flex items-center gap-3.5 shrink-0 pl-3 border-l border-border/40">
                  <div className="flex flex-col items-end text-right space-y-1 text-[11px]">
                    {/* Due Date */}
                    <div className="flex items-center gap-1.5 font-semibold text-[#475569]">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{task.dueDate || task.due_date || "No due date"}</span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <Clock className="h-3 w-3 text-muted-foreground/60" />
                      <span>
                        {task.formatted_time || task.formattedTime || (task.created_at ? new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recent")}
                      </span>
                    </div>
                  </div>

                  <div className="h-7 w-7 rounded-xl bg-muted/40 group-hover:bg-blue-500/10 text-muted-foreground group-hover:text-blue-600 flex items-center justify-center transition-colors shrink-0">
                    <ChevronRight className="h-4 w-4" />
                  </div>
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
          className="font-poppins text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          View All Tasks <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  )
}

export default RecentTasksList
