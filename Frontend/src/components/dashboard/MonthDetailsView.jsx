import React, { useState } from "react"
import { Calendar, ChevronDown, Award, Sparkles } from "lucide-react"

/**
 * MonthDetailsView Component
 * Softened typography weights & refined layout.
 */
export function MonthDetailsView({ title = "Specific Month Breakdown" }) {
  const [selectedMonth, setSelectedMonth] = useState("Aug 2026")

  const monthlyData = {
    "Aug 2026": {
      monthName: "August 2026",
      status: "In Progress (Current)",
      totalCreated: 32,
      totalCompleted: 28,
      completionRate: "87.5%",
      hoursTracked: "142 hrs",
      peakDay: "August 14 (Tuesday)",
      topProject: "Project management",
      categories: [
        { name: "Development", pct: 60, color: "bg-blue-500" },
        { name: "Design & UX", pct: 25, color: "bg-emerald-500" },
        { name: "Documentation", pct: 15, color: "bg-amber-500" },
      ],
    },
    "Jul 2026": {
      monthName: "July 2026",
      status: "Completed",
      totalCreated: 45,
      totalCompleted: 42,
      completionRate: "93.3%",
      hoursTracked: "178 hrs",
      peakDay: "July 22 (Wednesday)",
      topProject: "Inventory Management",
      categories: [
        { name: "Development", pct: 50, color: "bg-blue-500" },
        { name: "Design & UX", pct: 30, color: "bg-emerald-500" },
        { name: "Testing & QA", pct: 20, color: "bg-purple-500" },
      ],
    },
    "Jun 2026": {
      monthName: "June 2026",
      status: "Completed",
      totalCreated: 38,
      totalCompleted: 35,
      completionRate: "92.1%",
      hoursTracked: "160 hrs",
      peakDay: "June 18 (Thursday)",
      topProject: "New Web Application",
      categories: [
        { name: "Development", pct: 70, color: "bg-blue-500" },
        { name: "Architecture", pct: 20, color: "bg-indigo-500" },
        { name: "Documentation", pct: 10, color: "bg-amber-500" },
      ],
    },
    "May 2026": {
      monthName: "May 2026",
      status: "Completed",
      totalCreated: 40,
      totalCompleted: 36,
      completionRate: "90.0%",
      hoursTracked: "155 hrs",
      peakDay: "May 29 (Friday)",
      topProject: "Inventory Management",
      categories: [
        { name: "Development", pct: 55, color: "bg-blue-500" },
        { name: "Testing & QA", pct: 25, color: "bg-purple-500" },
        { name: "Design & UX", pct: 20, color: "bg-emerald-500" },
      ],
    },
  }

  const current = monthlyData[selectedMonth] || monthlyData["Aug 2026"]

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card hover:shadow-md transition-all space-y-4 w-full h-full font-roboto">
      
      {/* Header & Month Selector Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-poppins text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-[11px] text-muted-foreground">Select a specific month to inspect breakdown</p>
          </div>
        </div>

        {/* Month Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold px-3 py-1.5 pr-8 rounded-xl border border-border/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          >
            <option value="Aug 2026">August 2026</option>
            <option value="Jul 2026">July 2026</option>
            <option value="Jun 2026">June 2026</option>
            <option value="May 2026">May 2026</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Month Overview Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent p-4 rounded-xl border border-purple-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-poppins text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-purple-600" /> {current.monthName} Performance
          </span>
          <span className="font-poppins text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 border border-purple-500/20">
            {current.status}
          </span>
        </div>

        {/* 4 Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-background/80 backdrop-blur-xs p-2.5 rounded-lg border border-border/40">
            <span className="text-[10px] text-muted-foreground block">Completed Tasks</span>
            <span className="font-poppins text-sm font-semibold text-emerald-600">{current.totalCompleted} / {current.totalCreated}</span>
          </div>

          <div className="bg-background/80 backdrop-blur-xs p-2.5 rounded-lg border border-border/40">
            <span className="text-[10px] text-muted-foreground block">Completion Rate</span>
            <span className="font-poppins text-sm font-semibold text-purple-600">{current.completionRate}</span>
          </div>

          <div className="bg-background/80 backdrop-blur-xs p-2.5 rounded-lg border border-border/40">
            <span className="text-[10px] text-muted-foreground block">Hours Tracked</span>
            <span className="font-poppins text-sm font-semibold text-foreground">{current.hoursTracked}</span>
          </div>

          <div className="bg-background/80 backdrop-blur-xs p-2.5 rounded-lg border border-border/40">
            <span className="text-[10px] text-muted-foreground block">Top Project</span>
            <span className="font-poppins text-xs font-semibold text-blue-600 truncate block mt-0.5">{current.topProject}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="space-y-2 py-1 my-auto">
        <h4 className="font-roboto text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Task Category Distribution ({current.monthName})
        </h4>

        <div className="space-y-2.5">
          {current.categories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-foreground">
                <span>{cat.name}</span>
                <span className="font-poppins text-xs font-semibold">{cat.pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  style={{ width: `${cat.pct}%` }}
                  className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer highlight */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1 font-normal">
          <Award className="h-3.5 w-3.5 text-amber-500" /> Peak Day: <strong className="font-semibold text-foreground">{current.peakDay}</strong>
        </span>
        <span className="font-medium text-purple-600">Month Summary</span>
      </div>

    </div>
  )
}

export default MonthDetailsView
