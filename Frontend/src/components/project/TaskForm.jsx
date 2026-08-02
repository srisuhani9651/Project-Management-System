import React, { useState, useEffect } from "react"
import { AlertCircle, Calendar, Info, Layers, Loader2, User } from "lucide-react"
import api from "@/services/api"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const helperGetId = (item) => item?.id || item?.status_id || item?.priority_id || item?.task_type_id || ""
const helperGetName = (item) => item?.name || item?.status_name || item?.priority_name || item?.type_name || ""

/**
 * TaskForm Component
 * Fully synced with backend PostgreSQL model `tracker.tasks` & FastAPI `TaskCreate` schema.
 * All mandatory fields feature red asterisks and auto-initialization.
 * Assignee field shows current user's full_name; UUID is submitted in payload.
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

  // The user's real UUID from context (stored during login)
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

  // Fetch LOVs when component mounts
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

  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = "Task Title is mandatory."
    if (!formData.status_id) newErrors.status_id = "Status selection is mandatory."
    if (!formData.priority_id) newErrors.priority_id = "Priority selection is mandatory."
    if (!formData.task_type_id) newErrors.task_type_id = "Task Type selection is mandatory."
    if (!formData.assignee_id) newErrors.assignee_id = "Assignee is mandatory."
    if (!formData.due_date) newErrors.due_date = "Due Date is mandatory."

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

  const taskTypesList = lovs.task_types || []

  // Build initials from name
  const assigneeInitials = currentUserName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">

      {/* SECTION 1: BASIC INFORMATION */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs">
          <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Info className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
          <span>Basic Information</span>
        </div>

        {/* Task Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="taskTitle" className="text-xs font-bold text-foreground">
              Task Title <span className="text-red-500 font-bold">*</span>
            </Label>
            <span className="text-[11px] font-bold text-red-500">* Required</span>
          </div>
          <Input
            id="taskTitle"
            name="title"
            type="text"
            placeholder="e.g. Implement JWT Authentication Middleware"
            disabled={isLoading}
            value={formData.title}
            onChange={handleChange}
            className={`h-9 text-xs rounded-lg bg-muted/20 border-border/80 focus-visible:ring-blue-600 ${
              errors.title ? "border-red-500" : ""
            }`}
          />
          {errors.title && (
            <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.title}
            </p>
          )}
        </div>

        {/* Task Description */}
        <div className="space-y-1">
          <Label htmlFor="taskDescription" className="text-xs font-bold text-foreground">
            Task Description (Optional)
          </Label>
          <textarea
            id="taskDescription"
            name="description"
            rows={2}
            placeholder="Detailed task description..."
            disabled={isLoading}
            value={formData.description}
            onChange={handleChange}
            className="flex w-full rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 text-foreground resize-none"
          />
        </div>
      </div>

      <div className="border-t border-border/60" />

      {/* SECTION 2: CLASSIFICATION & ASSIGNEE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs">
          <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Layers className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
          <span>Classification &amp; Assignee</span>
          {lovsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 ml-auto" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Status */}
          <div className="space-y-1">
            <Label htmlFor="status_id" className="text-xs font-bold text-foreground">
              Status <span className="text-red-500 font-bold">*</span>
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
              <option value="" disabled>Select Status</option>
              {(lovs.statuses || []).map((s) => (
                <option key={helperGetId(s)} value={helperGetId(s)}>
                  {helperGetName(s)}
                </option>
              ))}
            </select>
            {errors.status_id && <p className="text-[11px] text-red-500 font-semibold">{errors.status_id}</p>}
          </div>

          {/* Priority */}
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
              <option value="" disabled>Select Priority</option>
              {(lovs.priorities || []).map((p) => (
                <option key={helperGetId(p)} value={helperGetId(p)}>
                  {helperGetName(p)}
                </option>
              ))}
            </select>
            {errors.priority_id && <p className="text-[11px] text-red-500 font-semibold">{errors.priority_id}</p>}
          </div>

          {/* Task Type */}
          <div className="space-y-1">
            <Label htmlFor="task_type_id" className="text-xs font-bold text-foreground">
              Task Type <span className="text-red-500 font-bold">*</span>
            </Label>
            <select
              id="task_type_id"
              name="task_type_id"
              disabled={isLoading || lovsLoading}
              value={formData.task_type_id}
              onChange={handleChange}
              className={`flex h-9 w-full rounded-lg border bg-muted/20 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 text-foreground ${
                errors.task_type_id ? "border-red-500" : "border-border/80"
              }`}
            >
              <option value="" disabled>Select Task Type</option>
              {taskTypesList.map((pt) => (
                <option key={helperGetId(pt)} value={helperGetId(pt)}>
                  {helperGetName(pt)}
                </option>
              ))}
            </select>
            {errors.task_type_id && <p className="text-[11px] text-red-500 font-semibold">{errors.task_type_id}</p>}
          </div>

          {/* Assignee — displays name, UUID stays in hidden field */}
          <div className="space-y-1">
            <Label htmlFor="assignee_display" className="text-xs font-bold text-foreground">
              Assignee <span className="text-red-500 font-bold">*</span>
            </Label>
            <div
              className={`flex h-9 w-full items-center gap-2 rounded-lg border bg-muted/30 px-3 text-xs font-semibold text-foreground ${
                errors.assignee_id ? "border-red-500" : "border-border/80"
              }`}
            >
              {/* Colored initials badge */}
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white leading-none">
                {assigneeInitials}
              </div>
              <span className="flex-1 truncate">{currentUserName}</span>
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
            {/* Hidden input carries actual UUID for payload */}
            <input type="hidden" name="assignee_id" value={formData.assignee_id} />
            {errors.assignee_id && <p className="text-[11px] text-red-500 font-semibold">{errors.assignee_id}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60" />

      {/* SECTION 3: TIMELINE & DUE DATE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs">
          <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Calendar className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
          <span>Timeline &amp; Dates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Due Date */}
          <div className="space-y-1">
            <Label htmlFor="due_date" className="text-xs font-bold text-foreground">
              Due Date <span className="text-red-500 font-bold">*</span>
            </Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              disabled={isLoading}
              value={formData.due_date}
              onChange={handleChange}
              className={`h-9 text-xs rounded-lg bg-muted/20 border-border/80 focus-visible:ring-blue-600 ${
                errors.due_date ? "border-red-500" : ""
              }`}
            />
            {errors.due_date && <p className="text-[11px] text-red-500 font-semibold">{errors.due_date}</p>}
          </div>

          {/* Completion Date */}
          <div className="space-y-1">
            <Label htmlFor="completed_at" className="text-xs font-bold text-foreground">
              Completed Date (Optional)
            </Label>
            <Input
              id="completed_at"
              name="completed_at"
              type="date"
              disabled={isLoading}
              value={formData.completed_at}
              onChange={handleChange}
              className="h-9 text-xs rounded-lg bg-muted/20 border-border/80 focus-visible:ring-blue-600"
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
            className="h-9 px-4 font-bold text-xs rounded-lg"
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isLoading || lovsLoading}
          className="h-9 px-6 font-bold text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer"
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
