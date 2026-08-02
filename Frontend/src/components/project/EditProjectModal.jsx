import React, { useState } from "react"
import { X, Edit3 } from "lucide-react"
import api from "@/services/api"
import { useProject } from "@/context/ProjectContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ProjectForm } from "./ProjectForm"

export function EditProjectModal({ open, onOpenChange, project, onProjectUpdated }) {
  const { setProjects } = useProject()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  if (!open || !project) return null

  const projectId = project.project_id || project.id

  const handleSubmit = async (payload) => {
    setIsLoading(true)
    setServerError("")

    try {
      // Direct POST to /projects/{project_id} or /api/manage/project/{project_id}
      const res = await api.post(`/projects/${projectId}`, payload)
      const updatedProject = res.data.project || res.data

      if (setProjects) {
        setProjects((prev) =>
          prev.map((p) => ((p.id === projectId || p.project_id === projectId) ? { ...p, ...updatedProject } : p))
        )
      }

      if (onProjectUpdated) {
        onProjectUpdated(updatedProject)
      }

      onOpenChange(false)
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail
          ? typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : Array.isArray(err.response.data.detail)
            ? err.response.data.detail[0]?.msg || "Failed to update project"
            : "Failed to update project"
          : "Unable to connect to backend server."
      setServerError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <Card className="w-full max-w-2xl border border-border/80 bg-card shadow-2xl rounded-2xl relative my-8 animate-in zoom-in-95 duration-150">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="pb-3 border-b border-border/40 text-center">
          <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <Edit3 className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-bold">Edit Project Details</CardTitle>
          <CardDescription className="text-xs">
            Update project attributes and timeline rules.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 max-h-[80vh] overflow-y-auto pr-2">
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {serverError}
            </div>
          )}

          <ProjectForm
            initialValues={project}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Update Project"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default EditProjectModal
