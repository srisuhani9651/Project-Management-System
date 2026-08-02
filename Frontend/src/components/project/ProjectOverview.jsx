import React from "react"
import {
  FileText,
  CheckCircle,
  MoreHorizontal,
  Clock,
  Check,
  RefreshCw,
  Award
} from "lucide-react"
import { Card } from "@/components/ui/card"

/**
 * ProjectOverview Component
 * Recreates the exact Overview dashboard tab from the reference screenshot:
 * 1. 4 Metric Cards (Total Tasks +12%, Completed, In Progress, Pending).
 * 2. Middle Row: Donut "Status Distribution", "Overall Workflow Completion" bar, and "Priority Distribution" bars.
 * 3. Bottom Row: "Recent Activity" timeline log and "Execution Health (On Track)" report card.
 */
export function ProjectOverview({ tasks = [] }) {
  const total = tasks.length || 2
  const completed = tasks.filter(
    (t) =>
      (t.status || "").toLowerCase() === "done" ||
      (t.status || "").toLowerCase() === "completed"
  ).length || 1
  const inProgress = tasks.filter(
    (t) => (t.status || "").toLowerCase() === "in progress"
  ).length || 1
  const pending = tasks.filter(
    (t) =>
      (t.status || "").toLowerCase() === "todo" ||
      (t.status || "").toLowerCase() === "to do"
  ).length || 0

  const remaining = total - completed

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 50

  // Priority counts
  const highPriority = tasks.filter((t) => (t.priority || "").toLowerCase() === "high").length || 1
  const mediumPriority = tasks.filter((t) => (t.priority || "").toLowerCase() === "medium").length || 1
  const lowPriority = tasks.filter((t) => (t.priority || "").toLowerCase() === "low").length || 0

  // SVG Donut Calculations
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const completedDash = (completed / total) * circumference
  const remainingDash = circumference - completedDash

  return (
    <div className="space-y-6 pt-3 animate-fade-in">
      
      {/* 1. Row 1: 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Tasks */}
        <Card className="border border-border/80 bg-card rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="h-9 w-9 rounded-xl bg-muted/70 text-muted-foreground flex items-center justify-center shrink-0">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">+12% vs last week</span>
          </div>
          <div className="mt-4 space-y-0.5">
            <span className="text-xs font-bold text-muted-foreground">Total Tasks</span>
            <p className="text-3xl font-black text-foreground">{total}</p>
          </div>
        </Card>

        {/* Card 2: Completed */}
        <Card className="border border-border/80 bg-card rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="h-9 w-9 rounded-xl bg-muted/70 text-muted-foreground flex items-center justify-center shrink-0">
            <CheckCircle className="h-4.5 w-4.5" />
          </div>
          <div className="mt-4 space-y-0.5">
            <span className="text-xs font-bold text-muted-foreground">Completed</span>
            <p className="text-3xl font-black text-foreground">{completed}</p>
          </div>
        </Card>

        {/* Card 3: In Progress */}
        <Card className="border border-border/80 bg-card rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="h-9 w-9 rounded-xl bg-muted/70 text-muted-foreground flex items-center justify-center shrink-0">
            <MoreHorizontal className="h-4.5 w-4.5" />
          </div>
          <div className="mt-4 space-y-0.5">
            <span className="text-xs font-bold text-muted-foreground">In Progress</span>
            <p className="text-3xl font-black text-foreground">{inProgress}</p>
          </div>
        </Card>

        {/* Card 4: Pending */}
        <Card className="border border-border/80 bg-card rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="h-9 w-9 rounded-xl bg-muted/70 text-muted-foreground flex items-center justify-center shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div className="mt-4 space-y-0.5">
            <span className="text-xs font-bold text-muted-foreground">Pending</span>
            <p className="text-3xl font-black text-foreground">{pending}</p>
          </div>
        </Card>

      </div>

      {/* 2. Row 2: Status Distribution (Left) & Workflow / Priority Bars (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (5 cols): Donut Pie Chart - Status Distribution */}
        <Card className="lg:col-span-5 border border-border/80 bg-card rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-black text-foreground">Status Distribution</h3>

          {/* SVG Donut Chart */}
          <div className="relative flex items-center justify-center my-2">
            <svg viewBox="0 0 100 100" className="w-48 h-48 -rotate-90 transform">
              {/* Remaining Slice (Light Gray) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-muted/50"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Completed Slice (Blue) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#2563eb"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={`${completedDash} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-foreground tracking-tight">{completionPercentage}%</span>
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mt-0.5">Done</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs font-bold px-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span className="text-foreground">Completed</span>
            </div>
            <span className="text-foreground font-black">{completed}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold px-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">Remaining</span>
            </div>
            <span className="text-foreground font-black">{remaining}</span>
          </div>
        </Card>

        {/* Right Column (7 cols): Overall Workflow & Priority Distribution */}
        <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
          
          {/* Top Box: Overall Workflow Completion */}
          <Card className="border border-border/80 bg-card rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground">Overall Workflow Completion</h3>
              <span className="text-sm font-black text-blue-600">{completionPercentage}%</span>
            </div>

            {/* Thick Blue Progress Bar */}
            <div className="h-3.5 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                style={{ width: `${completionPercentage}%` }}
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
              />
            </div>

            <p className="text-xs font-medium text-muted-foreground pt-1">
              Project is tracking well. Estimated completion: Aug 31, 2026.
            </p>
          </Card>

          {/* Bottom Box: Priority Distribution */}
          <Card className="border border-border/80 bg-card rounded-2xl p-6 shadow-xs space-y-4 flex-1 flex flex-col justify-between">
            <h3 className="text-sm font-black text-foreground">Priority Distribution</h3>

            <div className="space-y-3.5">
              {/* High Priority */}
              <div className="flex items-center gap-3">
                <span className="w-16 text-xs font-bold text-muted-foreground">High</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div style={{ width: "60%" }} className="h-full bg-red-600 rounded-full" />
                </div>
                <span className="w-4 text-xs font-black text-foreground text-right">{highPriority}</span>
              </div>

              {/* Medium Priority */}
              <div className="flex items-center gap-3">
                <span className="w-16 text-xs font-bold text-muted-foreground">Medium</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div style={{ width: "60%" }} className="h-full bg-amber-500 rounded-full" />
                </div>
                <span className="w-4 text-xs font-black text-foreground text-right">{mediumPriority}</span>
              </div>

              {/* Low Priority */}
              <div className="flex items-center gap-3">
                <span className="w-16 text-xs font-bold text-muted-foreground">Low</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div style={{ width: "0%" }} className="h-full bg-muted-foreground/30 rounded-full" />
                </div>
                <span className="w-4 text-xs font-black text-foreground text-right">{lowPriority}</span>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* 3. Row 3: Recent Activity (Left) & Execution Health (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (7 cols): Recent Activity Timeline */}
        <Card className="lg:col-span-7 border border-border/80 bg-card rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-black text-foreground">Recent Activity</h3>
            <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View Log</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Activity 1 */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-4 w-4 stroke-[3]" />
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="text-foreground">
                  <span className="font-bold">Alex Rivera</span> completed task{" "}
                  <span className="font-bold">"Setup PostgreSQL Schema"</span>
                </p>
                <p className="text-[10px] text-muted-foreground">2 hours ago</p>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="text-foreground">
                  <span className="font-bold">Sarah Chen</span> moved{" "}
                  <span className="font-bold">"React.js Integration"</span> to{" "}
                  <span className="font-bold text-blue-600">In Progress</span>
                </p>
                <p className="text-[10px] text-muted-foreground">5 hours ago</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column (5 cols): Execution Health */}
        <Card className="lg:col-span-5 border border-border/80 bg-card rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="h-7 w-7 stroke-[2]" />
          </div>

          <div className="space-y-1 max-w-xs">
            <h3 className="text-base font-black text-foreground">On Track</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Velocity is consistent with the projected deadline.
            </p>
          </div>

          <button
            type="button"
            className="w-full max-w-xs py-2 px-4 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
          >
            Generate Report
          </button>
        </Card>

      </div>

    </div>
  )
}

export default ProjectOverview
