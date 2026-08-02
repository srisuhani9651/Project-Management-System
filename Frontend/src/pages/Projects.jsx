import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Search } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "@/components/dashboard/ProjectCard"
import { CustomSelect } from "@/components/ui/custom-select"

/**
 * Modern Projects Catalog Page Component
 * Matches Dashboard typography (Roboto primary, Poppins secondary with clean font weights).
 * Removes duplicate top navigation controls and extra page buttons.
 */
export function Projects() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { projects } = useProject()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")

  const displayProjects = projects.length > 0 ? projects : [
    {
      id: "inv-1",
      key: "INV",
      name: "Inventory Management",
      category: "Development",
      description: "manage inventory for office management including tracking assets, stock levels, and purchasing.",
      status: "To Do",
      completedTasks: 4,
      totalTasks: 12,
    },
    {
      id: "pro-2",
      key: "PRO",
      name: "Project management",
      category: "Development",
      description: "Build fullstack project using FastAPI, React.js, PostgreSQL and Docker with real-time updates.",
      status: "In Progress",
      completedTasks: 14,
      totalTasks: 18,
    },
    {
      id: "new-3",
      key: "NEW",
      name: "New Web Application",
      category: "Development",
      description: "Building the main customer web application portal with integrated analytics dashboard.",
      status: "In Progress",
      completedTasks: 3,
      totalTasks: 8,
    },
  ]

  useEffect(() => {
    const statusParam = searchParams.get("status")
    if (statusParam) {
      if (statusParam.toLowerCase() === "active") setStatusFilter("Active")
      else if (statusParam.toLowerCase() === "completed") setStatusFilter("Completed")
      else if (statusParam.toLowerCase() === "pending") setStatusFilter("Pending")
    }
  }, [searchParams])

  const filteredProjects = displayProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === "All" || (p.category || "").toLowerCase() === categoryFilter.toLowerCase()

    let matchesStatus = true
    if (statusFilter === "Active") matchesStatus = (p.status || "Active").toLowerCase() === "active" || (p.status || "").toLowerCase() === "in progress"
    if (statusFilter === "Completed") matchesStatus = (p.status || "").toLowerCase() === "completed" || (p.status || "").toLowerCase() === "done"

    return matchesSearch && matchesCategory && matchesStatus
  })

  const rawCategories = ["All", ...new Set(displayProjects.map((p) => p.category).filter(Boolean))]
  const categoryOptions = rawCategories.map((c) => ({ id: c, name: c }))

  const totalProjects = displayProjects.length
  const activeProjects = displayProjects.filter((p) => (p.status || "").toLowerCase().includes("progress") || (p.status || "").toLowerCase().includes("active")).length
  const completedProjects = displayProjects.filter((p) => (p.status || "").toLowerCase().includes("completed") || (p.status || "").toLowerCase().includes("done")).length

  return (
    <div className="flex-1 pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in font-roboto">
      
      {/* 1. Header Greeting & Workspace Summary Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-1">
          <h1 className="font-poppins text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Projects Workspace
          </h1>
          <p className="font-roboto text-xs sm:text-sm text-muted-foreground">
            Browse, filter, and monitor execution progress across all active projects.
          </p>
        </div>

        {/* Metric Summary Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl border border-border/70 bg-card shadow-xs flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Total:</span>
            <span className="font-poppins font-semibold text-foreground">{totalProjects}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-border/70 bg-card shadow-xs flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Active:</span>
            <span className="font-poppins font-semibold text-blue-600">{activeProjects}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-border/70 bg-card shadow-xs flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Completed:</span>
            <span className="font-poppins font-semibold text-emerald-600">{completedProjects}</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by project name or key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs rounded-xl bg-muted/20 border-border/70 focus-visible:ring-blue-600"
          />
        </div>

        {/* Status Pills & Category Dropdown */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Status Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/60">
              {["All", "Active", "Completed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Category Select */}
          <div className="flex items-center gap-2 min-w-[160px]">
            <span className="text-xs font-medium text-muted-foreground shrink-0">Category:</span>
            <CustomSelect
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="Category"
            />
          </div>
        </div>

      </div>

      {/* 3. Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((proj) => (
            <ProjectCard key={proj.id || proj.key} project={proj} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-2xl bg-muted/10 space-y-2">
            <p className="font-poppins font-semibold text-sm text-foreground">No projects match your filter</p>
            <p className="font-roboto">Try clearing search or status filters to view all workspace projects.</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Projects
