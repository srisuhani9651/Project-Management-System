import React, { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Edit3,
  Trash2,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  Send,
  Loader2,
  Paperclip,
  FileQuestion,
  AlertCircle,
  FolderKanban,
  UploadCloud
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PriorityBadge } from "@/components/common/PriorityBadge"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PermissionButton } from "@/components/common/PermissionButton"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { EditTaskModal } from "@/components/project/EditTaskModal"
import { Button } from "@/components/ui/button"
import api from "@/services/api"
import { useProject } from "@/context/ProjectContext"

/**
 * TaskDetails Page Component
 * Connects directly to backend GET /tasks/{task_id} API, enforces PBAC authorization,
 * displays real database fields, and provides interactive status, priority, edit, delete, and comment features.
 */
export function TaskDetails() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { user } = useProject()

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // { status: 403|404|500, detail: string }
  const [actionError, setActionError] = useState(null)
  const [updating, setUpdating] = useState(false)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Options for LOV status/priority mapping
  const [lovs, setLovs] = useState({ statuses: [], priorities: [] })

  // Activity comments state
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")

  // Fetch LOVs
  useEffect(() => {
    const fetchLOVs = async () => {
      try {
        const res = await api.get("/projects/lov")
        if (res.data) {
          setLovs({
            statuses: res.data.statuses || [],
            priorities: res.data.priorities || []
          })
        }
      } catch (err) {
        console.warn("Failed to fetch LOVs:", err)
      }
    }
    fetchLOVs()
  }, [])

  // Fetch Task Details by ID
  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return
    setLoading(true)
    setError(null)
    setActionError(null)

    try {
      let res
      try {
        res = await api.get(`/tasks/${taskId}`)
      } catch (err) {
        // Fallback endpoint try
        if (err?.response?.status === 404) {
          res = await api.get(`/api/manage/task/${taskId}`).catch(() => {
            throw err
          })
        } else {
          throw err
        }
      }

      const data = res.data
      setTask(data)

      // Initialize default comment if empty
      if (data) {
        setComments([
          {
            id: `init-${data.task_id}`,
            user: data.creator_name || data.created_by_name || "System",
            text: `Task "${data.title}" was created.`,
            time: formatDate(data.created_at || new Date().toISOString())
          }
        ])
      }
    } catch (err) {
      console.error("Error loading task details:", err)
      const statusCode = err?.response?.status || 500
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "An unexpected error occurred while fetching task details."

      setError({ status: statusCode, detail })
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchTaskDetails()
  }, [fetchTaskDetails])

  // Status Change Handler
  const handleStatusChange = async (newStatusName) => {
    if (!task || updating) return
    setUpdating(true)
    setActionError(null)

    try {
      const targetStr = (newStatusName || "").toLowerCase().trim()
      const isDone = targetStr === "done" || targetStr === "completed"
      const updatePayload = {
        completed_at: isDone ? new Date().toISOString() : null,
      }

      const match = lovs.statuses.find((s) => {
        const sName = (s.name || "").toLowerCase().trim()
        if (targetStr === "done" || targetStr === "completed") {
          return sName === "completed" || sName === "done"
        }
        if (targetStr === "to do" || targetStr === "todo") {
          return sName === "todo" || sName === "to do"
        }
        if (targetStr === "in progress") {
          return sName === "in progress"
        }
        return sName === targetStr
      })

      if (match) {
        updatePayload.status_id = match.id
      }

      let updateRes
      try {
        updateRes = await api.post(`/tasks/${task.task_id || taskId}`, updatePayload)
      } catch (err) {
        updateRes = await api.post(`/api/manage/task/${task.task_id || taskId}`, updatePayload)
      }

      const updatedTaskObj = updateRes.data?.task || updateRes.data
      if (updatedTaskObj && updatedTaskObj.task_id) {
        setTask(updatedTaskObj)
      } else {
        await fetchTaskDetails()
      }
    } catch (err) {
      console.error("Failed to update status:", err)
      const detail =
        err?.response?.data?.detail ||
        "Access denied: You are not authorized to update this task status."
      setActionError(detail)
    } finally {
      setUpdating(false)
    }
  }

  // Priority Change Handler
  const handlePriorityChange = async (newPriorityName) => {
    if (!task || updating) return
    setUpdating(true)
    setActionError(null)

    try {
      const targetStr = (newPriorityName || "").toLowerCase().trim()
      const updatePayload = {}

      const match = lovs.priorities.find((p) => (p.name || "").toLowerCase().trim() === targetStr)
      if (match) {
        updatePayload.priority_id = match.id
      }

      let updateRes
      try {
        updateRes = await api.post(`/tasks/${task.task_id || taskId}`, updatePayload)
      } catch (err) {
        updateRes = await api.post(`/api/manage/task/${task.task_id || taskId}`, updatePayload)
      }

      const updatedTaskObj = updateRes.data?.task || updateRes.data
      if (updatedTaskObj && updatedTaskObj.task_id) {
        setTask(updatedTaskObj)
      } else {
        await fetchTaskDetails()
      }
    } catch (err) {
      console.error("Failed to update priority:", err)
      const detail =
        err?.response?.data?.detail ||
        "Access denied: You are not authorized to update this task priority."
      setActionError(detail)
    } finally {
      setUpdating(false)
    }
  }

  // Delete Task Handler
  const handleDeleteTask = async () => {
    if (!task) return
    setActionError(null)

    try {
      try {
        await api.delete(`/tasks/${task.task_id || taskId}`)
      } catch (err) {
        await api.delete(`/api/manage/task/${task.task_id || taskId}`)
      }
      navigate(-1)
    } catch (err) {
      console.error("Failed to delete task:", err)
      const detail =
        err?.response?.data?.detail ||
        "Access denied: Tasks can only be deleted if status is 'Todo' and requester is the project owner."
      setActionError(detail)
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const handleSaveTask = async () => {
    await fetchTaskDetails()
    setShowEditModal(false)
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setComments((prev) => [
      {
        id: `c-${Date.now()}`,
        user: user?.fullName || user?.full_name || "Current User",
        text: newComment.trim(),
        time: "Just now",
      },
      ...prev,
    ])
    setNewComment("")
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  function formatDate(dateStr) {
    if (!dateStr) return "N/A"
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    } catch {
      return dateStr
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Fetching task details...</p>
      </div>
    )
  }

  // 403 Forbidden State (PBAC Access Denied)
  if (error && error.status === 403) {
    return (
      <div className="flex-1 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Go Back
        </button>

        <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-md shadow-lg rounded-2xl p-8 text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
            <ShieldAlert className="h-8 w-8 stroke-[2]" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-foreground">403 Forbidden - Access Denied</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {error.detail || "You do not have permission to view this task according to PBAC policy rules."}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="text-xs font-bold rounded-xl"
            >
              Dashboard
            </Button>
            <Button
              onClick={() => navigate("/projects")}
              className="text-xs font-bold rounded-xl bg-primary"
            >
              My Projects
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // 404 Not Found State
  if (error && error.status === 404) {
    return (
      <div className="flex-1 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Go Back
        </button>

        <Card className="border-border bg-card backdrop-blur-md shadow-md rounded-2xl p-8 text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-muted-foreground">
            <FileQuestion className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">404 Not Found - Task Unavailable</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {error.detail || "The requested task does not exist or has been deleted."}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              onClick={() => navigate("/projects")}
              className="text-xs font-bold rounded-xl"
            >
              Back to Projects
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // General Error State
  if (error || !task) {
    return (
      <div className="flex-1 py-12 px-4 max-w-4xl mx-auto w-full text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Unable to load task</h3>
        <p className="text-xs text-muted-foreground">{error?.detail || "Task data could not be retrieved."}</p>
        <Button onClick={fetchTaskDetails} size="sm" variant="outline">Retry</Button>
      </div>
    )
  }

  // Prepared display variables from real DB task data
  const taskTitle = task.title || task.name || "Untitled Task"
  const taskDescription = task.description
  const taskStatus = task.status_name || task.status || "To Do"
  const taskPriority = task.priority_name || task.priority || "Medium"
  const taskType = task.task_type_name || "Task"
  const assigneeName = task.assignee_name || task.assignee || "Unassigned"
  const creatorName = task.creator_name || task.created_by_name || task.createdBy || "Unknown"
  const projectName = task.project_name || task.projectName || "Project Workspace"
  const projectId = task.project_id
  const taskShortKey = task.task_id ? String(task.task_id).slice(0, 8).toUpperCase() : "TASK"
  const dueDateStr = formatDate(task.due_date)
  const createdAtStr = formatDate(task.created_at)
  const updatedAtStr = formatDate(task.updated_at)

  // Map state format expected by EditTaskModal & PermissionButton
  const formattedTaskForModal = {
    id: task.task_id,
    task_id: task.task_id,
    name: taskTitle,
    title: taskTitle,
    description: taskDescription,
    status: taskStatus,
    status_id: task.status_id,
    priority: taskPriority,
    priority_id: task.priority_id,
    task_type_id: task.task_type_id,
    assignee_id: task.assignee_id,
    assignee: assigneeName,
    project_id: projectId,
    projectName: projectName,
    dueDate: dueDateStr,
    due_date: task.due_date,
    createdBy: creatorName,
    created_by: task.created_by
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-6 animate-fade-in">
      
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (projectId ? navigate(`/projects/${projectId}`) : navigate(-1))}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          {projectId ? `Back to ${projectName}` : "Back to Workspace"}
        </button>

        {projectId && (
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline"
          >
            <FolderKanban className="h-3.5 w-3.5" /> View Project Board
          </Link>
        )}
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-xs font-bold text-red-600 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-[11px] underline hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Task Card Header */}
      <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-md rounded-2xl overflow-hidden">
        
        {/* Top Header Section */}
        <CardHeader className="border-b border-border/60 pb-6 bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="h-7 px-3 rounded-lg bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20 shadow-xs">
                  {taskShortKey}
                </span>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                  {projectName}
                </span>
                <span className="text-xs font-extrabold text-muted-foreground bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10">
                  {taskType}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
                {taskTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  Status: <StatusBadge status={taskStatus} />
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  Priority: <PriorityBadge priority={taskPriority} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 pt-1">
              <PermissionButton
                action="update"
                resource="task"
                resourceData={formattedTaskForModal}
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="gap-1.5 font-semibold text-xs rounded-lg shadow-xs"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Task
              </PermissionButton>

              <PermissionButton
                action="delete"
                resource="task"
                resourceData={formattedTaskForModal}
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-1.5 font-semibold text-xs rounded-lg shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </PermissionButton>
            </div>

          </div>
        </CardHeader>

        {/* Task Body Content */}
        <CardContent className="pt-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Description, Status Switcher & Interactive Comments */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Description Card */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Task Description
                </h3>
                <div className="p-5 rounded-2xl border border-border/80 bg-card text-xs text-foreground leading-relaxed shadow-xs whitespace-pre-wrap">
                  {taskDescription || "No detailed description provided for this task."}
                </div>
              </div>

              {/* Status Switcher Buttons */}
              <div className="p-5 rounded-2xl border border-border/80 bg-card/60 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Update Task Status
                  </h3>
                  {updating && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {["To Do", "In Progress", "Done"].map((st) => {
                    const isSelected =
                      taskStatus.toLowerCase().includes(st.toLowerCase().replace(" ", "")) ||
                      (st === "Done" && (taskStatus.toLowerCase().includes("done") || taskStatus.toLowerCase().includes("completed")))

                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={updating || !canEditTask}
                        title={!canEditTask ? "Read-only: Only task assignee or project owner can update task status" : ""}
                        onClick={() => canEditTask && handleStatusChange(st)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          !canEditTask
                            ? "opacity-50 cursor-not-allowed bg-muted/40 text-muted-foreground"
                            : "cursor-pointer"
                        } ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]"
                            : "bg-background border-input hover:bg-muted text-foreground"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-3 p-5 rounded-2xl border border-border/80 bg-card/60 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" /> Task Attachments
                </h3>
                <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 text-center space-y-2">
                  <UploadCloud className="h-7 w-7 text-muted-foreground/50 mx-auto" />
                  <p className="text-xs font-semibold text-foreground">No attachments uploaded yet</p>
                  <p className="text-[11px] text-muted-foreground">Files attached to this task will appear here.</p>
                </div>
              </div>

              {/* Activity & Comments Feed */}
              <div className="space-y-4 pt-2 border-t border-border/60">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> Activity & Discussion ({comments.length})
                </h3>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 h-9 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  />
                  <Button type="submit" size="sm" className="h-9 px-4 font-bold text-xs rounded-xl shadow-xs gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Post
                  </Button>
                </form>

                {/* Comment Feed Items */}
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">{c.user}</span>
                        <span className="text-[10px] text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Metadata Sidebar */}
            <div className="lg:col-span-4 space-y-5 rounded-2xl border border-border/80 bg-card/60 p-5 shadow-xs">
              
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-3">
                Task Metadata
              </h3>

              {/* Assignee */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Assignee</span>
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {getInitials(assigneeName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-extrabold text-foreground">{assigneeName}</span>
                </div>
              </div>

              {/* Priority Select */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Priority Level</span>
                <select
                  value={taskPriority}
                  disabled={updating || !canEditTask}
                  title={!canEditTask ? "Read-only: Only task assignee or project owner can change priority" : ""}
                  onChange={(e) => canEditTask && handlePriorityChange(e.target.value)}
                  className={`w-full h-9 text-xs font-bold rounded-xl border border-input bg-card px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary ${
                    !canEditTask ? "opacity-60 cursor-not-allowed bg-muted/40" : "cursor-pointer"
                  }`}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">Due Date</span>
                <p className="text-xs font-bold text-foreground flex items-center gap-2 bg-muted/40 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" /> {dueDateStr}
                </p>
              </div>

              {/* Created By */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">Reporter / Created By</span>
                <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> {creatorName}
                </p>
              </div>

              {/* Created Date */}
              <div className="space-y-1 pt-1 border-t border-border/50">
                <span className="text-[11px] font-bold text-muted-foreground">Created Date</span>
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {createdAtStr}
                </p>
              </div>

              {/* Last Updated Date */}
              {updatedAtStr && updatedAtStr !== "N/A" && (
                <div className="space-y-1 pt-1 border-t border-border/50">
                  <span className="text-[11px] font-bold text-muted-foreground">Last Updated</span>
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" /> {updatedAtStr}
                  </p>
                </div>
              )}

            </div>

          </div>
        </CardContent>
      </Card>

      {/* Edit Task Modal */}
      {showEditModal && (
        <EditTaskModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          task={formattedTaskForModal}
          onSaveTask={handleSaveTask}
        />
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Task?"
        description={`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`}
        confirmText="Delete Task"
        cancelText="Cancel"
        onConfirm={handleDeleteTask}
      />
    </div>
  )
}

export default TaskDetails
