import React from "react"

/**
 * TaskProgressBarChart Component
 * Visual horizontal stacked bar chart & priority metrics breakdown
 * for modern workspace metrics and project analytics dashboard.
 */
export function TaskProgressBarChart({
  tasks = [],
  title = "Task Priority & Execution Analytics",
}) {
  const total = tasks.length

  // Calculate priority breakdown
  const highPriority = tasks.filter(
    (t) => (t.priority || "").toLowerCase() === "high"
  ).length
  const mediumPriority = tasks.filter(
    (t) => (t.priority || "").toLowerCase() === "medium"
  ).length
  const lowPriority = tasks.filter(
    (t) => (t.priority || "").toLowerCase() === "low"
  ).length

  // Calculate status breakdown
  const doneTasks = tasks.filter(
    (t) =>
      (t.status || "").toLowerCase() === "done" ||
      (t.status || "").toLowerCase() === "completed"
  ).length
  const inProgressTasks = tasks.filter(
    (t) => (t.status || "").toLowerCase() === "in progress"
  ).length
  const todoTasks = tasks.filter(
    (t) =>
      (t.status || "").toLowerCase() === "to do" ||
      (t.status || "").toLowerCase() === "todo"
  ).length

  const getPercent = (count) => (total > 0 ? Math.round((count / total) * 100) : 0)

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs space-y-5 w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
          {total} Total Tasks
        </span>
      </div>

      {/* Stacked Execution Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-foreground">Overall Workflow Completion</span>
          <span className="text-emerald-600 font-extrabold">{getPercent(doneTasks)}%</span>
        </div>

        {/* Multi-segment Segmented Bar */}
        <div className="h-3.5 w-full rounded-full bg-muted/60 overflow-hidden flex p-0.5 border border-border/50 shadow-inner">
          {doneTasks > 0 && (
            <div
              style={{ width: `${getPercent(doneTasks)}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500"
              title={`Done: ${doneTasks}`}
            />
          )}
          {inProgressTasks > 0 && (
            <div
              style={{ width: `${getPercent(inProgressTasks)}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
              title={`In Progress: ${inProgressTasks}`}
            />
          )}
          {todoTasks > 0 && (
            <div
              style={{ width: `${getPercent(todoTasks)}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-r-full transition-all duration-500"
              title={`To Do: ${todoTasks}`}
            />
          )}
        </div>
      </div>

      {/* Priority Distribution Horizontal Bars */}
      <div className="space-y-3 pt-2 border-t border-border/50 text-xs">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Priority Distribution</p>

        {/* High Priority Bar */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-[11px]">
            <span className="text-rose-600 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> High Priority
            </span>
            <span className="text-foreground font-black">{highPriority} ({getPercent(highPriority)}%)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
            <div
              style={{ width: `${getPercent(highPriority)}%` }}
              className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Medium Priority Bar */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-[11px]">
            <span className="text-amber-600 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium Priority
            </span>
            <span className="text-foreground font-black">{mediumPriority} ({getPercent(mediumPriority)}%)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
            <div
              style={{ width: `${getPercent(mediumPriority)}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Low Priority Bar */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-[11px]">
            <span className="text-slate-600 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400" /> Low Priority
            </span>
            <span className="text-foreground font-black">{lowPriority} ({getPercent(lowPriority)}%)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
            <div
              style={{ width: `${getPercent(lowPriority)}%` }}
              className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskProgressBarChart
