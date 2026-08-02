import React, { useState, useEffect } from "react"
import { AlertCircle, Calendar, CheckCircle2, Clock, FolderPlus, HelpCircle, Loader2 } from "lucide-react"
import api from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * ProjectForm Component
 * Fully synced with backend SQLAlchemy model: `tracker.projects` (app/models/tracker/project.py)
 * 
 * FIELD RULES:
 * - project_name: MANDATORY (nullable=False)
 * - category_id: MANDATORY (nullable=False)
 * - project_type_id: MANDATORY (nullable=False)
 * - priority_id: MANDATORY (nullable=False)
 * - status_id: MANDATORY (nullable=False)
 * - planned_start_date: MANDATORY (nullable=False)
 * - planned_end_date: MANDATORY (nullable=False)
 * - estimated_duration: MANDATORY (nullable=False)
 * - project_description: OPTIONAL (nullable=True)
 * - actual_start_date: OPTIONAL (nullable=True)
 * - actual_end_date: OPTIONAL (nullable=True)
 */
export function ProjectForm({ initialValues = null, onSubmit, isLoading = false, submitLabel = "Create Project" }) {
  const [lovs, setLovs] = useState({
    categories: [],
    priorities: [],
    project_types: [],
    statuses: [],
  })

  const [formData, setFormData] = useState({
    project_name: initialValues?.project_name || initialValues?.name || "",
    project_description: initialValues?.project_description || initialValues?.description || "",
    category_id: initialValues?.category_id || "",
    priority_id: initialValues?.priority_id || "",
    project_type_id: initialValues?.project_type_id || "",
    status_id: initialValues?.status_id || "",
    planned_start_date: initialValues?.planned_start_date ? initialValues.planned_start_date.split("T")[0] : "",
    planned_end_date: initialValues?.planned_end_date ? initialValues.planned_end_date.split("T")[0] : "",
    actual_start_date: initialValues?.actual_start_date ? initialValues.actual_start_date.split("T")[0] : "",
    actual_end_date: initialValues?.actual_end_date ? initialValues.actual_end_date.split("T")[0] : "",
    estimated_duration: initialValues?.estimated_duration || "",
  })

  const [errors, setErrors] = useState({})

  // Fetch LOVs from database
  useEffect(() => {
    async function fetchLOVs() {
      try {
        const res = await api.get("/projects/lov")
        setLovs(res.data)

        // Set default selections for mandatory select fields if empty
        setFormData((prev) => ({
          ...prev,
          category_id: prev.category_id || res.data.categories[0]?.id || "",
          priority_id: prev.priority_id || res.data.priorities[0]?.id || "",
          project_type_id: prev.project_type_id || res.data.project_types[0]?.id || "",
          status_id: prev.status_id || res.data.statuses[0]?.id || "",
        }))
      } catch (err) {
        console.warn("Failed to load LOVs:", err)
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

    // Mandatory Field Checks
    if (!formData.project_name.trim()) {
      newErrors.project_name = "Project Name is mandatory."
    }
    if (!formData.category_id) {
      newErrors.category_id = "Category selection is mandatory."
    }
    if (!formData.project_type_id) {
      newErrors.project_type_id = "Project Type selection is mandatory."
    }
    if (!formData.priority_id) {
      newErrors.priority_id = "Priority selection is mandatory."
    }
    if (!formData.status_id) {
      newErrors.status_id = "Status selection is mandatory."
    }
    if (!formData.planned_start_date) {
      newErrors.planned_start_date = "Planned Start Date is mandatory."
    }
    if (!formData.planned_end_date) {
      newErrors.planned_end_date = "Planned End Date is mandatory."
    }
    if (!formData.estimated_duration || parseInt(formData.estimated_duration, 10) < 1) {
      newErrors.estimated_duration = "Estimated Duration (≥ 1 day) is mandatory."
    }

    // Date Logic Validations
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
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* SECTION 1: MANDATORY BASIC DETAILS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-primary" /> Basic Information
          </h3>
          <span className="text-[11px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
            * Indicates Mandatory Field
          </span>
        </div>

        {/* Project Name (MANDATORY) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="project_name" className="text-xs font-semibold">
              Project Name <span className="text-destructive font-bold">*</span>
            </Label>
            <span className="text-[10px] text-muted-foreground">Mandatory</span>
          </div>
          <Input
            id="project_name"
            name="project_name"
            type="text"
            placeholder="e.g. NextGen Enterprise Portal"
            disabled={isLoading}
            value={formData.project_name}
            onChange={handleChange}
            className={errors.project_name ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.project_name && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {errors.project_name}
            </p>
          )}
        </div>

        {/* Project Description (NON-MANDATORY) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="project_description" className="text-xs font-semibold">
              Project Description
            </Label>
            <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
          </div>
          <textarea
            id="project_description"
            name="project_description"
            rows={3}
            placeholder="Brief scope and key milestones..."
            disabled={isLoading}
            value={formData.project_description}
            onChange={handleChange}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground resize-none"
          />
        </div>
      </div>

      {/* SECTION 2: MANDATORY CLASSIFICATION & LOVs */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Classification & Status
          </h3>
          <span className="text-[11px] font-medium text-destructive">All 4 selections required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category ID (MANDATORY) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="category_id" className="text-xs font-semibold">
                Category <span className="text-destructive font-bold">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">Mandatory</span>
            </div>
            <select
              id="category_id"
              name="category_id"
              disabled={isLoading}
              value={formData.category_id}
              onChange={handleChange}
              className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground ${
                errors.category_id ? "border-destructive" : "border-input"
              }`}
            >
              <option value="" disabled>Select Category</option>
              {lovs.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
          </div>

          {/* Project Type ID (MANDATORY) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="project_type_id" className="text-xs font-semibold">
                Project Type <span className="text-destructive font-bold">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">Mandatory</span>
            </div>
            <select
              id="project_type_id"
              name="project_type_id"
              disabled={isLoading}
              value={formData.project_type_id}
              onChange={handleChange}
              className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground ${
                errors.project_type_id ? "border-destructive" : "border-input"
              }`}
            >
              <option value="" disabled>Select Project Type</option>
              {lovs.project_types.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
            {errors.project_type_id && <p className="text-xs text-destructive">{errors.project_type_id}</p>}
          </div>

          {/* Priority ID (MANDATORY) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="priority_id" className="text-xs font-semibold">
                Priority <span className="text-destructive font-bold">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">Mandatory</span>
            </div>
            <select
              id="priority_id"
              name="priority_id"
              disabled={isLoading}
              value={formData.priority_id}
              onChange={handleChange}
              className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground ${
                errors.priority_id ? "border-destructive" : "border-input"
              }`}
            >
              <option value="" disabled>Select Priority</option>
              {lovs.priorities.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name}
                </option>
              ))}
            </select>
            {errors.priority_id && <p className="text-xs text-destructive">{errors.priority_id}</p>}
          </div>

          {/* Status ID (MANDATORY) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="status_id" className="text-xs font-semibold">
                Initial Status <span className="text-destructive font-bold">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">Mandatory</span>
            </div>
            <select
              id="status_id"
              name="status_id"
              disabled={isLoading}
              value={formData.status_id}
              onChange={handleChange}
              className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground ${
                errors.status_id ? "border-destructive" : "border-input"
              }`}
            >
              <option value="" disabled>Select Status</option>
              {lovs.statuses.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
            {errors.status_id && <p className="text-xs text-destructive">{errors.status_id}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 3: TIMELINE & DATES */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Timeline & Dates
          </h3>
          <span className="text-[11px] text-muted-foreground">Planned (Mandatory) vs Actual (Optional)</span>
        </div>

        {/* Planned Dates (MANDATORY) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="planned_start_date" className="text-xs font-semibold">
                Planned Start Date <span className="text-destructive font-bold">*</span>
              </Label>
            </div>
            <Input
              id="planned_start_date"
              name="planned_start_date"
              type="date"
              disabled={isLoading}
              value={formData.planned_start_date}
              onChange={handleChange}
              className={errors.planned_start_date ? "border-destructive" : ""}
            />
            {errors.planned_start_date && <p className="text-[11px] text-destructive">{errors.planned_start_date}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="planned_end_date" className="text-xs font-semibold">
                Planned End Date <span className="text-destructive font-bold">*</span>
              </Label>
            </div>
            <Input
              id="planned_end_date"
              name="planned_end_date"
              type="date"
              disabled={isLoading}
              value={formData.planned_end_date}
              onChange={handleChange}
              className={errors.planned_end_date ? "border-destructive" : ""}
            />
            {errors.planned_end_date && <p className="text-[11px] text-destructive">{errors.planned_end_date}</p>}
          </div>

          {/* Estimated Duration (MANDATORY) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="estimated_duration" className="text-xs font-semibold">
                Estimated Duration (Days) <span className="text-destructive font-bold">*</span>
              </Label>
            </div>
            <Input
              id="estimated_duration"
              name="estimated_duration"
              type="number"
              min={1}
              placeholder="Auto-calculated or enter days"
              disabled={isLoading}
              value={formData.estimated_duration}
              onChange={handleChange}
              className={errors.estimated_duration ? "border-destructive" : ""}
            />
            {errors.estimated_duration && <p className="text-[11px] text-destructive">{errors.estimated_duration}</p>}
          </div>
        </div>

        {/* Actual Dates (NON-MANDATORY / OPTIONAL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="actual_start_date" className="text-xs font-semibold text-muted-foreground">
                Actual Start Date
              </Label>
              <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
            </div>
            <Input
              id="actual_start_date"
              name="actual_start_date"
              type="date"
              disabled={isLoading}
              value={formData.actual_start_date}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="actual_end_date" className="text-xs font-semibold text-muted-foreground">
                Actual End Date
              </Label>
              <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
            </div>
            <Input
              id="actual_end_date"
              name="actual_end_date"
              type="date"
              disabled={isLoading}
              value={formData.actual_end_date}
              onChange={handleChange}
              className={errors.actual_end_date ? "border-destructive" : ""}
            />
            {errors.actual_end_date && <p className="text-[11px] text-destructive">{errors.actual_end_date}</p>}
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 border-t border-border/40">
        <Button type="submit" disabled={isLoading} className="w-full font-semibold shadow-md">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
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
