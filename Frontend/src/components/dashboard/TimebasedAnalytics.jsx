import React, { useState } from "react"
import { TrendingUp, ArrowUpRight, Activity } from "lucide-react"

/**
 * TimebasedAnalytics Component
 * Softened typography weights & cleaned contrast.
 */
export function TimebasedAnalytics({ title = "Time-Based Task Analytics" }) {
  const [timeframe, setTimeframe] = useState("30d")

  const analyticsData = {
    "7d": {
      periodLabel: "Last 7 Days",
      created: 14,
      completed: 18,
      velocityChange: "+24%",
      throughput: "92%",
      avgDaysToComplete: 1.4,
      bars: [
        { label: "Mon", created: 2, completed: 3 },
        { label: "Tue", created: 3, completed: 4 },
        { label: "Wed", created: 1, completed: 2 },
        { label: "Thu", created: 4, completed: 3 },
        { label: "Fri", created: 2, completed: 4 },
        { label: "Sat", created: 1, completed: 1 },
        { label: "Sun", created: 1, completed: 1 },
      ],
    },
    "30d": {
      periodLabel: "Last 30 Days",
      created: 48,
      completed: 56,
      velocityChange: "+18%",
      throughput: "88%",
      avgDaysToComplete: 2.1,
      bars: [
        { label: "W1", created: 10, completed: 12 },
        { label: "W2", created: 14, completed: 16 },
        { label: "W3", created: 11, completed: 15 },
        { label: "W4", created: 13, completed: 13 },
      ],
    },
    "90d": {
      periodLabel: "Last 90 Days",
      created: 135,
      completed: 152,
      velocityChange: "+31%",
      throughput: "94%",
      avgDaysToComplete: 2.8,
      bars: [
        { label: "May", created: 42, completed: 48 },
        { label: "Jun", created: 45, completed: 50 },
        { label: "Jul", created: 48, completed: 54 },
      ],
    },
  }

  const currentData = analyticsData[timeframe] || analyticsData["30d"]
  const maxVal = Math.max(...currentData.bars.map((b) => Math.max(b.created, b.completed)), 1)

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card hover:shadow-md transition-all space-y-4 w-full h-full font-roboto">
      
      {/* Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-poppins text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-[11px] text-muted-foreground">Historical throughput & completion velocity</p>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
          {[
            { id: "7d", label: "7 Days" },
            { id: "30d", label: "30 Days" },
            { id: "90d", label: "90 Days" },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                timeframe === tf.id
                  ? "bg-card text-indigo-600 shadow-xs border border-border/50 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-3 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
        <div className="space-y-0.5">
          <span className="font-roboto text-[10px] text-muted-foreground uppercase tracking-wider">Completed</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-poppins text-base font-semibold text-foreground">{currentData.completed}</span>
            <span className="font-poppins text-[10px] font-medium text-emerald-600 flex items-center">
              <ArrowUpRight className="h-3 w-3" /> {currentData.velocityChange}
            </span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="font-roboto text-[10px] text-muted-foreground uppercase tracking-wider">Throughput</span>
          <div className="flex items-baseline gap-1">
            <span className="font-poppins text-base font-semibold text-indigo-600">{currentData.throughput}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="font-roboto text-[10px] text-muted-foreground uppercase tracking-wider">Avg Resolution</span>
          <div className="flex items-baseline gap-1">
            <span className="font-poppins text-base font-semibold text-foreground">{currentData.avgDaysToComplete}</span>
            <span className="text-[10px] text-muted-foreground">days</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="space-y-2 py-1 my-auto">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-600" /> Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-400/50" /> Created
            </span>
          </span>
          <span>{currentData.periodLabel}</span>
        </div>

        {/* Grouped Bar Chart */}
        <div className="flex items-end justify-between gap-2 h-32 pt-4 px-2 bg-muted/10 rounded-xl border border-border/30">
          {currentData.bars.map((bar, i) => {
            const completedHeight = Math.round((bar.completed / maxVal) * 100)
            const createdHeight = Math.round((bar.created / maxVal) * 100)

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    style={{ height: `${createdHeight}%` }}
                    className="w-1.5 sm:w-2 bg-sky-400/40 rounded-t-sm transition-all group-hover:bg-sky-400/70"
                    title={`Created: ${bar.created}`}
                  />
                  <div
                    style={{ height: `${completedHeight}%` }}
                    className="w-2 sm:w-3.5 bg-indigo-600 rounded-t-md transition-all group-hover:bg-indigo-500 shadow-xs"
                    title={`Completed: ${bar.completed}`}
                  />
                </div>
                <span className="font-roboto text-[10px] text-muted-foreground group-hover:text-foreground">
                  {bar.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-indigo-500" /> Consistent execution rate
        </span>
        <span className="font-medium text-foreground">Updated in real-time</span>
      </div>

    </div>
  )
}

export default TimebasedAnalytics
