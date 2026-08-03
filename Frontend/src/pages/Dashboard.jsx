import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import { FolderPlus, Plus, Loader2 } from "lucide-react"

// Modern Dashboard Subcomponents
import { ProjectTaskPieChart } from "@/components/dashboard/ProjectTaskPieChart"
import { PendingTasksList } from "@/components/dashboard/PendingTasksList"
import { TimebasedAnalytics } from "@/components/dashboard/TimebasedAnalytics"
import { RecentTasksList } from "@/components/dashboard/RecentTasksList"
import { Button } from "@/components/ui/button"

/**
 * Modern Dynamic Dashboard Page Component
 * Connects to single backend API /api/dashboard for real database metrics.
 * Displays 0 counts and clean empty state if no projects or tasks are assigned.
 */
export function Dashboard() {
  const { user, fetchProjects } = useProject()
  const navigate = useNavigate()
  const [telemetry, setTelemetry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)

  // Dynamic Greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const userName = user?.fullName || user?.full_name || "Workspace Member"

  // Fetch full dashboard telemetry from single API endpoint
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/dashboard")
      const data = res.data
      setTelemetry(data)
      // Empty state: no tasks and no projects for this user
      const noTasks = (data?.pendingTasks?.counts?.all ?? 0) === 0 && (data?.recentTasks?.tasks?.length ?? 0) === 0
      const noProjects = (data?.taskDistribution?.totalProjects ?? 0) === 0
      setIsEmpty(noTasks && noProjects)
    } catch (err) {
      console.warn("Could not fetch /api/dashboard, trying fallback /dashboard:", err)
      try {
        const fallbackRes = await api.get("/dashboard")
        const data = fallbackRes.data
        setTelemetry(data)
        const noTasks = (data?.pendingTasks?.counts?.all ?? 0) === 0 && (data?.recentTasks?.tasks?.length ?? 0) === 0
        const noProjects = (data?.taskDistribution?.totalProjects ?? 0) === 0
        setIsEmpty(noTasks && noProjects)
      } catch (fallbackErr) {
        console.error("Dashboard API error:", fallbackErr)
        setIsEmpty(true)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  // Handle task status toggle with backend database persistence
  const handleToggleTaskStatus = async (taskToToggle) => {
    const tId = taskToToggle.id || taskToToggle.task_id
    if (!tId) return

    const currentStatus = (taskToToggle.status || "").toLowerCase()
    const isDone = currentStatus === "done" || currentStatus === "completed"

    // Optimistic UI update
    if (telemetry?.pendingTasks?.tasks) {
      setTelemetry((prev) => ({
        ...prev,
        pendingTasks: {
          ...prev.pendingTasks,
          tasks: prev.pendingTasks.tasks.filter((t) => (t.id || t.task_id) !== tId),
        },
      }))
    }

    try {
      let statusId = null
      const lovRes = await api.get("/projects/lov").catch(() => null)
      if (lovRes?.data?.statuses) {
        const statuses = lovRes.data.statuses
        const matched = statuses.find((s) => {
          const sName = (s.name || "").toLowerCase().trim()
          if (isDone) {
            return sName === "to do" || sName === "todo"
          } else {
            return sName === "completed" || sName === "done"
          }
        })
        if (matched) {
          statusId = matched.id
        }
      }

      const updatePayload = {
        completed_at: isDone ? null : new Date().toISOString(),
      }
      if (statusId) {
        updatePayload.status_id = statusId
      }

      await api.post(`/tasks/${tId}`, updatePayload).catch(() => {
        return api.post(`/api/manage/task/${tId}`, updatePayload)
      })

      await fetchDashboardData()
      if (fetchProjects) fetchProjects()
    } catch (err) {
      console.error("Failed to update task status on backend:", err)
      fetchDashboardData()
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-roboto">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Loading workspace telemetry...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in font-roboto">

      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-1">
          <h1 className="font-poppins text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {getGreeting()}, {userName} <span className="text-xl">👋</span>
          </h1>
          <p className="font-roboto text-xs sm:text-sm text-muted-foreground">
            Here is your current pending tasks, analytics, and productivity telemetry.
          </p>
        </div>

        {/* 0 Counts Metric Summary Pills if empty */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl border border-border/70 bg-card shadow-xs flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Projects:</span>
            <span className="font-poppins font-semibold text-foreground">{telemetry?.taskDistribution?.totalProjects ?? 0}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-border/70 bg-card shadow-xs flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Pending Tasks:</span>
            <span className="font-poppins font-semibold text-rose-600">{telemetry?.pendingTasks?.counts?.all ?? 0}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-border/70 bg-card shadow-xs flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Completed:</span>
            <span className="font-poppins font-semibold text-emerald-600">{telemetry?.pendingTasks?.counts?.completed ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Empty State — No projects/tasks for this user */}
      {isEmpty ? (
        <div className="p-12 border border-dashed border-border/80 bg-card/60 backdrop-blur-md rounded-2xl text-center space-y-4 max-w-2xl mx-auto my-8">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center mx-auto">
            <FolderPlus className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-poppins text-lg font-bold text-foreground">No projects or tasks assigned yet.</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              You don't have any active projects or tasks assigned to your account yet. Create your first project or get added to an existing team workspace.
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
          {/* SECTION 1: Pending Tasks + Task Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-6 flex">
              <PendingTasksList
                pendingData={telemetry?.pendingTasks}
                onToggleTaskStatus={handleToggleTaskStatus}
                title="Pending Tasks"
                loading={loading}
              />
            </div>
            <div className="lg:col-span-6 flex">
              <ProjectTaskPieChart
                distributionData={telemetry?.taskDistribution}
                title="Task Distribution by Project"
                loading={loading}
              />
            </div>
          </div>

          {/* SECTION 2: Time Analytics + Recent Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-6 flex">
              <TimebasedAnalytics
                analyticsData={telemetry?.timeAnalytics}
                title="Past Time Analytics (Week / Month / Quarter)"
                loading={loading}
              />
            </div>
            <div className="lg:col-span-6 flex">
              <RecentTasksList
                recentData={telemetry?.recentTasks}
                recentTasks={telemetry?.recentTasks?.tasks}
                title="Recent Tasks"
                loading={loading}
              />
            </div>
          </div>
        </>
      )}

    </div>
  )
}

export default Dashboard
