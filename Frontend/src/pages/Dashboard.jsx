import React, { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"

// Modern Dashboard Subcomponents
import { ProjectTaskPieChart } from "@/components/dashboard/ProjectTaskPieChart"
import { PendingTasksList } from "@/components/dashboard/PendingTasksList"
import { TimebasedAnalytics } from "@/components/dashboard/TimebasedAnalytics"
import { MonthDetailsView } from "@/components/dashboard/MonthDetailsView"
import { ProductivityInsights } from "@/components/dashboard/ProductivityInsights"

/**
 * Modern Streamlined Dashboard Page Component
 */
export function Dashboard() {
  const { user, projects } = useProject()
  const [tasks, setTasks] = useState([])

  // Dynamic Greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const userName = user?.fullName || "Aditya Kumar"

  // Fetch tasks from API on mount
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const res = await api.get("/tasks")
        if (res.data && Array.isArray(res.data)) {
          setTasks(res.data)
        }
      } catch (err) {
        console.warn("Could not fetch tasks from API, using fallback data:", err)
      }
    }
    if (user) {
      fetchAllTasks()
    }
  }, [user])

  // Toggle task status locally
  const handleToggleTaskStatus = (taskToToggle) => {
    setTasks((prev) =>
      prev.map((t) => {
        const tId = t.id || t.task_id
        const targetId = taskToToggle.id || taskToToggle.task_id
        if (tId === targetId) {
          const currentStatus = (t.status || t.status_name || "").toLowerCase()
          const newStatus = currentStatus === "done" || currentStatus === "completed" ? "To Do" : "Done"
          return { ...t, status: newStatus, status_name: newStatus }
        }
        return t
      })
    )
  }

  const effectiveTasks = tasks.length > 0 ? tasks : [
    { id: "t1", title: "Design dynamic analytics wireframes & color system", projectName: "Project management", status: "In Progress", priority: "High", dueDate: "Today, 5:00 PM", urgent: true },
    { id: "t2", title: "Integrate JWT token authentication & policy check logic", projectName: "Inventory Management", status: "To Do", priority: "Medium", dueDate: "Tomorrow", urgent: false },
    { id: "t3", title: "Optimize SVG pie chart responsiveness & legend tooltips", projectName: "New Web Application", status: "In Progress", priority: "Low", dueDate: "Aug 5, 2026", urgent: false },
    { id: "t4", title: "Set up monthly productivity calculations API schema", projectName: "Project management", status: "To Do", priority: "High", dueDate: "Aug 6, 2026", urgent: true },
    { id: "t5", title: "Refactor backend project service endpoints", projectName: "Inventory Management", status: "Done", priority: "Medium", dueDate: "Aug 1, 2026", urgent: false },
    { id: "t6", title: "Setup automated CI/CD pipeline", projectName: "New Web Application", status: "Done", priority: "High", dueDate: "Jul 28, 2026", urgent: false }
  ]

  return (
    <div className="flex-1 pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in font-roboto">
      
      {/* 1. Clean Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-1">
          <h1 className="font-poppins text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {getGreeting()}, {userName} <span className="text-xl">👋</span>
          </h1>
          <p className="font-roboto text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
            <span>Here is your current pending tasks, analytics, and productivity telemetry.</span>
            <span className="inline-flex items-center gap-1 font-semibold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md text-[10px]">
              <Sparkles className="h-3 w-3" /> Live Analytics Active
            </span>
          </p>
        </div>
      </div>

      {/* 2. SECTION 1: Pending Tasks List + Project Task Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (6 cols): Pending Tasks List */}
        <div className="lg:col-span-6 flex">
          <PendingTasksList
            tasks={effectiveTasks}
            onToggleTaskStatus={handleToggleTaskStatus}
            title="Pending Tasks"
          />
        </div>

        {/* Right Column (6 cols): Project Task Distribution Pie Chart */}
        <div className="lg:col-span-6 flex">
          <ProjectTaskPieChart
            projects={projects}
            tasks={effectiveTasks}
            title="Task Distribution by Project"
          />
        </div>

      </div>

      {/* 3. SECTION 2: Time-Based Past Analytics + Duration-Based Productivity Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (6 cols): Time-Based Past Analytics */}
        <div className="lg:col-span-6 flex">
          <TimebasedAnalytics title="Past Time Analytics (Week / Month / Quarter)" />
        </div>

        {/* Right Column (6 cols): Productivity Insights */}
        <div className="lg:col-span-6 flex">
          <ProductivityInsights title="Productivity Insights (Time Duration)" />
        </div>

      </div>

      {/* 4. SECTION 3: Specific Month Breakdown */}
      <div className="w-full">
        <MonthDetailsView title="Specific Month Details Breakdown" />
      </div>

    </div>
  )
}

export default Dashboard
