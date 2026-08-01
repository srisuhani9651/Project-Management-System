import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Edit3,
  Trash2,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PriorityBadge } from "@/components/common/PriorityBadge"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PermissionButton } from "@/components/common/PermissionButton"
import { AlertDialog } from "@/components/ui/alert-dialog"

export function TaskDetails() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Mock task state initialized with realistic data
  const [task, setTask] = useState({
    id: taskId || "task-101",
    key: "KAN-101",
    name: "Setup Authentication Middleware & JWT Validation",
    description:
      "Implement secure JWT validation middleware for Express API routes. Include token expiration checks, refresh token rotation, and PBAC authorization middleware.",
    priority: "High",
    status: "In Progress",
    dueDate: "Aug 15, 2026",
    createdBy: "Suhani Srivastava",
    createdAt: "Aug 1, 2026",
    assignee: "Suhani Srivastava",
    projectKey: "KAN",
    projectName: "Kanban Project",
  })

  // Immediate status change handler
  const handleStatusChange = (newStatus) => {
    setTask((prev) => ({ ...prev, status: newStatus }))
  }

  // Priority change handler
  const handlePriorityChange = (newPriority) => {
    setTask((prev) => ({ ...prev, priority: newPriority }))
  }

  const handleDeleteTask = () => {
    navigate(-1)
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
      
      {/* Top Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Project
      </button>

      {/* Main Task Header Card */}
      <Card className="border border-border/80 bg-card shadow-sm rounded-2xl">
        <CardHeader className="border-b border-border/60 pb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            
            {/* Left side: Key, Title, Badges */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="h-7 px-2.5 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  {task.key}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {task.projectName}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {task.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  Status: <StatusBadge status={task.status} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  Priority: <PriorityBadge priority={task.priority} />
                </div>
              </div>
            </div>

            {/* Right side: Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <PermissionButton
                action="update"
                resource="task"
                resourceData={task}
                variant="outline"
                size="sm"
                className="gap-1.5 font-medium"
              >
                <Edit3 className="h-4 w-4" /> Edit Task
              </PermissionButton>

              <PermissionButton
                action="delete"
                resource="task"
                resourceData={task}
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-1.5 font-semibold shadow-xs"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </PermissionButton>
            </div>

          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          
          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Left 2 Columns: Description & Details */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Task Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </h3>
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground leading-relaxed">
                  {task.description || "No detailed description provided for this task."}
                </div>
              </div>

              {/* Status Update Quick Select */}
              <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Update Task Status
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select a new status to update board column placement immediately.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {["To Do", "In Progress", "Done"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        task.status === st
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-background border-input hover:bg-accent text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Meta Information sidebar */}
            <div className="space-y-6 rounded-xl border border-border/70 bg-card p-5">
              
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
                Task Information
              </h3>

              {/* Assignee */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">Assignee</span>
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {getInitials(task.assignee)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-foreground">{task.assignee}</span>
                </div>
              </div>

              {/* Created By */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Created By</span>
                <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" /> {task.createdBy}
                </p>
              </div>

              {/* Priority Select */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">Priority</span>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full h-8 text-xs font-medium rounded-md border border-input bg-card px-2 text-foreground focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Due Date</span>
                <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> {task.dueDate}
                </p>
              </div>

              {/* Created Date */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Created Date</span>
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {task.createdAt}
                </p>
              </div>

            </div>

          </div>

        </CardContent>
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Task?"
        description={`Are you sure you want to delete "${task.name}"? This action cannot be undone.`}
        confirmText="Delete Task"
        cancelText="Cancel"
        onConfirm={handleDeleteTask}
      />
    </div>
  )
}

export default TaskDetails
