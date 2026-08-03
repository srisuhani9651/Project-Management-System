import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Search, FolderPlus, Plus } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "@/components/dashboard/ProjectCard"
import { CustomSelect } from "@/components/ui/custom-select"
import { Button } from "@/components/ui/button"

/**
 * Modern Projects Catalog Page Component
 * Displays live database projects belonging to the current user.
 * Displays clean empty state if no projects are assigned to the user.
 */
export function Projects() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { projects, fetchProjects } = useProject()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")

  useEffect(() => {
    if (fetchProjects) {
      fetchProjects()
    }
  }, [])

  useEffect(() => {
    const statusParam = searchParams.get("status")
    if (statusParam) {
      if (statusParam.toLowerCase() === "active") setStatusFilter("Active")
      else if (statusParam.toLowerCase() === "completed") setStatusFilter("Completed")
      else if (statusParam.toLowerCase() === "pending") setStatusFilter("Pending")
    }
  }, [searchParams])

  const displayProjects = projects || []

  const filteredProjects = displayProjects.filter((p) => {
    const pName = p.name || p.project_name || ""
    const pKey = p.key || ""
    const pCat = p.category || p.category_name || ""

    const matchesSearch =
      pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pCat.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === "All" || pCat.toLowerCase() === categoryFilter.toLowerCase()

    let matchesStatus = true
    const st = (p.status || "").toLowerCase()
    if (statusFilter === "Active") matchesStatus = st === "active" || st.includes("progress") || st === "to do"
    if (statusFilter === "Completed") matchesStatus = st.includes("completed") || st.includes("done")

    return matchesSearch && matchesCategory && matchesStatus
  })

  const rawCategories = ["All", ...new Set(displayProjects.map((p) => p.category || p.category_name).filter(Boolean))]
  const categoryOptions = rawCategories.map((c) => ({ id: c, name: c }))

  const totalProjects = displayProjects.length
  const activeProjects = displayProjects.filter((p) => (p.status || "").toLowerCase().includes("progress") || (p.status || "").toLowerCase().includes("active") || (p.status || "").toLowerCase().includes("to do")).length
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

      {/* If User Has No Projects at all */}
      {displayProjects.length === 0 ? (
        <div className="p-12 border border-dashed border-border/80 bg-card/60 backdrop-blur-md rounded-2xl text-center space-y-4 my-8 max-w-2xl mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center mx-auto">
            <FolderPlus className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-poppins text-lg font-bold text-foreground">No projects assigned to you.</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              You don't have any active projects assigned yet. Create a new project or ask your project manager to add you as a member.
            </p>
          </div>
          <Button
            onClick={() => navigate("/projects/create")}
            className="gap-2 font-bold text-xs rounded-xl shadow-xs"
          >
            <Plus className="h-4 w-4" /> Create New Project
          </Button>
        </div>
      ) : (
        <>
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
                <ProjectCard key={proj.id || proj.project_id || proj.key} project={proj} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-2xl bg-muted/10 space-y-2">
                <p className="font-poppins font-semibold text-sm text-foreground">No projects match your search</p>
                <p className="font-roboto">Try clearing search query or adjusting status filters.</p>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  )
}

export default Projects
