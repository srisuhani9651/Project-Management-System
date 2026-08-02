import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Folder,
  Play,
  FileCheck,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Bell,
  Calendar,
  History,
  User,
  ArrowRight,
  Clock,
  AlertCircle
} from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { PermissionButton } from "@/components/common/PermissionButton"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"

/**
 * Dashboard Page Component
 * Recreates the exact layout from the user's Enterprise Pro reference screenshot:
 * 1. Top Bar with search, settings gear, notification bell, and user avatar profile.
 * 2. Dynamic time greeting ("Good Evening, Aditya Kumar 👋") and "+ New Project" button.
 * 3. 5 Metric Cards row (Total Projects, Active Projects, Total Tasks, Completed Tasks, Pending Tasks).
 * 4. Recent Projects grid with project key badges, category chips, progress bar, and "View Project ->".
 * 5. Bottom 2-Column layout: Recent Activity timeline feed and Upcoming Tasks empty state.
 */
export function Dashboard() {
  const navigate = useNavigate()
  const { user, projects, logoutUser } = useProject()
  const [searchQuery, setSearchQuery] = useState("")

  // Dynamic Greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const userName = user?.fullName || "Aditya Kumar"
  const userRole = user?.role || "Workspace Admin"

  // Aggregate metrics across projects
  const totalProjectsCount = projects.length || 3
  const activeProjectsCount = projects.filter((p) => (p.status || "Active").toLowerCase() === "active").length
  const totalTasksCount = projects.reduce((acc, p) => acc + (p.totalTasks || 0), 0)
  const completedTasksCount = projects.reduce((acc, p) => acc + (p.completedTasks || 0), 0)
  const pendingTasksCount = projects.reduce((acc, p) => acc + (p.pendingTasks || 0), 0)

  // Default fallback projects matching screenshot if projects list is empty
  const displayProjects = projects.length > 0 ? projects.slice(0, 3) : [
    {
      id: "inv-1",
      key: "INV",
      name: "Inventory Management",
      category: "DEVELOPMENT",
      description: "Building a robust tracking system for warehouse stock levels and automated purchase ordering.",
      status: "To Do",
      completedTasks: 0,
      totalTasks: 0,
      badgeColor: "bg-blue-600 text-white",
    },
    {
      id: "pro-2",
      key: "PRO",
      name: "Project management",
      category: "DEVELOPMENT",
      description: "Internal workspace for cross-departmental coordination and real-time sprint tracking.",
      status: "In Progress",
      completedTasks: 0,
      totalTasks: 0,
      badgeColor: "bg-emerald-700 text-white",
    },
    {
      id: "new-3",
      key: "NEW",
      name: "New Web Application",
      category: "DEVELOPMENT",
      description: "A next-generation client portal featuring interactive dashboards and end-to-end management.",
      status: "To Do",
      completedTasks: 0,
      totalTasks: 0,
      badgeColor: "bg-indigo-500 text-white",
    },
  ]

  // Filter display projects by search query
  const filteredProjects = displayProjects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.key.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 pb-12 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
      
      {/* 1. Top Search Bar & Header Profile Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        
        {/* Wide Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search projects, tasks, or files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs rounded-xl bg-muted/40 border-border/80 focus-visible:ring-blue-600"
          />
        </div>

        {/* Header Right Actions: Bell, Settings, User Profile */}
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

          {/* User Profile Info */}
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2.5 pl-2 cursor-pointer group"
          >
            <Avatar className="h-9 w-9 border border-blue-500/20 shadow-xs">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                {userName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-foreground leading-tight group-hover:text-blue-600 transition-colors">
                {userName}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Greeting & Top CTA Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            {getGreeting()}, {userName} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Here's what is happening with your workspace today.
          </p>
        </div>

        {/* Primary "+ New Project" Action Button */}
        <PermissionButton
          action="create"
          resource="project"
          size="lg"
          onClick={() => navigate("/projects/create")}
          className="h-10 px-5 font-bold shadow-md hover:shadow-lg transition-all gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl shrink-0 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 stroke-[3]" />
          <span>New Project</span>
        </PermissionButton>
      </div>

      {/* 3. 5 Key Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Projects */}
        <Card className="border border-border/80 bg-card rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-muted-foreground">Total Projects</span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Folder className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-2xl font-black text-foreground">{totalProjectsCount}</p>
            <p className="text-[11px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md inline-block">
              +1 this month
            </p>
          </div>
        </Card>

        {/* Card 2: Active Projects */}
        <Card className="border border-border/80 bg-card rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-muted-foreground">Active Projects</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <Play className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-foreground">{activeProjectsCount}</p>
          </div>
        </Card>

        {/* Card 3: Total Tasks */}
        <Card className="border border-border/80 bg-card rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-muted-foreground">Total Tasks</span>
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
              <FileCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-foreground">{totalTasksCount}</p>
          </div>
        </Card>

        {/* Card 4: Completed Tasks */}
        <Card className="border border-border/80 bg-card rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-muted-foreground">Completed Tasks</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-foreground">{completedTasksCount}</p>
          </div>
        </Card>

        {/* Card 5: Pending Tasks */}
        <Card className="border border-border/80 bg-card rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-muted-foreground">Pending Tasks</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-foreground">{pendingTasksCount}</p>
          </div>
        </Card>

      </div>

      {/* 4. Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-foreground">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All Projects
          </Link>
        </div>

        {/* 3 Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const completionPct =
              project.totalTasks > 0
                ? Math.round((project.completedTasks / project.totalTasks) * 100)
                : 0

            return (
              <Card
                key={project.id || project.key}
                className="border border-border/80 bg-card hover:shadow-lg hover:border-blue-500/40 transition-all rounded-2xl p-5 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Badge Key & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${project.badgeColor || "bg-blue-600 text-white"}`}>
                      {project.key}
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        (project.status || "").toLowerCase().includes("progress")
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {project.status || "To Do"}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    <span className="inline-block bg-muted px-2.5 py-0.5 rounded-md text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {project.category || "DEVELOPMENT"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                      <span>Progress</span>
                      <span>{completionPct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        style={{ width: `${completionPct}%` }}
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-4 border-t border-border/50 text-center mt-4">
                  <Link
                    to={`/projects/${project.id || project.key}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View Project <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 5. Bottom 2-Column Grid: Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (7 cols): Recent Activity */}
        <Card className="lg:col-span-7 border border-border/80 bg-card rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-black text-foreground">Recent Activity</h3>
              <button type="button" className="text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Timeline Items */}
            <div className="space-y-4 pt-4">
              
              {/* Log 1 */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <History className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <p className="text-foreground">
                    <span className="font-bold">System</span> updated the status of{" "}
                    <span className="font-bold">Inventory Management</span> to{" "}
                    <span className="font-bold text-blue-600">To Do</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">2 hours ago</p>
                </div>
              </div>

              {/* Log 2 */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <p className="text-foreground">
                    <span className="font-bold">{userName}</span> created a new project:{" "}
                    <span className="font-bold text-blue-600">New Web Application</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">5 hours ago</p>
                </div>
              </div>

            </div>
          </div>
        </Card>

        {/* Right Column (5 cols): Upcoming Tasks Empty State */}
        <Card className="lg:col-span-5 border border-border/80 bg-card rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground shadow-inner">
            <Calendar className="h-7 w-7 stroke-[1.5]" />
          </div>

          <div className="space-y-1 max-w-xs">
            <h3 className="text-base font-black text-foreground">No Upcoming Tasks</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your schedule looks clear for today. Take a break or start a new project!
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="px-4 py-2 rounded-xl bg-muted/70 hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
          >
            View Calendar
          </button>
        </Card>

      </div>

    </div>
  )
}

export default Dashboard
