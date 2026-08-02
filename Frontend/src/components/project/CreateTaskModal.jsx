import React, { useState, useEffect } from "react"
import { Plus, X, Loader2, AlertCircle } from "lucide-react"
import api from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function CreateTaskModal({ open, onOpenChange, onCreateTask, projectId, projectKey }) {
  const [lovs, setLovs] = useState({
    statuses: [],
    priorities: [],
    task_types: [],
  })

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status_id: "",
    priority_id: "",
    dueDate: "",
  })

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Fetch LOVs when modal opens
  useEffect(() => {
    async function fetchLOVs() {
      try {
        const res = await api.get("/projects/lov")
        setLovs(res.data)
        if (res.data.statuses?.length > 0) {
          setFormData((prev) => ({ ...prev, status_id: prev.status_id || res.data.statuses[0].id }))
        }
        if (res.data.priorities?.length > 0) {
          setFormData((prev) => ({ ...prev, priority_id: prev.priority_id || res.data.priorities[0].id }))
        }
      } catch (err) {
        console.warn("Failed to fetch LOVs for task creation:", err)
      }
    }
    if (open) {
      fetchLOVs()
    }
  }, [open])

  if (!open) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError("Task title is required.")
      return
    }

    if (!projectId) {
      setError("Parent Project ID is missing.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const payload = {
        project_id: projectId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status_id: formData.status_id || null,
        priority_id: formData.priority_id || null,
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      }

      // API Call: POST http://localhost:8000/tasks
      const res = await api.post("/tasks", payload)
      const createdTask = res.data.task || res.data

      onCreateTask(createdTask)

      // Reset Form State
      setFormData({
        title: "",
        description: "",
        status_id: lovs.statuses[0]?.id || "",
        priority_id: lovs.priorities[0]?.id || "",
        dueDate: "",
      })
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-lg border border-border/80 bg-card shadow-2xl rounded-2xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-lg font-bold">Create New Task</CardTitle>
        </CardHeader>

        <CardContent className="pt-4">
          {error && (
            <div className="mb-3 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Task Title */}
            <div className="space-y-1.5">
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input
                id="taskTitle"
                name="title"
                placeholder="e.g. Implement API Endpoint Security"
                disabled={isLoading}
                value={formData.title}
                onChange={handleChange}
                className={error && !formData.title.trim() ? "border-destructive focus-visible:ring-destructive" : ""}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="taskDesc">Description</Label>
              <textarea
                id="taskDesc"
                name="description"
                rows={2}
                placeholder="Details about task objectives..."
                disabled={isLoading}
                value={formData.description}
                onChange={handleChange}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground resize-none"
              />
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="priority_id">Priority</Label>
                <select
                  id="priority_id"
                  name="priority_id"
                  disabled={isLoading}
                  value={formData.priority_id}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                >
                  {lovs.priorities.length > 0 ? (
                    lovs.priorities.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="">Default Priority</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status_id">Status</Label>
                <select
                  id="status_id"
                  name="status_id"
                  disabled={isLoading}
                  value={formData.status_id}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                >
                  {lovs.statuses.length > 0 ? (
                    lovs.statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="">Default Status</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                disabled={isLoading}
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-border/40">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isLoading} className="w-1/2">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isLoading} className="w-1/2 font-semibold shadow-xs">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> Create Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateTaskModal
