import React, { useState, useEffect } from "react"
import { AlertCircle, Calendar, Info, Layers, Loader2, User } from "lucide-react"
import api from "@/services/api"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomSelect } from "@/components/ui/custom-select"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"

const helperGetId = (item) => item?.id || item?.status_id || item?.priority_id || item?.task_type_id || ""
const helperGetName = (item) => item?.name || item?.status_name || item?.priority_name || item?.type_name || ""

/**
 * TaskForm Component
 * Integrated with CustomSelect dropdowns and CustomDatePicker for ultra-modern task editing/creation.
 */
export function TaskForm({
  initialValues = null,
  projectId = "",
  onSubmit,
  isLoading = false,
  submitLabel = "Save Task",
  onCancel,
}) {
  const { user } = useProject()
  const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const currentUserId = user?.id || ""
  const currentUserName = user?.fullName || user?.full_name || "Current User"

  const [lovs, setLovs] = useState({
    statuses: [],
    priorities: [],
    project_types: [],
    task_types: [],
    categories: [],
  })

  const [lovsLoading, setLovsLoading] = useState(true)

  const [formData, setFormData] = useState({
    project_id: projectId || initialValues?.project_id || "",
    title: initialValues?.title || initialValues?.name || "",
    description: initialValues?.description || "",
    status_id: initialValues?.status_id || "",
    priority_id: initialValues?.priority_id || "",
    task_type_id: initialValues?.task_type_id || "",
    assignee_id: initialValues?.assignee_id || currentUserId,
    due_date: initialValues?.due_date ? initialValues.due_date.split("T")[0] : defaultDueDate,
    completed_at: initialValues?.completed_at ? initialValues.completed_at.split("T")[0] : "",
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    async function fetchLOVs() {
      setLovsLoading(true)
      try {
        const res = await api.get("/projects/lov")
        const data = res.data || {}
        setLovs({
          statuses: data.statuses || [],
          priorities: data.priorities || [],
          project_types: data.project_types || [],
          task_types: data.task_types || [],
          categories: data.categories || [],
        })

        setFormData((prev) => ({
          ...prev,
          status_id: prev.status_id || helperGetId(data.statuses?.[0]) || "",
          priority_id: prev.priority_id || helperGetId(data.priorities?.[0]) || "",
          task_type_id: prev.task_type_id || helperGetId(data.task_types?.[0]) || "",
        }))
      } catch (err) {
        console.warn("Failed to fetch LOVs for TaskForm:", err)
      } finally {
        setLovsLoading(false)
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

  const handleCustomSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = "Task Title is required."
    if (!formData.status_id) newErrors.status_id = "Status selection is required."
    if (!formData.priority_id) newErrors.priority_id = "Priority selection is required."
    if (!formData.task_type_id) newErrors.task_type_id = "Task Type is required."
    if (!formData.assignee_id) newErrors.assignee_id = "Assignee is required."
    if (!formData.due_date) newErrors.due_date = "Due Date is required."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      project_id: formData.project_id || projectId,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      status_id: formData.status_id,
      priority_id: formData.priority_id,
      task_type_id: formData.task_type_id,
      assignee_id: formData.assignee_id,
      due_date: new Date(formData.due_date).toISOString(),
      completed_at: formData.completed_at ? new Date(formData.completed_at).toISOString() : null,
    }

    onSubmit(payload)
  }

  const assigneeInitials = currentUserName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-roboto">

      {/* SECTION 1: BASIC INFORMATION */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <div className="h-6 w-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Info className="h-3.5 w-3.5 stroke-[2.2]" />
          </div>
          <span className="font-poppins text-xs font-semibold text-foreground">Task Details</span>
        </div>

        {/* Task Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="taskTitle" className="text-xs font-semibold text-foreground">
              Task Title <span className="text-blue-600 font-bold">*</span>
            </Label>
            <span className="text-[10px] text-muted-foreground font-medium">Required</span>
          </div>
          <Input
            id="taskTitle"
            name="title"
            type="text"
            placeholder="e.g. Implement JWT Authentication Middleware"
            disabled={isLoading}
            value={formData.title}
            onChange={handleChange}
            className={`h-9 text-xs rounded-xl bg-muted/20 border-border/70 focus-visible:ring-2 focus-visible:ring-blue-500/20 ${
              errors.title ? "border-rose-500 bg-rose-500/5" : ""
            }`}
          />
          {errors.title && (
            <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {errors.title}
            </p>
          )}
        </div>

        {/* Task Description */}
        <div className="space-y-1">
          <Label htmlFor="taskDescription" className="text-xs font-semibold text-foreground">
            Task Description <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <textarea
            id="taskDescription"
            name="description"
            rows={2}
            placeholder="Detailed task description..."
            disabled={isLoading}
            value={formData.description}
            onChange={handleChange}
            className="flex w-full rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 text-foreground resize-none"
          />
        </div>
      </div>

      {/* SECTION 2: CLASSIFICATION & ASSIGNEE */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <div className="h-6 w-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="h-3.5 w-3.5 stroke-[2.2]" />
          </div>
          <span className="font-poppins text-xs font-semibold text-foreground">Classification & Assignee</span>
          {lovsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 ml-auto" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Status */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">
              Status <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomSelect
              options={lovs.statuses}
              value={formData.status_id}
              onChange={(e) => handleCustomSelectChange("status_id", e.target.value)}
              placeholder="Select Status"
              disabled={isLoading || lovsLoading}
              error={!!errors.status_id}
            />
            {errors.status_id && <p className="text-[11px] text-rose-500 font-medium">{errors.status_id}</p>}
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">
              Priority <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomSelect
              options={lovs.priorities}
              value={formData.priority_id}
              onChange={(e) => handleCustomSelectChange("priority_id", e.target.value)}
              placeholder="Select Priority"
              disabled={isLoading || lovsLoading}
              error={!!errors.priority_id}
            />
            {errors.priority_id && <p className="text-[11px] text-rose-500 font-medium">{errors.priority_id}</p>}
          </div>

          {/* Task Type */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">
              Task Type <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomSelect
              options={lovs.task_types}
              value={formData.task_type_id}
              onChange={(e) => handleCustomSelectChange("task_type_id", e.target.value)}
              placeholder="Select Task Type"
              disabled={isLoading || lovsLoading}
              error={!!errors.task_type_id}
            />
            {errors.task_type_id && <p className="text-[11px] text-rose-500 font-medium">{errors.task_type_id}</p>}
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">
              Assignee <span className="text-blue-600 font-bold">*</span>
            </Label>
            <div
              className={`flex h-10 w-full items-center gap-2.5 rounded-xl border bg-muted/20 px-3 text-xs font-medium text-foreground ${
                errors.assignee_id ? "border-rose-500" : "border-border/70"
              }`}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white leading-none">
                {assigneeInitials}
              </div>
              <span className="flex-1 truncate">{currentUserName}</span>
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: TIMELINE & DUE DATE */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <div className="h-6 w-6 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
          </div>
          <span className="font-poppins text-xs font-semibold text-foreground">Timeline & Schedule</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Due Date */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">
              Due Date <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomDatePicker
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.due_date}
            />
            {errors.due_date && <p className="text-[11px] text-rose-500 font-medium">{errors.due_date}</p>}
          </div>

          {/* Completion Date */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">
              Completed Date <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <CustomDatePicker
              name="completed_at"
              value={formData.completed_at}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Form Submission Footer */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2.5">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-9 px-4 font-poppins text-xs font-semibold rounded-xl"
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isLoading || lovsLoading}
          className="h-9 px-6 font-poppins text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs cursor-pointer"
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

export default TaskForm
