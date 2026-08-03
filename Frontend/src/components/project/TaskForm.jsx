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

const isUUID = (str) =>
  typeof str === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

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

  const currentUserId = user?.id || user?.user_id || ""
  const currentUserName = user?.fullName || user?.full_name || "Current User"

  const [lovs, setLovs] = useState({
    statuses: [],
    priorities: [],
    project_types: [],
    task_types: [],
    categories: [],
  })

  const [availableProjects, setAvailableProjects] = useState([])
  const [projectMembers, setProjectMembers] = useState([])
  const [lovsLoading, setLovsLoading] = useState(true)
  const [membersLoading, setMembersLoading] = useState(false)

  const [formData, setFormData] = useState({
    project_id: isUUID(projectId) ? projectId : isUUID(initialValues?.project_id) ? initialValues.project_id : "",
    title: initialValues?.title || initialValues?.name || "",
    description: initialValues?.description || "",
    status_id: initialValues?.status_id || "",
    priority_id: initialValues?.priority_id || "",
    task_type_id: initialValues?.task_type_id || "",
    assignee_id: isUUID(initialValues?.assignee_id) ? initialValues.assignee_id : (isUUID(currentUserId) ? currentUserId : ""),
    due_date: initialValues?.due_date ? initialValues.due_date.split("T")[0] : defaultDueDate,
    completed_at: initialValues?.completed_at ? initialValues.completed_at.split("T")[0] : "",
  })

  const [errors, setErrors] = useState({})

  // Fetch project members for the selected project_id
  useEffect(() => {
    async function fetchProjectMembers() {
      if (!formData.project_id || !isUUID(formData.project_id)) {
        setProjectMembers([])
        return
      }
      setMembersLoading(true)
      try {
        const res = await api.get(`/api/members/${formData.project_id}`)
        if (Array.isArray(res.data)) {
          const membersList = res.data.map((m) => ({
            id: m.user_id,
            value: m.user_id,
            name: m.full_name,
            label: m.full_name,
          }))
          setProjectMembers(membersList)

          setFormData((prev) => {
            let selectedAssignee = prev.assignee_id
            const isValid = membersList.some((opt) => String(opt.id) === String(selectedAssignee))
            if (!isValid) {
              if (membersList.length > 0) {
                selectedAssignee = membersList[0].id
              } else if (isUUID(currentUserId)) {
                selectedAssignee = currentUserId
              }
            }
            return { ...prev, assignee_id: selectedAssignee }
          })
        }
      } catch (err) {
        console.warn("Failed to fetch project members for TaskForm:", err)
      } finally {
        setMembersLoading(false)
      }
    }

    fetchProjectMembers()
  }, [formData.project_id, currentUserId])

  useEffect(() => {
    async function fetchLOVsAndProjects() {
      setLovsLoading(true)
      try {
        const [lovRes, projRes] = await Promise.allSettled([
          api.get("/projects/lov"),
          api.get("/projects"),
        ])

        let dbStatuses = []
        let dbPriorities = []
        let dbTaskTypes = []
        let dbProjects = []

        if (lovRes.status === "fulfilled" && lovRes.value?.data) {
          const data = lovRes.value.data
          dbStatuses = data.statuses || []
          dbPriorities = data.priorities || []
          dbTaskTypes = data.task_types || []
          setLovs({
            statuses: dbStatuses,
            priorities: dbPriorities,
            project_types: data.project_types || [],
            task_types: dbTaskTypes,
            categories: data.categories || [],
          })
        }

        if (projRes.status === "fulfilled" && Array.isArray(projRes.value?.data)) {
          dbProjects = projRes.value.data.map((p) => ({
            id: p.project_id,
            name: p.project_name,
          }))
          setAvailableProjects(dbProjects)
        }

        setFormData((prev) => {
          let targetProjId = prev.project_id
          if (!isUUID(targetProjId)) {
            if (isUUID(projectId)) {
              targetProjId = projectId
            } else if (dbProjects.length > 0 && isUUID(dbProjects[0].id)) {
              targetProjId = dbProjects[0].id
            } else {
              targetProjId = ""
            }
          }

          return {
            ...prev,
            project_id: targetProjId,
            status_id: prev.status_id || helperGetId(dbStatuses[0]) || "",
            priority_id: prev.priority_id || helperGetId(dbPriorities[0]) || "",
            task_type_id: prev.task_type_id || helperGetId(dbTaskTypes[0]) || "",
          }
        })
      } catch (err) {
        console.warn("Failed to fetch LOVs/Projects for TaskForm:", err)
      } finally {
        setLovsLoading(false)
      }
    }
    fetchLOVsAndProjects()
  }, [projectId, user])

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

    if (!formData.project_id || !isUUID(formData.project_id)) {
      newErrors.project_id = "A valid project from database is required. Please create a project first."
    }
    if (!formData.title.trim()) newErrors.title = "Task Title is required."
    if (!formData.status_id) newErrors.status_id = "Status selection is required."
    if (!formData.priority_id) newErrors.priority_id = "Priority selection is required."
    if (!formData.task_type_id) newErrors.task_type_id = "Task Type is required."
    if (!formData.assignee_id || !isUUID(formData.assignee_id)) {
      newErrors.assignee_id = "A valid assignee is required."
    }
    if (!formData.due_date) newErrors.due_date = "Due Date is required."

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

  const creatorNameDisplay = initialValues
    ? initialValues.creator_name || initialValues.created_by_name || currentUserName
    : currentUserName

  const creatorInitials = (creatorNameDisplay || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-roboto">

      {/* SECTION 1: BASIC INFORMATION */}
      <div className="space-y-3">
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
            className={`h-9.5 text-xs rounded-xl bg-muted/20 border-border/70 focus-visible:ring-2 focus-visible:ring-blue-500/20 ${
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
        <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
          <span className="font-poppins text-xs font-semibold text-foreground tracking-wide text-muted-foreground uppercase">
            Task Configuration
          </span>
          {(lovsLoading || membersLoading) && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Target Project Dropdown */}
          {availableProjects.length > 0 && (
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold text-foreground">
                Target Project <span className="text-blue-600 font-bold">*</span>
              </Label>
              <CustomSelect
                options={availableProjects}
                value={formData.project_id}
                onChange={(e) => handleCustomSelectChange("project_id", e.target.value)}
                placeholder="Select Target Project"
                disabled={isLoading || lovsLoading}
                error={!!errors.project_id}
              />
              {errors.project_id && <p className="text-[11px] text-rose-500 font-medium">{errors.project_id}</p>}
            </div>
          )}

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

          {/* Assignee (Creator/Owner) */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Assignee (Creator)</span>
              <span className="text-[10px] text-muted-foreground font-normal">Owner</span>
            </Label>
            <div className="flex h-9.5 w-full items-center gap-2.5 rounded-xl border border-border/70 bg-muted/20 px-3 text-xs font-medium text-foreground">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white leading-none">
                {creatorInitials}
              </div>
              <span className="flex-1 truncate">{creatorNameDisplay}</span>
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
          </div>

          {/* Assigned To (Project Member Dropdown) */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">
              Assigned To <span className="text-blue-600 font-bold">*</span>
            </Label>
            <CustomSelect
              options={projectMembers}
              value={formData.assignee_id}
              onChange={(e) => handleCustomSelectChange("assignee_id", e.target.value)}
              placeholder={membersLoading ? "Loading members..." : "Select Assigned Member"}
              disabled={isLoading || lovsLoading || membersLoading}
              error={!!errors.assignee_id}
            />
            {errors.assignee_id && <p className="text-[11px] text-rose-500 font-medium">{errors.assignee_id}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 3: TIMELINE & DUE DATE */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
          <span className="font-poppins text-xs font-semibold text-foreground tracking-wide text-muted-foreground uppercase">
            Schedule & Dates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
      <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-2.5 mt-2">
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
          className="h-9.5 px-6 font-poppins text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs cursor-pointer"
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
