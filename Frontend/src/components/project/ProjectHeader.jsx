import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft, Calendar, Edit3, Code, ChevronRight, Plus,
  CheckSquare, Inbox, CircleCheck
} from "lucide-react"
import { PermissionButton } from "@/components/common/PermissionButton"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"
import { useProject } from "@/context/ProjectContext"

/**
 * ProjectHeader Component
 * Matches the reference screenshot exactly:
 * - Breadcrumb "← Dashboard / Project Details" + Delete, Edit Project, Bell, User Avatar
 * - Key badge, Status pill, team initials stack
 * - Big "+ Add Task" blue button on the right
 * - Title, description, category chip, date chip
 */
export function ProjectHeader({ project, onDeleteProject, onEditProject, onAddTask, tasksCount = 0 }) {
  const navigate = useNavigate()
  const { user } = useProject()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!project) return null

  const userName = user?.fullName || user?.full_name || "Aditya Kumar"
  const userInitials = userName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()

  const getStatusStyle = (status = "") => {
    const s = status.toLowerCase()
    if (s.includes("progress")) return { dot: "bg-blue-500", pill: "bg-blue-500/10 text-blue-600 border-blue-500/20" }
    if (s.includes("done") || s.includes("completed")) return { dot: "bg-emerald-500", pill: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" }
    return { dot: "bg-amber-500", pill: "bg-amber-500/10 text-amber-600 border-amber-500/20" }
  }

  const statusStyle = getStatusStyle(project.status || "Todo")

  // Derive date range from project data
  const formatDateRange = () => {
    if (project.plannedStartDate && project.plannedEndDate) {
      const start = new Date(project.plannedStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      const end = new Date(project.plannedEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      return `${start} - ${end}`
    }
    return project.createdAt ? `${project.createdAt} onwards` : "Aug 1 - Aug 31, 2026"
  }

  return (
    <div className="space-y-4 pb-2 animate-fade-in">

      {/* ── 1. Top Bar: Breadcrumb + Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </button>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          <span className="text-foreground font-bold">Project Details</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Delete */}
          <PermissionButton
            action="delete"
            resource="project"
            resourceData={project}
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer px-3 h-9"
          >
            Delete
          </PermissionButton>

          {/* Edit Project */}
          <PermissionButton
            action="update"
            resource="project"
            resourceData={project}
            variant="outline"
            size="sm"
            onClick={onEditProject}
            className="gap-1.5 font-bold text-xs h-9 px-3.5 rounded-xl border-border/80 shadow-xs cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit Project
          </PermissionButton>

          <NotificationDropdown />

          {/* User avatar — initials only */}
          <div onClick={() => navigate("/profile")} className="cursor-pointer">
            <Avatar className="h-9 w-9 border border-blue-500/20 shadow-xs">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* ── 2. Project Meta: Key badge + Status + Team Avatars + Add Task ── */}
      <div className="flex items-start justify-between gap-4">
        {/* Left — key + status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="h-7 px-2.5 rounded-lg bg-blue-500/10 text-blue-600 font-black text-xs flex items-center border border-blue-500/20">
            {project.key || "PRO"}
          </span>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border ${statusStyle.pill}`}>
            <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
            {project.status || "Todo"}
          </div>
        </div>

        {/* Right — team avatars stack + Add Task */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Team initials stack */}
          <div className="flex items-center -space-x-2">
            <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
              <AvatarFallback className="bg-violet-600 text-white text-[10px] font-bold">AR</AvatarFallback>
            </Avatar>
            <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
              <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">SC</AvatarFallback>
            </Avatar>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-extrabold text-blue-600 ring-2 ring-background">
              +4
            </div>
          </div>

          {/* Big Add Task button */}
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" /> Add Task
          </button>
        </div>
      </div>

      {/* ── 3. Title + Description ── */}
      <div className="space-y-1 pt-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
          {project.name || "Project management system"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {project.description || "Build fullstack project using FastAPI, React.js, PostgreSQL and Docker"}
        </p>
      </div>

      {/* ── 4. Meta chips ── */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-foreground">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/50">
          <Code className="h-3.5 w-3.5 text-blue-600" />
          {project.category || "Development"}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/50">
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          {formatDateRange()}
        </span>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Project?"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will permanently remove all associated tasks.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        onConfirm={onDeleteProject}
      />
    </div>
  )
}

export default ProjectHeader
