import React, { useState } from "react"
import { PieChart, Users, UserPlus, Crown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CustomSelect } from "@/components/ui/custom-select"

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-rose-600",
  "bg-amber-600",
]

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "?"

/**
 * Modern ProjectOverview Component
 * Features:
 * - Dynamic Pie Chart with toggle options for Status vs Priority
 * - Overall Workflow Completion progress bar
 * - Horizontal Priority Distribution breakdown
 * - Team Members card with real project membership data
 */
export function ProjectOverview({ tasks = [], project = null, members = [], membersLoading = false, onManageMembers }) {
  const [chartView, setChartView] = useState("status") // "status" | "priority"

  const total = tasks.length

  // Status Metrics
  const completedCount = tasks.filter(
    (t) => (t.status || "").toLowerCase() === "done" || (t.status || "").toLowerCase() === "completed"
  ).length

  const inProgressCount = tasks.filter(
    (t) => (t.status || "").toLowerCase() === "in progress" || (t.status || "").toLowerCase().includes("progress")
  ).length

  const todoCount = tasks.filter(
    (t) => (t.status || "").toLowerCase() === "to do" || (t.status || "").toLowerCase() === "todo"
  ).length

  const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0

  // Priority Metrics
  const highCount = tasks.filter((t) => (t.priority || "").toLowerCase() === "high" || (t.priority || "").toLowerCase() === "urgent").length
  const mediumCount = tasks.filter((t) => (t.priority || "").toLowerCase() === "medium").length
  const lowCount = tasks.filter((t) => (t.priority || "").toLowerCase() === "low").length

  // View mode options
  const viewModeOptions = [
    { id: "status", name: "View by Status" },
    { id: "priority", name: "View by Priority" },
  ]

  // Pie chart calculation helper
  const radius = 42
  const circumference = 2 * Math.PI * radius

  // Slice calculations for Status view
  const safeTotal = total > 0 ? total : 1
  const statusCompletedDash = (completedCount / safeTotal) * circumference
  const statusInProgressDash = (inProgressCount / safeTotal) * circumference
  const statusTodoDash = circumference - statusCompletedDash - statusInProgressDash

  // Slice calculations for Priority view
  const priorityHighDash = (highCount / safeTotal) * circumference
  const priorityMediumDash = (mediumCount / safeTotal) * circumference

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
              {completionPercentage >= 100
                ? "All tasks completed."
                : project?.planned_end_date
                ? `Estimated completion: ${new Date(project.planned_end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`
                : "No planned end date set for this project."}
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

      {/* Team Members Card */}
      <Card className="border border-border/80 bg-card rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <h3 className="font-poppins text-sm font-semibold text-foreground">Team Members</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {members.length}
            </span>
          </div>
          {onManageMembers && (
            <button
              type="button"
              onClick={onManageMembers}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" /> Manage
            </button>
          )}
        </div>

        {membersLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No members added yet. Invite teammates to collaborate on this project.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {members.map((m, idx) => {
              const isMemberOwner = project?.created_by && String(m.user_id) === String(project.created_by)
              return (
                <div
                  key={m.project_member_id}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl bg-muted/30 border border-border/50"
                >
                  <span className={`h-6 w-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                    {getInitials(m.full_name)}
                  </span>
                  <span className="text-xs font-medium text-foreground">{m.full_name}</span>
                  {isMemberOwner && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600">
                      <Crown className="h-2.5 w-2.5" /> Owner
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

    </div>
  )
}

export default ProjectOverview
