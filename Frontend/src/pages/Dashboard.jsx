import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  FolderPlus,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  Building2,
  Activity,
  Search,
  Bell,
  LogOut,
  User,
  ArrowRight
} from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { ProjectCard } from "@/components/dashboard/ProjectCard"
import { PermissionButton } from "@/components/common/PermissionButton"
import { EmptyState } from "@/components/common/EmptyState"

export function Dashboard() {
  const navigate = useNavigate()
  const { user, projects, logoutUser } = useProject()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const userName = user?.fullName || "Suhani"
  const greetingText = `${getGreeting()}, ${userName} 👋`

  // Calculate statistics across projects
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => (p.status || "Active").toLowerCase() === "active").length
  const totalTasks = projects.reduce((acc, p) => acc + (p.totalTasks || 0), 0)
  const completedTasks = projects.reduce((acc, p) => acc + (p.completedTasks || 0), 0)
  const pendingTasks = projects.reduce((acc, p) => acc + (p.pendingTasks || 0), 0)

  // Filter projects by search query
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Limit recent projects to top 3 for the dashboard
  const recentProjects = filteredProjects.slice(0, 3)

  const handleLogout = () => {
    logoutUser()
    navigate("/")
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
        
        {/* Dynamic Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {greetingText}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Here's what is happening with your workspace and projects today.
          </p>
        </div>

        {/* Right Header Controls: Search, New Project CTA, Notification, Profile Avatar */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Primary Modern New Project Button */}
          <PermissionButton
            action="create"
            resource="project"
            size="sm"
            onClick={() => navigate("/projects/create")}
            className="h-9 px-4 font-semibold shadow-xs hover:shadow-md transition-all gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>New Project</span>
          </PermissionButton>

          {/* Notifications Button */}
          <button
            type="button"
            className="relative p-2 rounded-lg border border-border/80 bg-card hover:bg-accent text-foreground transition-colors h-9 w-9 flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none"
            >
              <Avatar className="h-9 w-9 border border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/80 bg-card shadow-xl z-50 p-2 text-xs space-y-1 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-border/40">
                  <p className="font-bold text-foreground">{userName}</p>
                  <p className="text-muted-foreground truncate">{user?.email || "user@projectflow.com"}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false)
                    navigate("/dashboard")
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-foreground transition-colors"
                >
                  <User className="h-4 w-4 text-muted-foreground" /> Profile & Account
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 5 Interactive Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          icon={Building2}
          title="Total Projects"
          count={totalProjects}
          trend={totalProjects > 0 ? "+1 this month" : undefined}
          iconColor="bg-primary/10 text-primary"
          onClick={() => navigate("/projects")}
        />
        <StatsCard
          icon={Activity}
          title="Active Projects"
          count={activeProjects}
          trend={activeProjects > 0 ? "Active in sprint" : undefined}
          iconColor="bg-blue-500/10 text-blue-600"
          onClick={() => navigate("/projects?status=active")}
        />
        <StatsCard
          icon={ListTodo}
          title="Total Tasks"
          count={totalTasks}
          trend={totalTasks > 0 ? "Across all projects" : undefined}
          iconColor="bg-indigo-500/10 text-indigo-600"
          onClick={() => navigate("/projects")}
        />
        <StatsCard
          icon={CheckCircle2}
          title="Completed Tasks"
          count={completedTasks}
          trend={completedTasks > 0 ? `${Math.round((completedTasks / (totalTasks || 1)) * 100)}% completion` : undefined}
          iconColor="bg-emerald-500/10 text-emerald-600"
          onClick={() => navigate("/projects?status=completed")}
        />
        <StatsCard
          icon={Clock}
          title="Pending Tasks"
          count={pendingTasks}
          trend={pendingTasks > 0 ? "Requires action" : undefined}
          iconColor="bg-amber-500/10 text-amber-600"
          onClick={() => navigate("/projects?status=pending")}
        />
      </div>

      {/* Main Content Area: Recent Projects */}
      {totalProjects > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Projects</h2>
              <p className="text-xs text-muted-foreground">Recently active workspace projects</p>
            </div>

            {/* View All Projects Link */}
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline group"
            >
              View All Projects ({totalProjects}) <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Recent Projects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.length > 0 ? (
              <>
                {recentProjects.map((proj) => (
                  <ProjectCard key={proj.id} project={proj} />
                ))}

                {/* Modern Add New Project Card Tile */}
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
                No projects match your search criteria.
              </div>
            )}
          </div>
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

export default Dashboard
