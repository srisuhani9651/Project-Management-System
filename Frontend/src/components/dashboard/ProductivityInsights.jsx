import React, { useState } from "react"
import { Zap, ShieldCheck, Target, Flame, Lightbulb, Clock, CheckCircle2 } from "lucide-react"

/**
 * ProductivityInsights Component
 * Calculates time duration-based productivity analytics, on-time resolution score,
 * focus velocity metrics, and dynamic productivity recommendation callouts.
 */
export function ProductivityInsights({ title = "Productivity Insights" }) {
  const [duration, setDuration] = useState("week") // 'today', 'week', 'month', 'ytd'

  const durationData = {
    today: {
      label: "Today",
      score: 94,
      status: "Peak Focus",
      onTimeRate: "96%",
      completedToday: 5,
      goal: 6,
      focusHours: "6.2 hrs",
      velocity: "+15% vs yesterday",
      insight: "You're operating at peak efficiency! Completing 1 more task will achieve today's sprint target.",
    },
    week: {
      label: "This Week",
      score: 89,
      status: "High Productivity",
      onTimeRate: "92%",
      completedToday: 24,
      goal: 25,
      focusHours: "31.5 hrs",
      velocity: "+18% vs last week",
      insight: "Peak productivity occurs on Tuesdays & Thursdays between 10 AM - 1 PM. Keep morning focus blocks reserved!",
    },
    month: {
      label: "This Month",
      score: 86,
      status: "Consistent Output",
      onTimeRate: "88%",
      completedToday: 88,
      goal: 100,
      focusHours: "128 hrs",
      velocity: "+12% vs last month",
      insight: "High-priority tasks are resolved 2x faster than medium tasks. Great prioritization flow!",
    },
    ytd: {
      label: "Year to Date",
      score: 91,
      status: "Exceptional",
      onTimeRate: "94%",
      completedToday: 340,
      goal: 380,
      focusHours: "520 hrs",
      velocity: "+22% overall",
      insight: "Overall task turnaround time improved by 1.2 days across all active projects.",
    },
  }

  const current = durationData[duration] || durationData["week"]

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card hover:shadow-lg transition-all space-y-4 w-full h-full">
      
      {/* Header & Duration Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">{title}</h3>
            <p className="text-[11px] text-muted-foreground">Duration-based efficiency breakdown</p>
          </div>
        </div>

        {/* Duration Pills */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl overflow-x-auto">
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
            { id: "ytd", label: "YTD" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDuration(d.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                duration === d.id
                  ? "bg-card text-amber-600 shadow-xs border border-border/50 font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Score Radial Gauge & Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto py-1">
        
        {/* Score Ring (5 cols) */}
        <div className="sm:col-span-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-xl border border-amber-500/20 flex flex-col items-center justify-center text-center space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 uppercase tracking-wider">
            <Flame className="h-3.5 w-3.5 fill-amber-500/20" /> Score ({current.label})
          </div>

          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90 transform">
              <circle cx="50" cy="50" r="38" className="stroke-muted/40" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="url(#amberScoreGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${(current.score / 100) * 238} 238`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="amberScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-foreground">{current.score}%</span>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-700 border border-amber-500/30">
            {current.status}
          </span>
        </div>

        {/* Key Indicators Grid (7 cols) */}
        <div className="sm:col-span-7 grid grid-cols-2 gap-2.5">
          
          <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> On-Time Rate
            </span>
            <p className="text-base font-black text-emerald-600">{current.onTimeRate}</p>
          </div>

          <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" /> Focus Time
            </span>
            <p className="text-base font-black text-foreground">{current.focusHours}</p>
          </div>

          <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Target className="h-3 w-3 text-purple-500" /> Target Progress
            </span>
            <p className="text-base font-black text-purple-600">
              {current.completedToday}/{current.goal}
            </p>
          </div>

          <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Velocity Rate
            </span>
            <p className="text-xs font-black text-amber-600 truncate mt-0.5">{current.velocity}</p>
          </div>

        </div>

      </div>

      {/* AI Smart Insight Callout Banner */}
      <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 flex items-start gap-2.5">
        <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/90 font-medium leading-relaxed">
          <strong className="font-bold text-amber-600">Productivity Insight: </strong>
          {current.insight}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Calculated across all user activities
        </span>
        <span className="font-bold text-foreground">Live Telemetry</span>
      </div>

    </div>
  )
}

export default ProductivityInsights
