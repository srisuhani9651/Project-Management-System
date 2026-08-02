import React, { useState } from "react"
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <Card className="w-full max-w-lg border border-border/80 bg-card shadow-2xl rounded-2xl relative my-8 animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" /> Edit Task — {task.key || task.name || task.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4 max-h-[80vh] overflow-y-auto pr-1">
          {error && (
            <div className="mb-3 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
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
    </div>
  )
}

export default EditTaskModal
