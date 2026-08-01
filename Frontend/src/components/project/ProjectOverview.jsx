import React from "react"
import { CheckCircle2, Clock, ListTodo, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatsCard } from "@/components/dashboard/StatsCard"

export function ProjectOverview({ tasks = [] }) {
  const total = tasks.length
  const completed = tasks.filter((t) => (t.status || "").toLowerCase() === "done" || (t.status || "").toLowerCase() === "completed").length
  const inProgress = tasks.filter((t) => (t.status || "").toLowerCase() === "in progress").length
  const pending = tasks.filter((t) => (t.status || "").toLowerCase() === "todo" || (t.status || "").toLowerCase() === "to do").length

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-6 pt-2">
      {/* Progress Section */}
      <Card className="border border-border/70 bg-card shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Project Completion Progress</CardTitle>
            <span className="text-sm font-extrabold text-primary">{completionPercentage}%</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={completionPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {completed} of {total} tasks completed across all board columns.
          </p>
        </CardContent>
      </Card>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={ListTodo}
          title="Total Tasks"
          count={total}
          trend="All board items"
          iconColor="bg-primary/10 text-primary"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Completed Tasks"
          count={completed}
          trend={`${completionPercentage}% done`}
          iconColor="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          icon={Activity}
          title="In Progress Tasks"
          count={inProgress}
          trend="Active work"
          iconColor="bg-blue-500/10 text-blue-600"
        />
        <StatsCard
          icon={Clock}
          title="Pending Tasks"
          count={pending}
          trend="To do column"
          iconColor="bg-amber-500/10 text-amber-600"
        />
      </div>
    </div>
  )
}

export default ProjectOverview
