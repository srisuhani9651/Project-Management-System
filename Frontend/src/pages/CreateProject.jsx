import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, AlertCircle, Settings } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProjectForm } from "@/components/project/ProjectForm"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"

/**
 * CreateProject Page Component
 * Directly integrated with FastAPI backend POST endpoint: http://localhost:8000/projects
 */
export function CreateProject() {
  const navigate = useNavigate()
  const { user, addProject } = useProject()
  const [serverError, setServerError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const userName = user?.fullName || "Aditya Kumar"

  const handleSubmit = async (payload) => {
    setServerError("")
    setIsLoading(true)

    try {
      // 1. Direct integration with POST http://localhost:8000/projects
      const res = await api.post("/projects", payload)
      const createdData = res.data?.project || res.data || {}

      // 2. Format created project for global ProjectContext
      const formattedProject = {
        id: createdData.project_id || createdData.id || `proj-${Date.now()}`,
        key: createdData.project_name
          ? createdData.project_name.substring(0, 3).toUpperCase()
          : "PRO",
        name: createdData.project_name || payload.project_name,
        description: createdData.project_description || payload.project_description || "",
        category: createdData.category_name || "Development",
        status: createdData.status_name || "In Progress",
        createdAt: createdData.created_at
          ? new Date(createdData.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Just now",
        tasksCount: 0,
      }

      if (addProject) {
        addProject(formattedProject)
      }

      // 3. Navigate to All Projects view
      navigate("/projects")
    } catch (err) {
      console.error("Error creating project via POST http://localhost:8000/projects:", err)
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
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6 animate-fade-in">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </button>

        {/* Right Header Controls */}
        <div className="flex items-center justify-end gap-3">
          <NotificationDropdown />

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="h-9 w-9 rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shadow-xs"
            title="Settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>

          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 pl-1 cursor-pointer"
          >
            <Avatar className="h-9 w-9 border border-blue-500/20 shadow-xs">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                {userName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="space-y-1 text-center py-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Create New Project
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Initialize your next big endeavor with precise parameters and goals.
        </p>
      </div>

      {/* Error Alert */}
      {serverError && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Container */}
      <ProjectForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Project"
      />

    </div>
  )
}

export default CreateProject
