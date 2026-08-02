import React, { useState } from "react"
import { PieChart, Filter } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CustomSelect } from "@/components/ui/custom-select"

/**
 * Modern ProjectOverview Component
 * Features:
 * - Dynamic Pie Chart with toggle options for Status vs Priority
 * - Overall Workflow Completion progress bar
 * - Horizontal Priority Distribution breakdown
 * - Removed top 4 metric cards, recent activity, and generate report cards as requested
 */
export function ProjectOverview({ tasks = [] }) {
  const [chartView, setChartView] = useState("status") // "status" | "priority"

  const total = tasks.length || 1

  // Status Metrics
  const completedCount = tasks.filter(
    (t) => (t.status || "").toLowerCase() === "done" || (t.status || "").toLowerCase() === "completed"
  ).length || 1

  const inProgressCount = tasks.filter(
    (t) => (t.status || "").toLowerCase() === "in progress"
  ).length || 1

  const todoCount = Math.max(0, total - completedCount - inProgressCount)

  const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 50

  // Priority Metrics
  const highCount = tasks.filter((t) => (t.priority || "").toLowerCase() === "high").length || 1
  const mediumCount = tasks.filter((t) => (t.priority || "").toLowerCase() === "medium").length || 1
  const lowCount = tasks.filter((t) => (t.priority || "").toLowerCase() === "low").length || 0

  // View mode options
  const viewModeOptions = [
    { id: "status", name: "View by Status" },
    { id: "priority", name: "View by Priority" },
  ]

  // Pie chart calculation helper
  const radius = 42
  const circumference = 2 * Math.PI * radius

  // Slice calculations for Status view
  const statusCompletedDash = (completedCount / total) * circumference
  const statusInProgressDash = (inProgressCount / total) * circumference
  const statusTodoDash = circumference - statusCompletedDash - statusInProgressDash

  // Slice calculations for Priority view
  const priorityHighDash = (highCount / total) * circumference
  const priorityMediumDash = (mediumCount / total) * circumference

  return (
    <div className="space-y-6 pt-2 animate-fade-in font-roboto">
      
      {/* Main Grid: Pie Chart (Left) & Workflow / Priority Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (5 cols): Dynamic Pie / Donut Chart with View Dropdown */}
        <Card className="lg:col-span-5 border border-border/80 bg-card rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          
          {/* Header & View Mode Selector */}
          <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-600" />
              <h3 className="font-poppins text-sm font-semibold text-foreground">Task Distribution</h3>
            </div>

            <div className="w-36 shrink-0">
              <CustomSelect
                options={viewModeOptions}
                value={chartView}
                onChange={(e) => setChartView(e.target.value)}
              />
            </div>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative flex items-center justify-center my-4">
            <svg viewBox="0 0 100 100" className="w-48 h-48 -rotate-90 transform">
              {chartView === "status" ? (
                <>
                  {/* Status: To Do / Base Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-amber-500/20"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Status: In Progress */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#3b82f6"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${statusInProgressDash} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* Status: Completed */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${statusCompletedDash} ${circumference}`}
                    strokeDashoffset={`-${statusInProgressDash}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </>
              ) : (
                <>
                  {/* Priority: Low / Base Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-slate-400/30"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Priority: Medium */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#f59e0b"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${priorityMediumDash} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* Priority: High */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#f43f5e"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${priorityHighDash} ${circumference}`}
                    strokeDashoffset={`-${priorityMediumDash}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </>
              )}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-poppins text-2xl font-bold text-foreground tracking-tight">
                {chartView === "status" ? `${completionPercentage}%` : `${total}`}
              </span>
              <span className="font-poppins text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                {chartView === "status" ? "Completion" : "Total Tasks"}
              </span>
            </div>
          </div>

          {/* Dynamic Legend Items */}
          <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
            {chartView === "status" ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>Completed</span>
                  </div>
                  <span className="font-poppins font-semibold text-foreground">{completedCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span>In Progress</span>
                  </div>
                  <span className="font-poppins font-semibold text-foreground">{inProgressCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                    <span>To Do</span>
                  </div>
                  <span className="font-poppins font-semibold text-foreground">{todoCount}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span>High Priority</span>
                  </div>
                  <span className="font-poppins font-semibold text-foreground">{highCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>Medium Priority</span>
                  </div>
                  <span className="font-poppins font-semibold text-foreground">{mediumCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400/40" />
                    <span>Low Priority</span>
                  </div>
                  <span className="font-poppins font-semibold text-foreground">{lowCount}</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Right Column (7 cols): Overall Workflow & Priority Breakdown */}
        <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
          
          {/* Top Box: Overall Workflow Completion */}
          <Card className="border border-border/80 bg-card rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins text-sm font-semibold text-foreground">Overall Workflow Completion</h3>
              <span className="font-poppins text-sm font-bold text-blue-600">{completionPercentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                style={{ width: `${completionPercentage}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              />
            </div>

            <p className="text-xs font-medium text-muted-foreground pt-1">
              Project is tracking well. Estimated completion: Aug 31, 2026.
            </p>
          </Card>

          {/* Bottom Box: Priority Distribution Breakdown */}
          <Card className="border border-border/80 bg-card rounded-2xl p-6 shadow-xs space-y-4 flex-1 flex flex-col justify-between">
            <h3 className="font-poppins text-sm font-semibold text-foreground">Priority Distribution</h3>

            <div className="space-y-3.5">
              {/* High Priority */}
              <div className="flex items-center gap-3">
                <span className="w-16 text-xs font-medium text-muted-foreground">High</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div style={{ width: `${(highCount / total) * 100}%` }} className="h-full bg-rose-500 rounded-full" />
                </div>
                <span className="w-4 font-poppins text-xs font-semibold text-foreground text-right">{highCount}</span>
              </div>

              {/* Medium Priority */}
              <div className="flex items-center gap-3">
                <span className="w-16 text-xs font-medium text-muted-foreground">Medium</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div style={{ width: `${(mediumCount / total) * 100}%` }} className="h-full bg-amber-500 rounded-full" />
                </div>
                <span className="w-4 font-poppins text-xs font-semibold text-foreground text-right">{mediumCount}</span>
              </div>

              {/* Low Priority */}
              <div className="flex items-center gap-3">
                <span className="w-16 text-xs font-medium text-muted-foreground">Low</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div style={{ width: `${(lowCount / total) * 100}%` }} className="h-full bg-slate-400 rounded-full" />
                </div>
                <span className="w-4 font-poppins text-xs font-semibold text-foreground text-right">{lowCount}</span>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  )
}

export default ProjectOverview
