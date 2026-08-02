import React, { useState, useEffect } from "react"
import { AlertCircle, Calendar, Info, Layers, Loader2 } from "lucide-react"
import api from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * ProjectForm Component
 * Fully synced with backend PostgreSQL model `tracker.projects` & FastAPI `ProjectCreate` schema.
 * Dynamically binds to real database LOV options returned by `GET /projects/lov`.
 */
export function ProjectForm({ initialValues = null, onSubmit, isLoading = false, submitLabel = "Create Project" }) {
  const todayStr = new Date().toISOString().split("T")[0]
  const in30DaysStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [lovs, setLovs] = useState({
    categories: [],
    priorities: [],
    project_types: [],
    statuses: [],
  })

  const [lovsLoading, setLovsLoading] = useState(true)

  const [formData, setFormData] = useState({
    project_name: initialValues?.project_name || initialValues?.name || "",
    project_description: initialValues?.project_description || initialValues?.description || "",
    category_id: initialValues?.category_id || "",
    priority_id: initialValues?.priority_id || "",
    project_type_id: initialValues?.project_type_id || "",
    status_id: initialValues?.status_id || "",
    planned_start_date: initialValues?.planned_start_date ? initialValues.planned_start_date.split("T")[0] : todayStr,
    planned_end_date: initialValues?.planned_end_date ? initialValues.planned_end_date.split("T")[0] : in30DaysStr,
    actual_start_date: initialValues?.actual_start_date ? initialValues.actual_start_date.split("T")[0] : "",
    actual_end_date: initialValues?.actual_end_date ? initialValues.actual_end_date.split("T")[0] : "",
    estimated_duration: initialValues?.estimated_duration || "30",
  })

  const [errors, setErrors] = useState({})

  // Fetch LOVs directly from backend GET /projects/lov
  useEffect(() => {
    async function fetchLOVs() {
      setLovsLoading(true)
      try {
        const res = await api.get("/projects/lov")
        const data = res.data || {}

        const categories = data.categories || []
        const priorities = data.priorities || []
        const project_types = data.project_types || []
        const statuses = data.statuses || []

        setLovs({ categories, priorities, project_types, statuses })

        // Auto select first option for unselected mandatory LOV fields using backend UUIDs
        setFormData((prev) => ({
          ...prev,
          category_id: prev.category_id || categories[0]?.id || "",
          priority_id: prev.priority_id || priorities[0]?.id || "",
          project_type_id: prev.project_type_id || project_types[0]?.id || "",
          status_id: prev.status_id || statuses[0]?.id || "",
        }))
      } catch (err) {
        console.warn("Failed to fetch LOVs from backend API:", err)
      } finally {
        setLovsLoading(false)
      }
    }
    fetchLOVs()
  }, [])

  // Auto-calculate estimated_duration when planned dates change
  useEffect(() => {
    if (formData.planned_start_date && formData.planned_end_date) {
      const start = new Date(formData.planned_start_date)
      const end = new Date(formData.planned_end_date)
      const diffTime = end - start
      if (diffTime >= 0) {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        setFormData((prev) => ({ ...prev, estimated_duration: diffDays.toString() }))
      }
    }
  }, [formData.planned_start_date, formData.planned_end_date])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.project_name.trim()) newErrors.project_name = "Project Name is mandatory."
    if (!formData.category_id) newErrors.category_id = "Category selection is mandatory."
    if (!formData.project_type_id) newErrors.project_type_id = "Project Type selection is mandatory."
    if (!formData.priority_id) newErrors.priority_id = "Priority selection is mandatory."
    if (!formData.status_id) newErrors.status_id = "Status selection is mandatory."
    if (!formData.planned_start_date) newErrors.planned_start_date = "Planned Start Date is mandatory."
    if (!formData.planned_end_date) newErrors.planned_end_date = "Planned End Date is mandatory."
    if (!formData.estimated_duration || parseInt(formData.estimated_duration, 10) < 1) {
      newErrors.estimated_duration = "Estimated Duration (≥ 1 day) is mandatory."
    }

    if (formData.planned_start_date && formData.planned_end_date) {
      if (new Date(formData.planned_end_date) < new Date(formData.planned_start_date)) {
        newErrors.planned_end_date = "Planned End Date cannot be earlier than Start Date."
      }
    }

    if (formData.actual_start_date && formData.actual_end_date) {
      if (new Date(formData.actual_end_date) < new Date(formData.actual_start_date)) {
        newErrors.actual_end_date = "Actual End Date cannot be earlier than Actual Start Date."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      project_name: formData.project_name.trim(),
      project_description: formData.project_description.trim() || null,
      category_id: formData.category_id,
      priority_id: formData.priority_id,
      project_type_id: formData.project_type_id,
      status_id: formData.status_id,
      planned_start_date: new Date(formData.planned_start_date).toISOString(),
      planned_end_date: new Date(formData.planned_end_date).toISOString(),
      estimated_duration: parseInt(formData.estimated_duration, 10),
      actual_start_date: formData.actual_start_date ? new Date(formData.actual_start_date).toISOString() : null,
      actual_end_date: formData.actual_end_date ? new Date(formData.actual_end_date).toISOString() : null,
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5 bg-card border border-border/80 p-5 sm:p-6 rounded-2xl shadow-sm">
      
      {/* SECTION 1: BASIC INFORMATION */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-blue-600 font-extrabold text-sm">
          <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Info className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
          <span>Basic Information</span>
        </div>

        {/* Project Name (MANDATORY) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="project_name" className="text-xs font-bold text-foreground">
              Project Name <span className="text-red-500 font-bold">*</span>
            </Label>
            <span className="text-[11px] font-bold text-red-500">* Required</span>
          </div>
          <Input
            id="project_name"
            name="project_name"
            type="text"
            placeholder="e.g. Q4 Strategic Rebranding"
            disabled={isLoading}
            value={formData.project_name}
            onChange={handleChange}
            className={`h-9 text-xs rounded-lg bg-muted/20 border-border/80 focus-visible:ring-blue-600 ${
              errors.project_name ? "border-red-500" : ""
            }`}
          />
          {errors.project_name && (
            <p className="text-[11px] text-red-500 flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3 w-3" /> {errors.project_name}
            </p>
          )}
        </div>

        {/* Project Description (OPTIONAL) */}
        <div className="space-y-1">
          <Label htmlFor="project_description" className="text-xs font-bold text-foreground">
            Project Description (Optional)
          </Label>
          <textarea
            id="project_description"
            name="project_description"
            rows={2}
            placeholder="Detailed scope and objectives of the project..."
            disabled={isLoading}
            value={formData.project_description}
            onChange={handleChange}
            className="flex w-full rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 text-foreground resize-none"
          />
        </div>
      </div>

      <div className="border-t border-border/60" />

      {/* SECTION 2: CLASSIFICATION & STATUS (LOVs) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-blue-600 font-extrabold text-sm">
          <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Layers className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
          <span>Classification & Status</span>
          {lovsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 ml-auto" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Category ID (MANDATORY) */}
          <div className="space-y-1">
            <Label htmlFor="category_id" className="text-xs font-bold text-foreground">
              Category <span className="text-red-500 font-bold">*</span>
            </Label>
            <select
              id="category_id"
              name="category_id"
              disabled={isLoading || lovsLoading}
              value={formData.category_id}
              onChange={handleChange}
              className={`flex h-9 w-full rounded-lg border bg-muted/20 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 text-foreground ${
                errors.category_id ? "border-red-500" : "border-border/80"
              }`}
            >
              <option value="" disabled>Select Category</option>
              {lovs.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="text-[11px] text-red-500 font-semibold">{errors.category_id}</p>}
          </div>

          {/* Project Type ID (MANDATORY) */}
          <div className="space-y-1">
            <Label htmlFor="project_type_id" className="text-xs font-bold text-foreground">
              Project Type <span className="text-red-500 font-bold">*</span>
            </Label>
            <select
              id="project_type_id"
              name="project_type_id"
              disabled={isLoading || lovsLoading}
              value={formData.project_type_id}
              onChange={handleChange}
              className={`flex h-9 w-full rounded-lg border bg-muted/20 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 text-foreground ${
                errors.project_type_id ? "border-red-500" : "border-border/80"
              }`}
            >
              <option value="" disabled>Select Type</option>
              {lovs.project_types.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
            {errors.project_type_id && <p className="text-[11px] text-red-500 font-semibold">{errors.project_type_id}</p>}
          </div>

          {/* Priority ID (MANDATORY) */}
          <div className="space-y-1">
            <Label htmlFor="priority_id" className="text-xs font-bold text-foreground">
              Priority <span className="text-red-500 font-bold">*</span>
            </Label>
            <select
              id="priority_id"
              name="priority_id"
              disabled={isLoading || lovsLoading}
              value={formData.priority_id}
              onChange={handleChange}
              className={`flex h-9 w-full rounded-lg border bg-muted/20 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 text-foreground ${
                errors.priority_id ? "border-red-500" : "border-border/80"
              }`}
            >
              <option value="" disabled>Set Priority</option>
              {lovs.priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.priority_id && <p className="text-[11px] text-red-500 font-semibold">{errors.priority_id}</p>}
          </div>

          {/* Initial Status ID (MANDATORY) */}
          <div className="space-y-1">
            <Label htmlFor="status_id" className="text-xs font-bold text-foreground">
              Initial Status <span className="text-red-500 font-bold">*</span>
            </Label>
            <select
              id="status_id"
              name="status_id"
              disabled={isLoading || lovsLoading}
              value={formData.status_id}
              onChange={handleChange}
              className={`flex h-9 w-full rounded-lg border bg-muted/20 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 text-foreground ${
                errors.status_id ? "border-red-500" : "border-border/80"
              }`}
            >
              <option value="" disabled>Initial Status</option>
              {lovs.statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.status_id && <p className="text-[11px] text-red-500 font-semibold">{errors.status_id}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60" />

      {/* SECTION 3: TIMELINE & DATES */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-blue-600 font-extrabold text-sm">
          <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Calendar className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
          <span>Timeline & Dates</span>
        </div>

        {/* Mandatory Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Planned Start Date (MANDATORY) */}
          <div className="space-y-1">
            <Label htmlFor="planned_start_date" className="text-xs font-bold text-foreground">
              Planned Start <span className="text-red-500 font-bold">*</span>
            </Label>
            <Input
              id="planned_start_date"
              name="planned_start_date"
              type="date"
              disabled={isLoading}
              value={formData.planned_start_date}
              onChange={handleChange}
              className={`h-9 text-xs rounded-lg bg-muted/20 border-border/80 focus-visible:ring-blue-600 ${
                errors.planned_start_date ? "border-red-500" : ""
              }`}
            />
            {errors.planned_start_date && <p className="text-[11px] text-red-500 font-semibold">{errors.planned_start_date}</p>}
          </div>

          {/* Planned End Date (MANDATORY) */}
          <div className="space-y-1">
            <Label htmlFor="planned_end_date" className="text-xs font-bold text-foreground">
              Planned End <span className="text-red-500 font-bold">*</span>
            </Label>
            <Input
              id="planned_end_date"
              name="planned_end_date"
              type="date"
              disabled={isLoading}
              value={formData.planned_end_date}
              onChange={handleChange}
              className={`h-9 text-xs rounded-lg bg-muted/20 border-border/80 focus-visible:ring-blue-600 ${
                errors.planned_end_date ? "border-red-500" : ""
              }`}
            />
            {errors.planned_end_date && <p className="text-[11px] text-red-500 font-semibold">{errors.planned_end_date}</p>}
          </div>

          {/* Estimated Duration (MANDATORY) */}
          <div className="space-y-1">
            <Label htmlFor="estimated_duration" className="text-xs font-bold text-foreground">
              Est. Duration (Days) <span className="text-red-500 font-bold">*</span>
            </Label>
            <Input
              id="estimated_duration"
              name="estimated_duration"
              type="number"
              min="1"
              placeholder="30"
              disabled={isLoading}
              value={formData.estimated_duration}
              onChange={handleChange}
              className={`h-9 text-xs rounded-lg bg-muted/20 border-border/80 focus-visible:ring-blue-600 ${
                errors.estimated_duration ? "border-red-500" : ""
              }`}
            />
            {errors.estimated_duration && <p className="text-[11px] text-red-500 font-semibold">{errors.estimated_duration}</p>}
          </div>
        </div>

        {/* Optional Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Actual Start Date (OPTIONAL) */}
          <div className="space-y-1">
            <Label htmlFor="actual_start_date" className="text-xs font-bold text-foreground">
              Actual Start (Optional)
            </Label>
            <Input
              id="actual_start_date"
              name="actual_start_date"
              type="date"
              disabled={isLoading}
              value={formData.actual_start_date}
              onChange={handleChange}
              className="h-9 text-xs rounded-lg bg-muted/20 border-border/80 focus-visible:ring-blue-600"
            />
          </div>

          {/* Actual End Date (OPTIONAL) */}
          <div className="space-y-1">
            <Label htmlFor="actual_end_date" className="text-xs font-bold text-foreground">
              Actual End (Optional)
            </Label>
            <Input
              id="actual_end_date"
              name="actual_end_date"
              type="date"
              disabled={isLoading}
              value={formData.actual_end_date}
              onChange={handleChange}
              className="h-9 text-xs rounded-lg bg-muted/20 border-border/80 focus-visible:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Form Submission Footer */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-3">
        <Button
          type="submit"
          disabled={isLoading || lovsLoading}
          className="h-9 px-6 font-bold text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>

    </form>
  )
}

export default ProjectForm
