import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import { ProjectForm } from "@/components/project/ProjectForm"

/**
 * Clean CreateProject Page Component
 */
export function CreateProject() {
  const navigate = useNavigate()
  const { addProject } = useProject()
  const [serverError, setServerError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (payload) => {
    setServerError("")
    setIsLoading(true)

    try {
      const res = await api.post("/projects", payload)
      const createdData = res.data?.project || res.data || {}

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
          : "Unable to connect to project creation API service."
      setServerError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-4 animate-fade-in font-roboto">
      
      {/* Server Error Alert */}
      {serverError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Component */}
      <ProjectForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Project"
      />

    </div>
  )
}

export default CreateProject
