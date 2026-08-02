import React, { useState, useEffect } from "react"
import { AlertCircle, Calendar, Info, Layers, Loader2 } from "lucide-react"
import api from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomSelect } from "@/components/ui/custom-select"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"

/**
 * Modern ProjectForm Component
 * Integrated with CustomSelect dropdowns and CustomDatePicker for an ultra-modern UI.
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

  const handleCustomSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.project_name.trim()) newErrors.project_name = "Project Name is required."
    if (!formData.category_id) newErrors.category_id = "Category selection is required."
    if (!formData.project_type_id) newErrors.project_type_id = "Project Type is required."
    if (!formData.priority_id) newErrors.priority_id = "Priority selection is required."
    if (!formData.status_id) newErrors.status_id = "Status selection is required."
    if (!formData.planned_start_date) newErrors.planned_start_date = "Planned Start Date is required."
    if (!formData.planned_end_date) newErrors.planned_end_date = "Planned End Date is required."
    if (!formData.estimated_duration || parseInt(formData.estimated_duration, 10) < 1) {
      newErrors.estimated_duration = "Valid duration (≥ 1 day) required."
    }

    if (formData.planned_start_date && formData.planned_end_date) {
      if (new Date(formData.planned_end_date) < new Date(formData.planned_start_date)) {
        newErrors.planned_end_date = "End date cannot be earlier than start date."
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
    <form
      onSubmit={handleSubmit}
      className="bg-transparent border-0 shadow-none p-0 sm:bg-card sm:border sm:border-border/80 sm:p-8 sm:rounded-3xl sm:shadow-xl space-y-6 font-roboto"
    >
      
      {/* SECTION 1: BASIC DETAILS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <div className="h-7 w-7 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 stroke-[2.2]" />
          </div>
          <span className="font-poppins text-sm font-semibold text-foreground">Basic Details</span>
        </div>

        {/* Project Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="project_name" className="text-xs font-semibold text-foreground">
              Project Name <span className="text-blue-600 font-bold">*</span>
            </Label>
            <span className="text-[10px] text-muted-foreground font-medium">Required</span>
          </div>
          <Input
            id="project_name"
            name="project_name"
            type="text"
            placeholder="e.g. Q4 Strategic Rebranding"
            disabled={isLoading}
            value={formData.project_name}
            onChange={handleChange}
            className={`h-10 text-xs rounded-xl bg-muted/20 border-border/70 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all ${
              errors.project_name ? "border-rose-500 bg-rose-500/5" : ""
            }`}
          />
          {errors.project_name && (
            <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
              <AlertCircle className="h-3 w-3" /> {errors.project_name}
            </p>
          )}
        </div>

        {/* Project Description */}
        <div className="space-y-1.5">
          <Label htmlFor="project_description" className="text-xs font-semibold text-foreground">
            Project Description <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <textarea
            id="project_description"
            name="project_description"
            rows={3}
            placeholder="Outline project objectives, scope, and key deliverables..."
            disabled={isLoading}
            value={formData.project_description}
            onChange={handleChange}
            className="flex w-full rounded-xl border border-border/70 bg-muted/20 px-3.5 py-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 text-foreground resize-none transition-all placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* SECTION 2: CLASSIFICATION & PARAMETERS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <div className="h-7 w-7 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="h-4 w-4 stroke-[2.2]" />
          </div>
          <span className="font-poppins text-sm font-semibold text-foreground">Classification & Parameters</span>
          {lovsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 ml-auto" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category ID */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Category <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomSelect
              options={lovs.categories}
              value={formData.category_id}
              onChange={(e) => handleCustomSelectChange("category_id", e.target.value)}
              placeholder="Select Category"
              disabled={isLoading || lovsLoading}
              error={!!errors.category_id}
            />
            {errors.category_id && <p className="text-[11px] text-rose-500 font-medium">{errors.category_id}</p>}
          </div>

          {/* Project Type ID */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Project Type <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomSelect
              options={lovs.project_types}
              value={formData.project_type_id}
              onChange={(e) => handleCustomSelectChange("project_type_id", e.target.value)}
              placeholder="Select Type"
              disabled={isLoading || lovsLoading}
              error={!!errors.project_type_id}
            />
            {errors.project_type_id && <p className="text-[11px] text-rose-500 font-medium">{errors.project_type_id}</p>}
          </div>

          {/* Priority ID */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Priority <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomSelect
              options={lovs.priorities}
              value={formData.priority_id}
              onChange={(e) => handleCustomSelectChange("priority_id", e.target.value)}
              placeholder="Set Priority"
              disabled={isLoading || lovsLoading}
              error={!!errors.priority_id}
            />
            {errors.priority_id && <p className="text-[11px] text-rose-500 font-medium">{errors.priority_id}</p>}
          </div>

          {/* Initial Status ID */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Initial Status <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomSelect
              options={lovs.statuses}
              value={formData.status_id}
              onChange={(e) => handleCustomSelectChange("status_id", e.target.value)}
              placeholder="Initial Status"
              disabled={isLoading || lovsLoading}
              error={!!errors.status_id}
            />
            {errors.status_id && <p className="text-[11px] text-rose-500 font-medium">{errors.status_id}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 3: TIMELINE & DURATION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <div className="h-7 w-7 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4 stroke-[2.2]" />
          </div>
          <span className="font-poppins text-sm font-semibold text-foreground">Timeline & Duration</span>
        </div>

        {/* Mandatory Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Planned Start Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Planned Start <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomDatePicker
              name="planned_start_date"
              value={formData.planned_start_date}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.planned_start_date}
            />
            {errors.planned_start_date && <p className="text-[11px] text-rose-500 font-medium">{errors.planned_start_date}</p>}
          </div>

          {/* Planned End Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Planned End <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomDatePicker
              name="planned_end_date"
              value={formData.planned_end_date}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.planned_end_date}
            />
            {errors.planned_end_date && <p className="text-[11px] text-rose-500 font-medium">{errors.planned_end_date}</p>}
          </div>

          {/* Estimated Duration */}
          <div className="space-y-1.5">
            <Label htmlFor="estimated_duration" className="text-xs font-semibold text-foreground">
              Est. Duration (Days) <span className="text-blue-600 font-bold">*</span>
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
              className={`h-10 text-xs rounded-xl bg-muted/20 border-border/70 focus-visible:ring-2 focus-visible:ring-blue-500/20 ${
                errors.estimated_duration ? "border-rose-500" : ""
              }`}
            />
            {errors.estimated_duration && <p className="text-[11px] text-rose-500 font-medium">{errors.estimated_duration}</p>}
          </div>
        </div>

        {/* Optional Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Actual Start Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Actual Start <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <CustomDatePicker
              name="actual_start_date"
              value={formData.actual_start_date}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Actual End Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Actual End <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <CustomDatePicker
              name="actual_end_date"
              value={formData.actual_end_date}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Form Submission Footer */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
        <Button
          type="submit"
          disabled={isLoading || lovsLoading}
          className="w-full sm:w-auto h-10 px-8 font-poppins font-semibold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Project...
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
