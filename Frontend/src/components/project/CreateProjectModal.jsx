import React, { useState } from "react"
import { X, FolderPlus } from "lucide-react"
import api from "@/services/api"
import { useProject } from "@/context/ProjectContext"
import { ProjectForm } from "./ProjectForm"

export function CreateProjectModal({ open, onOpenChange, onProjectCreated }) {
  const { fetchProjects } = useProject()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  if (!open) return null

  const handleSubmit = async (payload) => {
    setIsLoading(true)
    setServerError("")

    try {
      const res = await api.post("/projects", payload)
      const createdData = res.data?.project || res.data || {}

      // Refetch the canonical project list from the backend so the newly created
      // project shows up everywhere (Projects page, Dashboard) with its full,
      // correctly-shaped data instead of a partial optimistic local insert.
      if (fetchProjects) {
        await fetchProjects()
      }

      if (onProjectCreated) {
        onProjectCreated(createdData)
      }

      onOpenChange(false)
    } catch (err) {
      console.error("Error creating project via modal POST /projects:", err)
      const errorMsg =
        err.response?.data?.detail
          ? typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : Array.isArray(err.response.data.detail)
            ? err.response.data.detail[0]?.msg || "Failed to create project"
            : "Failed to create project"
          : "Unable to connect to http://localhost:8000/projects API."
      setServerError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4 animate-fade-in overflow-y-auto font-roboto">
      <div className="w-full max-w-2xl border border-border/80 bg-card shadow-2xl rounded-3xl relative my-8 p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 pb-2 border-b border-border/60">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FolderPlus className="h-6 w-6 stroke-[2]" />
          </div>
          <h2 className="font-poppins text-xl font-bold text-foreground">Create New Project</h2>
          <p className="text-xs text-muted-foreground max-w-md">
            Configure project parameters, classifications, and target timeline schedule.
          </p>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2">
            <X className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <ProjectForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Project"
        />

      </div>
    </div>
  )
}

export default CreateProjectModal
