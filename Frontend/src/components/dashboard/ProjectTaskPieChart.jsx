import React, { useState } from "react"
import { PieChart, Info } from "lucide-react"

/**
 * ProjectTaskPieChart Component
 * Softened font weights: Poppins for titles & percentage metrics, Roboto for project lists.
 */
export function ProjectTaskPieChart({ projects = [], tasks = [], title = "Task Distribution by Project" }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const COLORS = [
    { fill: "#3b82f6", gradientId: "grad-blue", start: "#3b82f6", end: "#1d4ed8", badge: "bg-blue-500" },
    { fill: "#10b981", gradientId: "grad-emerald", start: "#10b981", end: "#047857", badge: "bg-emerald-500" },
    { fill: "#8b5cf6", gradientId: "grad-purple", start: "#8b5cf6", end: "#6d28d9", badge: "bg-purple-500" },
    { fill: "#f59e0b", gradientId: "grad-amber", start: "#f59e0b", end: "#b45309", badge: "bg-amber-500" },
    { fill: "#ec4899", gradientId: "grad-pink", start: "#ec4899", end: "#be185d", badge: "bg-pink-500" },
    { fill: "#06b6d4", gradientId: "grad-cyan", start: "#06b6d4", end: "#0e7490", badge: "bg-cyan-500" },
  ]

  const projectDataMap = {}
  
  if (tasks.length > 0) {
    tasks.forEach((t) => {
      const projName = t.projectName || t.project_name || "Unassigned"
      projectDataMap[projName] = (projectDataMap[projName] || 0) + 1
    })
  } else if (projects.length > 0) {
    projects.forEach((p) => {
      const projName = p.name || p.project_name || "Unnamed Project"
      const taskCount = (p.totalTasks !== undefined && p.totalTasks > 0) 
        ? p.totalTasks 
        : (p.completedTasks || 0) + (p.pendingTasks || 0) || 5
      projectDataMap[projName] = taskCount
    })
  } else {
    projectDataMap["Inventory Management"] = 12
    projectDataMap["Project Management"] = 18
    projectDataMap["New Web Application"] = 8
  }

  const rawEntries = Object.entries(projectDataMap).map(([name, count]) => ({
    name,
    count,
  }))

  const totalTasks = rawEntries.reduce((acc, item) => acc + item.count, 0)

  const radius = 40
  const circumference = 2 * Math.PI * radius

  let cumulativeRatio = 0
  const processedData = rawEntries.map((item, index) => {
    const ratio = totalTasks > 0 ? item.count / totalTasks : 0
    const dash = ratio * circumference
    const offset = -(cumulativeRatio * circumference)
    cumulativeRatio += ratio
    const percentage = totalTasks > 0 ? Math.round(ratio * 100) : 0
    const colorTheme = COLORS[index % COLORS.length]

    return {
      ...item,
      ratio,
      dash,
      offset,
      percentage,
      colorTheme,
    }
  })

  const activeSegment = hoveredIndex !== null ? processedData[hoveredIndex] : null

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card hover:shadow-md transition-all space-y-4 w-full h-full font-roboto">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <PieChart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-poppins text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-[11px] text-muted-foreground">Workload distribution across active projects</p>
          </div>
        </div>
        <span className="font-poppins text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
          {processedData.length} Projects
        </span>
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto py-2">
        
        {/* SVG Donut Chart */}
        <div className="sm:col-span-5 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-44 h-44 -rotate-90 transform drop-shadow-xs">
            <defs>
              {processedData.map((d, i) => (
                <linearGradient
                  key={`grad-${i}`}
                  id={d.colorTheme.gradientId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={d.colorTheme.start} />
                  <stop offset="100%" stopColor={d.colorTheme.end} />
                </linearGradient>
              ))}
            </defs>

            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-muted/30"
              strokeWidth="10"
              fill="transparent"
            />

            {processedData.map((item, index) => {
              if (item.count === 0) return null
              const isHovered = hoveredIndex === index
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={`url(#${item.colorTheme.gradientId})`}
                  strokeWidth={isHovered ? 13 : 10}
                  fill="transparent"
                  strokeDasharray={`${item.dash} ${circumference}`}
                  strokeDashoffset={item.offset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              )
            })}
          </svg>

          {/* Center Summary metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-poppins text-xl font-bold text-foreground tracking-tight">
              {activeSegment ? `${activeSegment.percentage}%` : totalTasks}
            </span>
            <span className="font-roboto text-[10px] text-muted-foreground uppercase">
              {activeSegment ? activeSegment.name.slice(0, 12) : "Total Tasks"}
            </span>
          </div>
        </div>

        {/* Legend & Breakdown List */}
        <div className="sm:col-span-7 space-y-2 max-h-56 overflow-y-auto pr-1">
          {processedData.map((item, index) => {
            const isHovered = hoveredIndex === index
            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                  isHovered
                    ? "bg-muted/60 border-blue-500/30"
                    : "bg-muted/20 border-transparent hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.colorTheme.badge}`} />
                  <span className="text-xs font-normal text-foreground truncate max-w-[120px] sm:max-w-[140px]">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {item.count} tasks
                  </span>
                  <span className="font-poppins text-xs font-semibold text-foreground w-10 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* Footer hint */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Info className="h-3 w-3 text-blue-500" /> Hover segment to highlight
        </span>
        <span className="font-medium text-foreground">{totalTasks} tasks recorded</span>
      </div>

    </div>
  )
}

export default ProjectTaskPieChart
