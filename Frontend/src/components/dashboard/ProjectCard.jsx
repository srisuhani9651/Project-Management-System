import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, Clock, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

/**
 * ProjectCard Component
 * Matches the project card layout from the reference screenshot:
 * - Square key avatar (INV, PRO, NEW)
 * - Title & Category tag with icon
 * - Status pill badge (TO DO, IN PROGRESS, DONE)
 * - Description snippet
 * - Completion Progress bar & percentage
 * - Footer with completed/pending task counters and "View Project ->" link
 */
export function ProjectCard({ project }) {
  const total = project.totalTasks || 0
  const completed = project.completedTasks || 0
  const pending = project.pendingTasks || 0

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

  // Badge background color helper
  const getBadgeBg = (key = "") => {
    const k = key.toUpperCase()
    if (k.includes("INV")) return "bg-blue-600 text-white"
    if (k.includes("PRO")) return "bg-sky-600 text-white"
    return "bg-teal-600 text-white"
  }

  // Status badge styling helper
  const getStatusBadge = (status = "") => {
    const s = status.toLowerCase()
    if (s.includes("progress")) {
      return { text: "IN PROGRESS", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20" }
    }
    if (s.includes("done") || s.includes("completed")) {
      return { text: "DONE", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" }
    }
    return { text: "TO DO", cls: "bg-muted text-muted-foreground border-border/60" }
  }

  const statusInfo = getStatusBadge(project.status)

  return (
    <Card className="border border-border/80 bg-card hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between group">
      
      {/* Top Header Section */}
      <div className="space-y-3">
        
        {/* Avatar, Title & Status */}
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex items-start gap-3">
            {/* Square Key Badge */}
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${getBadgeBg(project.key)}`}>
              {project.key}
            </div>

            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                {project.name}
              </h3>

              <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Tag className="h-3 w-3 text-blue-600" />
                <span>{project.category || "Development"}</span>
              </div>
            </div>
          </div>

          {/* Status Badge Pill */}
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border tracking-wider shrink-0 ${statusInfo.cls}`}>
            {statusInfo.text}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1">
          {project.description || "No project description provided."}
        </p>

        {/* Completion Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted-foreground">Completion Progress</span>
            <span className="text-foreground font-black">{completionPercentage}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              style={{ width: `${completionPercentage}%` }}
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Footer Info & View Link */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs font-bold text-muted-foreground mt-4">
        
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Completed Tasks">
            <CheckCircle2 className="h-3.5 w-3.5 text-foreground" /> {completed}
          </span>
          <span className="flex items-center gap-1" title="Pending Tasks">
            <Clock className="h-3.5 w-3.5 text-foreground" /> {pending}
          </span>
        </div>

        <Link
          to={`/projects/${project.id || project.key}`}
          className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 transition-colors group-hover:translate-x-0.5"
        >
          View Project <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

    </Card>
  )
}

export default ProjectCard
