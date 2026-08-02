import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { FolderPlus, ArrowLeft, AlertCircle } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProjectForm } from "@/components/project/ProjectForm"

export function CreateProject() {
  const navigate = useNavigate()
  const { addProject } = useProject()
  const [serverError, setServerError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (payload) => {
    setServerError("")
    setIsLoading(true)

    try {
      // API call to POST /projects
      const res = await api.post("/projects", payload)
      const createdProject = res.data.project || res.data
      addProject(createdProject)
      navigate("/dashboard")
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail
          ? typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : Array.isArray(err.response.data.detail)
            ? err.response.data.detail[0]?.msg || "Failed to create project"
            : "Failed to create project"
          : "Unable to connect to server."
      setServerError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Navigation back button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Card Form */}
        <Card className="border border-border/80 bg-card shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 text-center pb-4 border-b border-border/40">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <FolderPlus className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Create New Project</CardTitle>
            <CardDescription className="text-xs">
              Fill in mandatory (*) and optional fields according to the PostgreSQL tracker schema.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {serverError && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <ProjectForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel="Create Project"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateProject
