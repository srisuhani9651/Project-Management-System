import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, CheckCircle2, Clock, Tag, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CreateTaskModal } from "@/components/project/CreateTaskModal"

/**
 * Ultra-Modern ProjectCard Component
 * Features:
 * - Click anywhere on the card to route to project details page
 * - Top gradient accent bar
 * - Key avatar badge & status pills
 * - Interactive "+ Add Task" button directly inside the card with stopPropagation
 * - Completed & Pending task telemetry
 */
export function ProjectCard({ project, onTaskCreated }) {
  const navigate = useNavigate()
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false)

  const total = project.totalTasks || 0
  const completed = project.completedTasks || 0
  const pending = project.pendingTasks || 0

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

  const getBadgeBg = (key = "") => {
    const k = key.toUpperCase()
    if (k.includes("INV")) return "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
    if (k.includes("PRO")) return "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white"
    return "bg-gradient-to-tr from-sky-500 to-blue-600 text-white"
  }

  const getStatusBadge = (status = "") => {
    const s = status.toLowerCase()
    if (s.includes("progress")) {
      return { text: "IN PROGRESS", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20 font-semibold" }
    }
    if (s.includes("done") || s.includes("completed")) {
      return { text: "DONE", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold" }
    }
    return { text: "TO DO", cls: "bg-muted text-muted-foreground border-border/60 font-medium" }
  }

  const statusInfo = getStatusBadge(project.status)

  const handleCardClick = () => {
    const targetId = project.id || project.key
    if (targetId) {
      navigate(`/projects/${targetId}`)
    }
  }

  const handleTaskCreatedInModal = (newTask) => {
    if (onTaskCreated) {
      onTaskCreated(newTask)
    }
  }

  return (
    <>
      <Card
        onClick={handleCardClick}
        className="relative overflow-hidden border border-border/70 bg-card hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between group font-roboto cursor-pointer"
      >
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

        {/* Card Content Top */}
        <div className="space-y-3.5 pt-1">
          
          {/* Avatar, Title & Status */}
          <div className="flex items-start justify-between gap-3">
            
            <div className="flex items-start gap-3 min-w-0">
              {/* Square Key Badge */}
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-poppins font-bold text-xs shrink-0 shadow-xs ${getBadgeBg(project.key)}`}>
                {project.key}
              </div>

              <div className="space-y-0.5 min-w-0">
                <h3 className="font-poppins text-sm font-semibold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                  {project.name}
                </h3>

                <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Tag className="h-3 w-3 text-blue-500 shrink-0" />
                  <span className="truncate">{project.category || "Development"}</span>
                </div>
              </div>
            </div>

            {/* Status Badge Pill */}
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase border tracking-wider shrink-0 ${statusInfo.cls}`}>
              {statusInfo.text}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
            {project.description || "No project description provided."}
          </p>

          {/* Completion Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-semibold">{completionPercentage}%</span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                style={{ width: `${completionPercentage}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Info & Actions */}
        <div className="flex items-center justify-between pt-3.5 border-t border-border/50 text-xs font-medium text-muted-foreground mt-4 gap-2">
          
          {/* Completed & Pending Task Counts */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1" title="Completed Tasks">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {completed}
            </span>
            <span className="flex items-center gap-1" title="Pending Tasks">
              <Clock className="h-3.5 w-3.5 text-amber-500" /> {pending}
            </span>
          </div>

          {/* Action Buttons: "+ Add Task" and "View Project" */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Add Task Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setAddTaskModalOpen(true)
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              title="Add Task to this project"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Task</span>
            </button>

            {/* View Project Link */}
            <div
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick()
              }}
              className="inline-flex items-center gap-1 font-poppins font-semibold text-xs text-muted-foreground hover:text-blue-600 transition-colors group-hover:translate-x-0.5 cursor-pointer"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

        </div>

      </Card>

      {/* Create Task Modal */}
      {addTaskModalOpen && (
        <CreateTaskModal
          open={addTaskModalOpen}
          onOpenChange={setAddTaskModalOpen}
          onCreateTask={handleTaskCreatedInModal}
          projectId={project.id || project.key}
          projectKey={project.key}
        />
      )}
    </>
  )
}

export default ProjectCard
