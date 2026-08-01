import React, { useState, useEffect } from "react"
import { Edit3, X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function EditTaskModal({ open, onOpenChange, task, onSaveTask }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    dueDate: "",
    assignee: "",
  })

  const [error, setError] = useState("")

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        status: task.status || "To Do",
        dueDate: task.dueDate || "Aug 15, 2026",
        assignee: task.assignee || task.assignedTo || "Suhani Srivastava",
      })
    }
  }, [task])

  if (!open || !task) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError("Task title is required.")
      return
    }

    onSaveTask({
      ...task,
      name: formData.name.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      assignee: formData.assignee,
    })

    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-lg border border-border/80 bg-card shadow-2xl rounded-2xl relative animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" /> Edit Task — {task.key || task.id}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Task Title */}
            <div className="space-y-1.5">
              <Label htmlFor="editTaskName">Task Title *</Label>
              <Input
                id="editTaskName"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {error && <p className="text-destructive text-[11px]">{error}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="editTaskDesc">Description</Label>
              <textarea
                id="editTaskDesc"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground resize-none"
              />
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="editPriority">Priority</Label>
                <select
                  id="editPriority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editStatus">Status</Label>
                <select
                  id="editStatus"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            {/* Assignee & Due Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="editAssignee">Assignee</Label>
                <Input
                  id="editAssignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editDueDate">Due Date</Label>
                <Input
                  id="editDueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="w-1/2"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="w-1/2 font-semibold shadow-xs gap-1.5">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditTaskModal
