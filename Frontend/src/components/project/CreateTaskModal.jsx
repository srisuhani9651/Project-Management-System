import React, { useState } from "react"
import { X, Plus } from "lucide-react"
import api from "@/services/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TaskForm } from "./TaskForm"

export function CreateTaskModal({ open, onOpenChange, onCreateTask, projectId, projectKey }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

  const handleSubmit = async (payload) => {
    setIsLoading(true)
    setError("")

    try {
      // POST http://localhost:8000/tasks
      const res = await api.post("/tasks", payload)
      const createdTask = res.data.task || res.data

      onCreateTask(createdTask)
      onOpenChange(false)
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail
          ? typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : Array.isArray(err.response.data.detail)
            ? err.response.data.detail[0]?.msg || "Failed to create task"
            : "Failed to create task"
          : "Unable to connect to backend server."
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <Card className="w-full max-w-lg border border-border/80 bg-card shadow-2xl rounded-2xl relative my-8 animate-in zoom-in-95 duration-150 overflow-hidden">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer z-10"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-3 border-b border-border/40 px-5">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> Create New Task
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4 px-5 pb-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="mb-3 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {error}
            </div>
          )}

          <TaskForm
            projectId={projectId}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Create Task"
            onCancel={() => onOpenChange(false)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateTaskModal
