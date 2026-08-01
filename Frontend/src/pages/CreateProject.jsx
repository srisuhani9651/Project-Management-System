import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { FolderPlus, ArrowLeft, AlertCircle } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CreateProject() {
  const navigate = useNavigate()
  const { addProject } = useProject()

  const [formData, setFormData] = useState({
    name: "",
    key: "",
    category: "Software Development",
    description: "",
  })

  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      // Auto-generate key if user changes project name
      if (name === "name" && !prev.keyTouched) {
        updated.key = value.trim().substring(0, 3).toUpperCase()
      }
      return updated
    })
    if (error) setError("")
  }

  const handleKeyChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      key: e.target.value.toUpperCase().slice(0, 4),
      keyTouched: true,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError("Project name is required.")
      return
    }

    addProject({
      name: formData.name.trim(),
      key: formData.key || formData.name.trim().substring(0, 3).toUpperCase(),
      category: formData.category,
      description: formData.description.trim(),
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
    })

    navigate("/dashboard")
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Navigation back button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Card Form */}
        <Card className="border border-border/80 bg-card shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 text-center pb-4 border-b border-border/40">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <FolderPlus className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Create New Project</CardTitle>
            <CardDescription>
              Set up a new workspace project to organize issues and tasks.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. NextGen Web Portal"
                  value={formData.name}
                  onChange={handleChange}
                  className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {error && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {error}
                  </p>
                )}
              </div>

              {/* Project Key */}
              <div className="space-y-2">
                <Label htmlFor="key">Project Key (Short Identifier)</Label>
                <Input
                  id="key"
                  name="key"
                  type="text"
                  placeholder="e.g. NWP"
                  value={formData.key}
                  onChange={handleKeyChange}
                  maxLength={4}
                />
                <p className="text-[11px] text-muted-foreground">
                  Used as prefix for issue codes (e.g. NWP-101)
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                >
                  <option value="Software Development">Software Development</option>
                  <option value="Design System">Design System</option>
                  <option value="Marketing & Growth">Marketing & Growth</option>
                  <option value="Business Operations">Business Operations</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Brief summary of project goals and scope..."
                  value={formData.description}
                  onChange={handleChange}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Link to="/dashboard" className="w-1/2">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="w-1/2 font-semibold shadow-md">
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateProject
