import React from "react"

/**
 * StatusPieChart Component
 * Dependency-free, responsive SVG Donut / Pie Chart visualizing task status distribution
 * with modern gradient slices, center summary metric, and legend breakdown.
 */
export function StatusPieChart({
  todoCount = 0,
  inProgressCount = 0,
  doneCount = 0,
  title = "Task Status Distribution",
}) {
  const total = todoCount + inProgressCount + doneCount

  // Slice calculations for SVG circle strokeDasharray
  const radius = 40
  const circumference = 2 * Math.PI * radius

  const todoRatio = total > 0 ? todoCount / total : 0
  const inProgressRatio = total > 0 ? inProgressCount / total : 0
  const doneRatio = total > 0 ? doneCount / total : 0

  const todoDash = todoRatio * circumference
  const inProgressDash = inProgressRatio * circumference
  const doneDash = doneRatio * circumference

  // Offsets for cumulative slices
  const doneOffset = 0
  const inProgressOffset = -doneDash
  const todoOffset = -(doneDash + inProgressDash)

  const completionPercentage = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className="flex flex-col items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs space-y-4 w-full">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground self-start">
        {title}
      </h4>

      <div className="relative flex items-center justify-center my-2">
        {/* SVG Donut Chart */}
        <svg viewBox="0 0 100 100" className="w-44 h-44 -rotate-90 transform">
          {/* Background Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-muted/40"
            strokeWidth="12"
            fill="transparent"
          />

          {/* Done Slice (Emerald) */}
          {doneCount > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#emeraldGradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${doneDash} ${circumference}`}
              strokeDashoffset={doneOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* In Progress Slice (Indigo/Blue) */}
          {inProgressCount > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#blueGradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${inProgressDash} ${circumference}`}
              strokeDashoffset={inProgressOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* To Do Slice (Amber/Orange) */}
          {todoCount > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#amberGradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${todoDash} ${circumference}`}
              strokeDashoffset={todoOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-foreground tracking-tight">{completionPercentage}%</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Done</span>
        </div>
      </div>

      {/* Legend Items */}
      <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-border/50 text-center">
        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Done
          </div>
          <p className="text-xs font-black text-foreground">{doneCount}</p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-600">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> In Progress
          </div>
          <p className="text-xs font-black text-foreground">{inProgressCount}</p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> To Do
          </div>
          <p className="text-xs font-black text-foreground">{todoCount}</p>
        </div>
      </div>
    </div>
  )
}

export default StatusPieChart
