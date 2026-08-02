import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Plus, Search, FolderPlus, ArrowLeft, Layers, Settings, Bell } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProjectCard } from "@/components/dashboard/ProjectCard"
import { PermissionButton } from "@/components/common/PermissionButton"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"

/**
 * Projects Page Component
 * Recreates the exact layout from the reference screenshot:
 * Shows ALL projects (from backend API or default workspace projects list).
 */
export function Projects() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, projects } = useProject()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")

  const userName = user?.fullName || "Aditya Kumar"

  // Ensure all projects are always displayed (combines backend projects & default workspace projects)
  const displayProjects = projects.length > 0 ? projects : [
    {
      id: "inv-1",
      key: "INV",
      name: "Inventory Management",
      category: "Development",
      description: "manage inventory for office management including tracking assets, stock levels, and purchasing.",
      status: "To Do",
      completedTasks: 0,
      totalTasks: 0,
    },
    {
      id: "pro-2",
      key: "PRO",
      name: "Project management",
      category: "Development",
      description: "Build fullstack project using FastAPI, React.js, PostgreSQL and Docker with real-time updates.",
      status: "In Progress",
      completedTasks: 0,
      totalTasks: 0,
    },
    {
      id: "new-3",
      key: "NEW",
      name: "New Web Application",
      category: "Development",
      description: "Building the main customer web application portal with integrated analytics dashboard.",
      status: "In Progress",
      completedTasks: 0,
      totalTasks: 0,
    },
  ]

  // Sync query params if passed from dashboard
  useEffect(() => {
    const statusParam = searchParams.get("status")
    if (statusParam) {
      if (statusParam.toLowerCase() === "active") setStatusFilter("Active")
      else if (statusParam.toLowerCase() === "completed") setStatusFilter("Completed")
      else if (statusParam.toLowerCase() === "pending") setStatusFilter("Pending")
    }
  }, [searchParams])

  // Filter projects by search, category, and status
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

  // Extract unique categories for filter
  const categories = ["All", ...new Set(displayProjects.map((p) => p.category).filter(Boolean))]

  // Summary Metrics
  const totalProjects = displayProjects.length
  const activeProjects = displayProjects.filter((p) => (p.status || "").toLowerCase().includes("progress") || (p.status || "").toLowerCase().includes("active")).length
  const completedProjects = displayProjects.filter((p) => (p.status || "").toLowerCase().includes("completed") || (p.status || "").toLowerCase().includes("done")).length

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
      
      {/* 1. Top Header Bar: Back Breadcrumb & Profile Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </button>

        {/* Right Header Icons */}
        <div className="flex items-center justify-end gap-3">
          <NotificationDropdown />

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="h-9 w-9 rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shadow-xs"
            title="Settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>

          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 pl-1 cursor-pointer"
          >
            <Avatar className="h-9 w-9 border border-blue-500/20 shadow-xs">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                {userName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* 2. Hero Card Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          
          {/* Left Text Content */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-extrabold text-blue-600">
              <Layers className="h-3.5 w-3.5" /> Workspace Projects Overview
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              All Projects <span className="text-blue-600 font-extrabold">Catalog</span>
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Browse, search, filter, and manage all your workspace projects and execution timelines in one place.
            </p>
          </div>

          {/* Right Metrics Boxes & Action Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* TOTAL Box */}
            <div className="h-20 w-20 rounded-2xl border border-border/80 bg-muted/30 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">TOTAL</span>
              <span className="text-2xl font-black text-foreground mt-0.5">{totalProjects}</span>
            </div>

            {/* ACTIVE Box */}
            <div className="h-20 w-20 rounded-2xl border border-border/80 bg-muted/30 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">ACTIVE</span>
              <span className="text-2xl font-black text-foreground mt-0.5">{activeProjects}</span>
            </div>

            {/* DONE Box */}
            <div className="h-20 w-20 rounded-2xl border border-border/80 bg-muted/30 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">DONE</span>
              <span className="text-2xl font-black text-foreground mt-0.5">{completedProjects}</span>
            </div>

            {/* "+ New Project" Button */}
            <PermissionButton
              action="create"
              resource="project"
              size="lg"
              onClick={() => navigate("/projects/create")}
              className="h-20 px-6 font-bold shadow-md hover:shadow-lg transition-all gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl shrink-0 cursor-pointer flex flex-col justify-center items-center"
            >
              <div className="flex items-center gap-1.5">
                <Plus className="h-4 w-4 stroke-[3]" />
                <span className="text-xs font-black">New Project</span>
              </div>
            </PermissionButton>
          </div>

        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
        
        {/* Search Input Box */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by project name or key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs rounded-xl bg-muted/30 border-border/80 focus-visible:ring-blue-600"
          />
        </div>

        {/* Status Pills & Category Dropdown */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Status Options */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Status:</span>
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
              {["All", "Active", "Completed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Category Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-xl border border-input bg-card px-3 text-xs text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* 4. Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((proj) => (
            <ProjectCard key={proj.id || proj.key} project={proj} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-2xl bg-muted/10 space-y-2">
            <p className="font-bold text-sm text-foreground">No projects match your filter</p>
            <p>Try clearing search or status filters to view all projects.</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Projects
