import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import { FolderPlus } from "lucide-react"

// Modern Dashboard Subcomponents
import { ProjectTaskPieChart } from "@/components/dashboard/ProjectTaskPieChart"
import { PendingTasksList } from "@/components/dashboard/PendingTasksList"
import { TimebasedAnalytics } from "@/components/dashboard/TimebasedAnalytics"
import { RecentTasksList } from "@/components/dashboard/RecentTasksList"

/**
 * Modern Dynamic Dashboard Page Component
 * Connects to single backend API /api/dashboard for real database metrics.
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

  const userName = user?.fullName || user?.full_name || "Suhani Srivastava"

  // Fetch full dashboard telemetry from single API endpoint
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/dashboard")
      const data = res.data
      setTelemetry(data)
      // Empty state: no tasks and no projects for this user
      const noTasks = (data?.pendingTasks?.counts?.all ?? 0) === 0
      const noProjects = (data?.taskDistribution?.totalProjects ?? 0) === 0
      setIsEmpty(noTasks && noProjects)
    } catch (err) {
      console.warn("Could not fetch /api/dashboard, trying fallback /dashboard:", err)
      try {
        const fallbackRes = await api.get("/dashboard")
        const data = fallbackRes.data
        setTelemetry(data)
        const noTasks = (data?.pendingTasks?.counts?.all ?? 0) === 0
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
      // Fetch LOV status options to get matching status_id for target status
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

      // Call backend API to persist task status change in database
      await api.post(`/tasks/${tId}`, updatePayload).catch(() => {
        return api.post(`/api/manage/task/${tId}`, updatePayload)
      })

      // Refetch updated live database telemetry
      await fetchDashboardData()
      if (fetchProjects) fetchProjects()
    } catch (err) {
      console.error("Failed to update task status on backend:", err)
      // Refetch on error to revert to true database state
      fetchDashboardData()
    }
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
      </div>

      {/* Empty State — No projects/tasks for this user */}
      {!loading && isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-5">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <FolderPlus className="h-8 w-8 text-blue-600 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-poppins text-lg font-bold text-foreground">No Projects Found</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              You haven't created any projects yet. Start by creating your first project.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/projects/new")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-poppins text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" />
            Create New Project
          </button>
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
