import React, { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, Clock, ListTodo, Loader2 } from "lucide-react"
import api from "@/services/api"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * TaskForm Component
 * Fully synced with backend SQLAlchemy model: `tracker.tasks` (app/models/tracker/tasks.py)
 * 
 * FIELD RULES:
 * - project_id: MANDATORY (nullable=False)
 * - title: MANDATORY (nullable=False)
 * - status_id: MANDATORY (nullable=False)
 * - priority_id: MANDATORY (nullable=False)
 * - task_type_id: MANDATORY (nullable=False)
 * - assignee_id: MANDATORY (nullable=False)
 * - due_date: MANDATORY (nullable=False)
 * - description: OPTIONAL (nullable=True)
 * - completed_at: OPTIONAL (nullable=True)
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

  const [lovs, setLovs] = useState({
    statuses: [],
    priorities: [],
    project_types: [],
    task_types: [],
    categories: [],
  })

  const [formData, setFormData] = useState({
    project_id: projectId || initialValues?.project_id || "",
    title: initialValues?.title || initialValues?.name || "",
    description: initialValues?.description || "",
    status_id: initialValues?.status_id || "",
    priority_id: initialValues?.priority_id || "",
    task_type_id: initialValues?.task_type_id || "",
    assignee_id: initialValues?.assignee_id || user?.id || "",
    due_date: initialValues?.due_date ? initialValues.due_date.split("T")[0] : (initialValues?.dueDate || ""),
    completed_at: initialValues?.completed_at ? initialValues.completed_at.split("T")[0] : "",
  })

  const [errors, setErrors] = useState({})

  // Fetch LOVs when component mounts
  useEffect(() => {
    async function fetchLOVs() {
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
          status_id: prev.status_id || data.statuses?.[0]?.id || "",
          priority_id: prev.priority_id || data.priorities?.[0]?.id || "",
          task_type_id: prev.task_type_id || data.task_types?.[0]?.id || "",
        }))
      } catch (err) {
        console.warn("Failed to fetch LOVs for TaskForm:", err)
      }
    }
    fetchLOVs()
  }, [])

  // Keep project_id synced if passed in props
  useEffect(() => {
    if (projectId) {
      setFormData((prev) => ({ ...prev, project_id: projectId }))
    }
  }, [projectId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors = {}

    // Mandatory Field Checks according to tasks.py model
    if (!formData.title.trim()) {
      newErrors.title = "Task Title is mandatory."
    }
    if (!formData.project_id) {
      newErrors.project_id = "Project ID selection is mandatory."
    }
    if (!formData.status_id) {
      newErrors.status_id = "Status selection is mandatory."
    }
    if (!formData.priority_id) {
      newErrors.priority_id = "Priority selection is mandatory."
    }
    if (!formData.task_type_id) {
      newErrors.task_type_id = "Task Type selection is mandatory."
    }
    if (!formData.assignee_id) {
      newErrors.assignee_id = "Assignee is mandatory."
    }
    if (!formData.due_date) {
      newErrors.due_date = "Due Date is mandatory."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      project_id: formData.project_id,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      
      {/* Task Title (MANDATORY) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="taskTitle" className="text-xs font-semibold">
            Task Title <span className="text-destructive font-bold">*</span>
          </Label>
          <span className="text-[10px] text-destructive font-medium">Mandatory</span>
        </div>
        <Input
          id="taskTitle"
          name="title"
          type="text"
          placeholder="e.g. Implement JWT Authentication Middleware"
          disabled={isLoading}
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {errors.title && (
          <p className="text-[11px] text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {errors.title}
          </p>
        )}
      </div>

      {/* Description (NON-MANDATORY / OPTIONAL) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="taskDescription" className="text-xs font-semibold">
            Description
          </Label>
          <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
        </div>
        <textarea
          id="taskDescription"
          name="description"
          rows={3}
          placeholder="Detailed task description and requirements..."
          disabled={isLoading}
          value={formData.description}
          onChange={handleChange}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground resize-none"
        />
      </div>

      {/* Grid 1: Status (MANDATORY) & Priority (MANDATORY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="status_id" className="text-xs font-semibold">
              Status <span className="text-destructive font-bold">*</span>
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
            {(lovs.statuses || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.status_id && <p className="text-[11px] text-destructive">{errors.status_id}</p>}
        </div>

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
            {(lovs.priorities || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.priority_id && <p className="text-[11px] text-destructive">{errors.priority_id}</p>}
        </div>
      </div>

      {/* Grid 2: Task Type (MANDATORY) & Assignee (MANDATORY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="task_type_id" className="text-xs font-semibold">
              Task Type <span className="text-destructive font-bold">*</span>
            </Label>
            <span className="text-[10px] text-muted-foreground">Mandatory</span>
          </div>
          <select
            id="task_type_id"
            name="task_type_id"
            disabled={isLoading}
            value={formData.task_type_id}
            onChange={handleChange}
            className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground ${
              errors.task_type_id ? "border-destructive" : "border-input"
            }`}
          >
            <option value="" disabled>Select Task Type</option>
            {taskTypesList.length > 0 ? (
              taskTypesList.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))
            ) : (
              <option value={user?.id || "default-type"}>Feature Task</option>
            )}
          </select>
          {errors.task_type_id && <p className="text-[11px] text-destructive">{errors.task_type_id}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="assignee_id" className="text-xs font-semibold">
              Assignee <span className="text-destructive font-bold">*</span>
            </Label>
            <span className="text-[10px] text-muted-foreground">Mandatory</span>
          </div>
          <Input
            id="assignee_id"
            name="assignee_id"
            type="text"
            placeholder="Assignee User ID"
            disabled={isLoading}
            value={formData.assignee_id}
            onChange={handleChange}
            className={errors.assignee_id ? "border-destructive" : ""}
          />
          {errors.assignee_id && <p className="text-[11px] text-destructive">{errors.assignee_id}</p>}
        </div>
      </div>

      {/* Grid 3: Due Date (MANDATORY) & Completed At (OPTIONAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="due_date" className="text-xs font-semibold">
              Due Date <span className="text-destructive font-bold">*</span>
            </Label>
            <span className="text-[10px] text-muted-foreground">Mandatory</span>
          </div>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            disabled={isLoading}
            value={formData.due_date}
            onChange={handleChange}
            className={errors.due_date ? "border-destructive" : ""}
          />
          {errors.due_date && <p className="text-[11px] text-destructive">{errors.due_date}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="completed_at" className="text-xs font-semibold text-muted-foreground">
              Completed At
            </Label>
            <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
          </div>
          <Input
            id="completed_at"
            name="completed_at"
            type="date"
            disabled={isLoading}
            value={formData.completed_at}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex gap-3 pt-3 border-t border-border/40">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading} className="w-1/2">
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isLoading} className={`${onCancel ? "w-1/2" : "w-full"} font-semibold shadow-xs`}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Saving...
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
