import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Edit3,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Tag,
  ShieldAlert,
  Send
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PriorityBadge } from "@/components/common/PriorityBadge"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PermissionButton } from "@/components/common/PermissionButton"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { EditTaskModal } from "@/components/project/EditTaskModal"
import { Button } from "@/components/ui/button"

/**
 * TaskDetails Page Component
 * Modern, rich task workspace page displaying task title, status pill switcher, priority,
 * detailed metadata sidebar, activity comments timeline, and PBAC actions.
 */
export function TaskDetails() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Interactive Task State
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

  // Comments feed state
  const [comments, setComments] = useState([
    {
      id: "c1",
      user: "Suhani Srivastava",
      text: "Updated JWT middleware with refresh token rotation handling.",
      time: "2 hours ago",
    },
    {
      id: "c2",
      user: "John Doe",
      text: "Please verify status codes returned for unauthenticated requests.",
      time: "5 hours ago",
    },
  ])
  const [newComment, setNewComment] = useState("")

  const handleStatusChange = (newStatus) => {
    setTask((prev) => ({ ...prev, status: newStatus }))
  }

  const handlePriorityChange = (newPriority) => {
    setTask((prev) => ({ ...prev, priority: newPriority }))
  }

  const handleDeleteTask = () => {
    navigate(-1)
  }

  const handleSaveTask = (updatedTask) => {
    setTask(updatedTask)
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setComments((prev) => [
      {
        id: `c-${Date.now()}`,
        user: "Suhani Srivastava",
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

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-6 animate-fade-in">
      
      {/* Top Navigation Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors group cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Project
      </button>

      {/* Task Header Header Card */}
      <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-md rounded-2xl overflow-hidden">
        
        {/* Top Header Section */}
        <CardHeader className="border-b border-border/60 pb-6 bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="h-7 px-3 rounded-lg bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20 shadow-xs">
                  {task.key}
                </span>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                  {task.projectName}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
                {task.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  Status: <StatusBadge status={task.status} />
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  Priority: <PriorityBadge priority={task.priority} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 pt-1">
              <PermissionButton
                action="update"
                resource="task"
                resourceData={task}
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
                resourceData={task}
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
            
            {/* Left Column: Description & Interactive Comments */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Description Card */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Task Description
                </h3>
                <div className="p-5 rounded-2xl border border-border/80 bg-card text-xs text-foreground leading-relaxed shadow-xs">
                  {task.description || "No detailed description provided for this task."}
                </div>
              </div>

              {/* Status Switcher Buttons */}
              <div className="p-5 rounded-2xl border border-border/80 bg-card/60 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Update Task Status
                </h3>

                <div className="flex flex-wrap gap-2 pt-1">
                  {["To Do", "In Progress", "Done"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        task.status === st
                          ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]"
                          : "bg-background border-input hover:bg-muted text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments Feed */}
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
                      {getInitials(task.assignee)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-extrabold text-foreground">{task.assignee}</span>
                </div>
              </div>

              {/* Priority Select */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Priority Level</span>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full h-9 text-xs font-bold rounded-xl border border-input bg-card px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
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
                  <Calendar className="h-4 w-4 text-primary" /> {task.dueDate}
                </p>
              </div>

              {/* Created By */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">Reporter / Created By</span>
                <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> {task.createdBy}
                </p>
              </div>

              {/* Created Date */}
              <div className="space-y-1 pt-1 border-t border-border/50">
                <span className="text-[11px] font-bold text-muted-foreground">Created Date</span>
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {task.createdAt}
                </p>
              </div>

            </div>

          </div>
        </CardContent>
      </Card>

      {/* Edit Task Modal */}
      <EditTaskModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        task={task}
        onSaveTask={handleSaveTask}
      />

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
