import React from "react"
import { Link } from "react-router-dom"
import { ExternalLink, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export function ProjectCard({ project }) {
  const completionPercentage =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0

  return (
    <Card className="border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 shadow-inner border border-primary/20">
              {project.key}
            </div>
            <div>
              <CardTitle className="text-base font-bold group-hover:text-primary transition-colors line-clamp-1">
                {project.name}
              </CardTitle>
              <span className="text-xs text-muted-foreground">{project.category || "Software"}</span>
            </div>
          </div>
          <StatusBadge status={project.status || "Active"} />
        </div>
        <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-2">
          {project.description || "No project description provided."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 space-y-4">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-bold">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Footer info & button */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
          <div className="flex items-center gap-3 text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {project.completedTasks || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> {project.pendingTasks || 0}
            </span>
          </div>

          <Link to={`/projects/${project.id || project.key}`}>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 font-semibold hover:text-primary">
              View Project <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectCard
