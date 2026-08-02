import React, { useState } from "react"
import { createPortal } from "react-dom"
import { Edit3, X } from "lucide-react"
import api from "@/services/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TaskForm } from "./TaskForm"

export function EditTaskModal({ open, onOpenChange, task, onSaveTask }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open || !task) return null

  const taskId = task.task_id || task.id

  const handleSubmit = async (payload) => {
    setIsLoading(true)
    setError("")

    try {
      // POST http://localhost:8000/tasks/{task_id}
      const res = await api.post(`/tasks/${taskId}`, payload)
      const updatedTask = res.data.task || res.data

      if (onSaveTask) {
        onSaveTask(updatedTask)
      }

      onOpenChange(false)
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail
          ? typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : Array.isArray(err.response.data.detail)
            ? err.response.data.detail[0]?.msg || "Failed to update task"
            : "Failed to update task"
          : "Unable to connect to backend server."
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onOpenChange(false)
        }
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto font-roboto"
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[88vh] flex flex-col border border-border/80 bg-card shadow-2xl rounded-2xl relative my-auto animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer z-10 p-1.5 rounded-xl hover:bg-muted/70 transition-colors"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="py-4 px-6 border-b border-border/50 shrink-0 bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2.5 pr-8">
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Edit3 className="h-4 w-4" />
            </div>
            <span className="truncate">Edit Task — {task.key || task.name || task.title}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {error}
            </div>
          )}

          <TaskForm
            initialValues={task}
            projectId={task.project_id}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Update Task"
            onCancel={() => onOpenChange(false)}
          />
        </CardContent>
      </Card>
    </div>,
    document.body
  )
}

export default EditTaskModal
