import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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
  User
} from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { ProjectCard } from "@/components/dashboard/ProjectCard"
import { TaskCard } from "@/components/dashboard/TaskCard"
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

  // Mock recent tasks associated with user projects
  const mockTasks = [
    {
      id: "t-1",
      name: "Setup Authentication Middleware & JWT",
      projectKey: projects[0]?.key || "PFW",
      status: "In Progress",
      priority: "High",
      dueDate: "Tomorrow",
    },
    {
      id: "t-2",
      name: "Design System UI Components & Tokens",
      projectKey: projects[0]?.key || "PFW",
      status: "Completed",
      priority: "Medium",
      dueDate: "Aug 4, 2026",
    },
    {
      id: "t-3",
      name: "Database Schema Migration & Indexes",
      projectKey: projects[1]?.key || "MAR",
      status: "Todo",
      priority: "High",
      dueDate: "Aug 6, 2026",
    },
    {
      id: "t-4",
      name: "Mobile Responsive Layout Polish",
      projectKey: projects[1]?.key || "MAR",
      status: "In Progress",
      priority: "Medium",
      dueDate: "Aug 8, 2026",
    },
  ]

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
            Here's what is happening with your projects and tasks today.
          </p>
        </div>

        {/* Right Header Controls: Search, Notification, Profile Avatar */}
        <div className="flex items-center gap-3">
          
          {/* Search Bar */}
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

          {/* Notifications Button */}
          <button
            type="button"
            className="relative p-2 rounded-lg border border-border/80 bg-card hover:bg-accent text-foreground transition-colors"
            title="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none"
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

      {/* 5 Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          icon={Building2}
          title="Total Projects"
          count={totalProjects}
          trend={totalProjects > 0 ? "+1 this month" : undefined}
          iconColor="bg-primary/10 text-primary"
        />
        <StatsCard
          icon={Activity}
          title="Active Projects"
          count={activeProjects}
          trend={activeProjects > 0 ? "Active in sprint" : undefined}
          iconColor="bg-blue-500/10 text-blue-600"
        />
        <StatsCard
          icon={ListTodo}
          title="Total Tasks"
          count={totalTasks}
          trend={totalTasks > 0 ? "Across all boards" : undefined}
          iconColor="bg-indigo-500/10 text-indigo-600"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Completed Tasks"
          count={completedTasks}
          trend={completedTasks > 0 ? `${Math.round((completedTasks / (totalTasks || 1)) * 100)}% completion` : undefined}
          iconColor="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          icon={Clock}
          title="Pending Tasks"
          count={pendingTasks}
          trend={pendingTasks > 0 ? "Requires action" : undefined}
          iconColor="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* Main Content Area */}
      {totalProjects > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Section: Recent Projects (~70% desktop width) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Projects</h2>
                <p className="text-xs text-muted-foreground">Latest workspace projects you are managing</p>
              </div>
              <PermissionButton
                action="create"
                resource="project"
                size="sm"
                onClick={() => navigate("/projects/create")}
                className="gap-1.5 text-xs font-semibold shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" /> New Project
              </PermissionButton>
            </div>

            <div className={`grid gap-4 ${filteredProjects.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((proj) => (
                  <ProjectCard key={proj.id} project={proj} />
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                  No projects match your search criteria.
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Recent Tasks (~30% desktop width) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Tasks</h2>
                <p className="text-xs text-muted-foreground">High priority & active issue tickets</p>
              </div>
              <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">View All</span>
            </div>

            <div className="space-y-3">
              {mockTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
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
