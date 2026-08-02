import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { FolderPlus, ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CreateProject() {
  const navigate = useNavigate()
  const { addProject } = useProject()

  const [lovs, setLovs] = useState({
    categories: [],
    priorities: [],
    project_types: [],
    statuses: [],
  })

  const [formData, setFormData] = useState({
    project_name: "",
    project_description: "",
    category_id: "",
    priority_id: "",
    project_type_id: "",
    status_id: "",
    planned_start_date: "",
    planned_end_date: "",
    estimated_duration: "",
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch LOVs from database on mount
  useEffect(() => {
    async function fetchLOVs() {
      try {
        const res = await api.get("/projects/lov")
        setLovs(res.data)
        if (res.data.categories?.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: res.data.categories[0].id }))
        }
        if (res.data.priorities?.length > 0) {
          setFormData((prev) => ({ ...prev, priority_id: res.data.priorities[0].id }))
        }
        if (res.data.project_types?.length > 0) {
          setFormData((prev) => ({ ...prev, project_type_id: res.data.project_types[0].id }))
        }
        if (res.data.statuses?.length > 0) {
          setFormData((prev) => ({ ...prev, status_id: res.data.statuses[0].id }))
        }
      } catch (err) {
        console.warn("Failed to load LOVs:", err)
      }
    }
    fetchLOVs()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.project_name.trim()) {
      setErrors({ project_name: "Project name is required." })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const payload = {
        project_name: formData.project_name.trim(),
        project_description: formData.project_description.trim() || null,
        category_id: formData.category_id || null,
        priority_id: formData.priority_id || null,
        project_type_id: formData.project_type_id || null,
        status_id: formData.status_id || null,
        planned_start_date: formData.planned_start_date ? new Date(formData.planned_start_date).toISOString() : null,
        planned_end_date: formData.planned_end_date ? new Date(formData.planned_end_date).toISOString() : null,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration, 10) : null,
      }

      const res = await api.post("/projects", payload)
      addProject(res.data.project)
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
      setErrors({ server: errorMsg })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Navigation back button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
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
            <CardDescription>
              Set up a new workspace project with database classification.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {errors.server && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.server}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  name="project_name"
                  type="text"
                  placeholder="e.g. NextGen Web Portal"
                  disabled={isLoading}
                  value={formData.project_name}
                  onChange={handleChange}
                  className={errors.project_name ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.project_name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.project_name}
                  </p>
                )}
              </div>

              {/* Grid 1: Category & Project Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <select
                    id="category_id"
                    name="category_id"
                    disabled={isLoading}
                    value={formData.category_id}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                  >
                    {lovs.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_type_id">Project Type</Label>
                  <select
                    id="project_type_id"
                    name="project_type_id"
                    disabled={isLoading}
                    value={formData.project_type_id}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                  >
                    {lovs.project_types.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 2: Priority & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority_id">Priority</Label>
                  <select
                    id="priority_id"
                    name="priority_id"
                    disabled={isLoading}
                    value={formData.priority_id}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                  >
                    {lovs.priorities.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status_id">Status</Label>
                  <select
                    id="status_id"
                    name="status_id"
                    disabled={isLoading}
                    value={formData.status_id}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                  >
                    {lovs.statuses.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 3: Planned Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planned_start_date">Planned Start Date</Label>
                  <Input
                    id="planned_start_date"
                    name="planned_start_date"
                    type="date"
                    disabled={isLoading}
                    value={formData.planned_start_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planned_end_date">Planned End Date</Label>
                  <Input
                    id="planned_end_date"
                    name="planned_end_date"
                    type="date"
                    disabled={isLoading}
                    value={formData.planned_end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Estimated Duration */}
              <div className="space-y-2">
                <Label htmlFor="estimated_duration">Estimated Duration (Days)</Label>
                <Input
                  id="estimated_duration"
                  name="estimated_duration"
                  type="number"
                  placeholder="e.g. 30"
                  min={1}
                  disabled={isLoading}
                  value={formData.estimated_duration}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="project_description">Description</Label>
                <textarea
                  id="project_description"
                  name="project_description"
                  rows={3}
                  placeholder="Brief summary of project goals and scope..."
                  disabled={isLoading}
                  value={formData.project_description}
                  onChange={handleChange}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Link to="/dashboard" className="w-1/2">
                  <Button type="button" variant="outline" disabled={isLoading} className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading} className="w-1/2 font-semibold shadow-md">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateProject
