import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, Edit3, Trash2, Tag } from "lucide-react"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PermissionButton } from "@/components/common/PermissionButton"
import { AlertDialog } from "@/components/ui/alert-dialog"

export function ProjectHeader({ project, onDeleteProject, onEditProject }) {
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!project) return null

  return (
    <div className="space-y-4 border-b border-border/60 pb-6">
      
      {/* Top Breadcrumb Navigation */}
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </button>

      {/* Header Content */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        
        {/* Left Side: Title, Description, Meta Tags */}
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="h-8 px-2.5 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
              {project.key}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {project.name}
            </h1>
            <StatusBadge status={project.status || "Active"} />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description || "No project description provided."}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-primary" /> {project.category || "Software Development"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Created {project.createdAt || "Aug 1, 2026"}
            </span>
          </div>
        </div>

        {/* Right Side: PBAC Permission Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <PermissionButton
            action="update"
            resource="project"
            resourceData={project}
            variant="outline"
            size="sm"
            onClick={onEditProject}
            className="gap-1.5 font-medium text-xs h-8"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </PermissionButton>

          {/* Delete Button */}
          <PermissionButton
            action="delete"
            resource="project"
            resourceData={project}
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-1.5 font-semibold text-xs h-8 shadow-xs"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </PermissionButton>
        </div>

      </div>

      {/* Confirmation Dialog for Project Deletion */}
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
