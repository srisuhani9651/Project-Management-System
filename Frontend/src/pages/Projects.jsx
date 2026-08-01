import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Plus, Search, FolderPlus, ArrowLeft } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "@/components/dashboard/ProjectCard"
import { PermissionButton } from "@/components/common/PermissionButton"
import { EmptyState } from "@/components/common/EmptyState"

export function Projects() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { projects } = useProject()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")

  useEffect(() => {
    const statusParam = searchParams.get("status")
    if (statusParam) {
      if (statusParam.toLowerCase() === "active") setStatusFilter("Active")
      else if (statusParam.toLowerCase() === "completed") setStatusFilter("Completed")
      else if (statusParam.toLowerCase() === "pending") setStatusFilter("Pending")
    }
  }, [searchParams])

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === "All" || (p.category || "").toLowerCase() === categoryFilter.toLowerCase()

    let matchesStatus = true
    if (statusFilter === "Active") matchesStatus = (p.status || "Active").toLowerCase() === "active"
    if (statusFilter === "Completed") matchesStatus = (p.status || "").toLowerCase() === "completed"
    if (statusFilter === "Pending") matchesStatus = (p.status || "").toLowerCase() === "pending" || p.pendingTasks > 0

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Extract unique categories
  const categories = ["All", ...new Set(projects.map((p) => p.category).filter(Boolean))]

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="space-y-4 border-b border-border/60 pb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              All Projects
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Browse, search, and manage all projects across your organization.
            </p>
          </div>

          {/* Action Button */}
          <PermissionButton
            action="create"
            resource="project"
            size="sm"
            onClick={() => navigate("/projects/create")}
            className="h-9 px-4 font-semibold shadow-xs hover:shadow-md transition-all gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>New Project</span>
          </PermissionButton>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="All">Status: All</option>
            <option value="Active">Status: Active</option>
            <option value="Completed">Status: Completed</option>
            <option value="Pending">Status: Pending Tasks</option>
          </select>

          {/* Category Filter Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-muted-foreground self-center">
          Total Projects: {projects.length}
        </span>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            <>
              {filteredProjects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} />
              ))}

              {/* Add Project Card Tile */}
              <button
                type="button"
                onClick={() => navigate("/projects/create")}
                className="border border-dashed border-border/80 hover:border-primary/60 bg-card/40 hover:bg-primary/5 rounded-xl p-6 flex flex-col items-center justify-center space-y-2 text-center transition-all group min-h-[190px]"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Plus className="h-5 w-5 stroke-[2.5]" />
                </div>
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Create New Project
                </p>
                <p className="text-xs text-muted-foreground">Add a new workspace to organize tasks</p>
              </button>
            </>
          ) : (
            <div className="col-span-full py-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No projects match your search or filter criteria.
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          icon={FolderPlus}
          heading="No Projects Found"
          description="You haven't created any projects yet. Create your first project to start managing your work."
          actionComponent={
            <PermissionButton
              action="create"
              resource="project"
              size="lg"
              onClick={() => navigate("/projects/create")}
              className="gap-2 font-semibold shadow-md px-7"
            >
              <Plus className="h-5 w-5" /> Create New Project
            </PermissionButton>
          }
        />
      )}

    </div>
  )
}

export default Projects
