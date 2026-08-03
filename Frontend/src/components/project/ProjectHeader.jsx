import React, { useState } from "react"
import { Calendar, Edit3, Code, Plus, Trash2 } from "lucide-react"
import { PermissionButton } from "@/components/common/PermissionButton"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

/**
 * Modern ProjectHeader Component
 * - Breadcrumbs & navbar duplicates removed.
 * - Key badge (PRO) & Status pill (TODO) placed directly at the right side of the project title.
 * - Clean action buttons layout for Edit, Delete, and + Add Task.
 */
const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-rose-600",
  "bg-amber-600",
]

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "?"

export function ProjectHeader({ project, onDeleteProject, onEditProject, onAddTask, members = [], membersLoading = false, onManageMembers }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!project) return null

  const visibleMembers = members.slice(0, 4)
  const extraCount = members.length - visibleMembers.length

  const getStatusStyle = (status = "") => {
    const s = status.toLowerCase()
    if (s.includes("progress")) return { dot: "bg-blue-500", pill: "bg-blue-500/10 text-blue-600 border-blue-500/20 font-semibold" }
    if (s.includes("done") || s.includes("completed")) return { dot: "bg-emerald-500", pill: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold" }
    return { dot: "bg-amber-500", pill: "bg-amber-500/10 text-amber-600 border-amber-500/20 font-medium" }
  }

  const statusStyle = getStatusStyle(project.status || "Todo")

  const formatDateRange = () => {
    if (project.plannedStartDate && project.plannedEndDate) {
      const start = new Date(project.plannedStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      const end = new Date(project.plannedEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      return `${start} - ${end}`
    }
    return project.createdAt ? `${project.createdAt} onwards` : "Aug 1 - Aug 31, 2026"
  }

  return (
    <div className="space-y-4 pb-2 animate-fade-in font-roboto">

      {/* Main Header Content: Title on Left, Action Toolbar & Team Avatars on Right */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/50 pb-5">
        
        {/* Left: Title + Key Badge + Status Pill & Meta Details */}
        <div className="space-y-2 max-w-3xl">
          
          {/* Project Title + PRO Key Badge + Status Pill Inline */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-poppins text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight">
              {project.name || "Project management system"}
            </h1>

            {/* Key Badge (e.g. PRO) */}
            <span className="h-6 px-2.5 rounded-lg bg-blue-500/10 text-blue-600 font-poppins font-bold text-xs flex items-center border border-blue-500/20">
              {project.key || "PRO"}
            </span>

            {/* Status Pill (e.g. TODO) */}
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] uppercase border tracking-wider ${statusStyle.pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
              {project.status || "Todo"}
            </div>
          </div>

          {/* Description */}
          <p className="font-roboto text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
            {project.description || "No description provided."}
          </p>

          {/* Meta Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-foreground">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/30 border border-border/60">
              <Code className="h-3.5 w-3.5 text-blue-600" />
              {project.category || "Development"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/30 border border-border/60">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              {formatDateRange()}
            </span>
          </div>
        </div>

        {/* Right: Team Avatars & Action Buttons Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          
          {/* Team Initials Stack */}
          <button
            type="button"
            onClick={onManageMembers}
            title="Manage project members"
            className="flex items-center -space-x-2 shrink-0 cursor-pointer group"
          >
            {membersLoading ? (
              <span className="h-7 w-7 rounded-full bg-muted/60 animate-pulse ring-2 ring-background" />
            ) : visibleMembers.length === 0 ? (
              <span className="text-[11px] text-muted-foreground italic px-1 group-hover:text-blue-600 transition-colors">
                No members yet
              </span>
            ) : (
              <>
                {visibleMembers.map((m, idx) => (
                  <div
                    key={m.project_member_id}
                    title={`${m.full_name}${project.created_by && String(m.user_id) === String(project.created_by) ? " (Owner)" : ""}`}
                    className={`h-7 w-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background transition-transform group-hover:scale-105 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                  >
                    {getInitials(m.full_name)}
                  </div>
                ))}
                {extraCount > 0 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-600 ring-2 ring-background">
                    +{extraCount}
                  </div>
                )}
              </>
            )}
          </button>

          {/* Action Toolbar: + Add Task, Edit Project, Delete */}
          <div className="flex items-center gap-2">
            {/* Add Task Primary CTA Button */}
            <button
              type="button"
              onClick={onAddTask}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-poppins font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" /> Add Task
            </button>

            {/* Edit Project Button */}
            <PermissionButton
              action="update"
              resource="project"
              resourceData={project}
              variant="outline"
              size="sm"
              onClick={onEditProject}
              className="gap-1.5 font-poppins font-semibold text-xs h-9 px-3.5 rounded-xl border-border/80 shadow-xs cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </PermissionButton>

            {/* Delete Project Button */}
            <PermissionButton
              action="delete"
              resource="project"
              resourceData={project}
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer px-3 h-9 rounded-xl"
              title="Delete Project"
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </div>

        </div>

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
