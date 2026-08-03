import React, { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProjectHeader } from "@/components/project/ProjectHeader"
import { ProjectOverview } from "@/components/project/ProjectOverview"
import { BoardView } from "@/components/project/BoardView"
import { TaskTable } from "@/components/project/TaskTable"
import { CreateTaskModal } from "@/components/project/CreateTaskModal"
import { EditProjectModal } from "@/components/project/EditProjectModal"
import { AddMemberModal } from "@/components/project/AddMemberModal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShieldAlert, FileQuestion, ArrowLeft, Loader2, UserPlus } from "lucide-react"

/**
 * Modern ProjectDetails Page Component
 * Connects directly to backend GET /projects/{project_id} API, enforces PBAC authorization,
 * displays real database fields, and returns 403 Forbidden / 404 Not Found on access errors.
 */
export function ProjectDetails() {
  const { projectId, id, tab } = useParams()
  const navigate = useNavigate()
  const { setProjects, fetchProjects } = useProject()

  const currentId = projectId || id
  const validTabs = ["overview", "board", "tasks"]
  const activeTab = tab && validTabs.includes(tab.toLowerCase()) ? tab.toLowerCase() : "overview"

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)

  const handleTabChange = (newTab) => {
    if (newTab !== activeTab && currentId) {
      navigate(`/projects/${currentId}/${newTab}`)
    }
  }

  const formatTaskObj = useCallback((t, pObj) => ({
    id: t.task_id || t.id,
    task_id: t.task_id || t.id,
    name: t.title || t.name,
    title: t.title || t.name,
    description: t.description || "",
    priority: t.priority_name || t.priority || "Medium",
    priority_id: t.priority_id || "",
    status: t.status_name || t.status || "To Do",
    status_id: t.status_id || "",
    task_type_id: t.task_type_id || "",
    dueDate: t.due_date
      ? new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : t.dueDate || "No due date",
    due_date: t.due_date || "",
    completed_at: t.completed_at || "",
    assignee_id: t.assignee_id,
    assignee: t.assignee_name || t.assignee || "Unassigned",
    assigned_to: t.assignee_name || t.assignee || "Unassigned",
    created_by: t.created_by,
    creator_name: t.creator_name || t.created_by_name || "Owner",
    project_id: t.project_id || pObj?.id,
    project_owner_id: pObj?.created_by || t.project_owner_id,
    projectKey: pObj?.key || "PROJ",
  }), [])

  const loadProjectAndTasks = useCallback(async () => {
    if (!currentId) return
    setLoading(true)
    setError(null)

    try {
      let projData = null

      // 1. Attempt to fetch project directly by ID
      try {
        const res = await api.get(`/projects/${currentId}`)
        projData = res.data
      } catch (err) {
        if (err?.response?.status === 403 || err?.response?.status === 404) {
          throw err
        }
        // Try list fallback
        const listRes = await api.get("/projects")
        const found = (listRes.data || []).find((p) => String(p.project_id) === String(currentId))
        if (found) {
          projData = found
        } else {
          throw err
        }
      }

      if (!projData) {
        setError({ status: 404, detail: `Project with ID '${currentId}' not found.` })
        return
      }

      const formattedProj = {
        id: projData.project_id || currentId,
        project_id: projData.project_id || currentId,
        key: projData.project_name ? projData.project_name.substring(0, 3).toUpperCase() : "PROJ",
        name: projData.project_name || projData.name || "Untitled Project",
        project_name: projData.project_name || projData.name || "Untitled Project",
        description: projData.project_description || projData.description || "No description provided.",
        project_description: projData.project_description || "",
        category: projData.category_name || projData.category || "Development",
        category_id: projData.category_id || "",
        status: projData.status_name || projData.status || "In Progress",
        status_id: projData.status_id || "",
        priority: projData.priority_name || projData.priority || "Medium",
        priority_id: projData.priority_id || "",
        projectType: projData.project_type_name || projData.projectType || "Team",
        project_type_id: projData.project_type_id || "",
        planned_start_date: projData.planned_start_date || "",
        planned_end_date: projData.planned_end_date || "",
        actual_start_date: projData.actual_start_date || "",
        actual_end_date: projData.actual_end_date || "",
        estimated_duration: projData.estimated_duration || "",
        created_by: projData.created_by || "",
        createdAt: projData.created_at
          ? new Date(projData.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "Aug 1, 2026",
      }

      setProject(formattedProj)

      // 2. Fetch project tasks
      try {
        const tasksRes = await api.get("/tasks", { params: { project_id: formattedProj.id } })
        if (Array.isArray(tasksRes.data)) {
          setTasks(tasksRes.data.map((t) => formatTaskObj(t, formattedProj)))
        }
      } catch (tasksErr) {
        console.warn("Failed to fetch project tasks:", tasksErr)
        setTasks([])
      }

    } catch (err) {
      console.error("Error loading project details:", err)
      const statusCode = err?.response?.status || 404
      const detail =
        err?.response?.data?.detail ||
        (statusCode === 403
          ? "Access denied: Only project members can view this project details according to PBAC policy."
          : `Project with ID '${currentId}' not found.`)

      setError({ status: statusCode, detail })
    } finally {
      setLoading(false)
    }
  }, [currentId, formatTaskObj])

  const loadMembers = useCallback(async () => {
    if (!currentId) return
    setMembersLoading(true)
    try {
      const res = await api.get(`/api/members/${currentId}`)
      setMembers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.warn("Failed to fetch project members:", err)
      setMembers([])
    } finally {
      setMembersLoading(false)
    }
  }, [currentId])

  useEffect(() => {
    loadProjectAndTasks()
    loadMembers()
  }, [loadProjectAndTasks, loadMembers])

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    try {
      const targetStr = (newStatus || "").toLowerCase().trim()
      const isDone = targetStr === "done" || targetStr === "completed"
      const updatePayload = {
        completed_at: isDone ? new Date().toISOString() : null,
      }
      const lovRes = await api.get("/projects/lov").catch(() => null)
      if (lovRes?.data?.statuses) {
        const match = lovRes.data.statuses.find((s) => {
          const sName = (s.name || "").toLowerCase().trim()
          if (targetStr === "done" || targetStr === "completed") {
            return sName === "completed" || sName === "done"
          }
          if (targetStr === "to do" || targetStr === "todo") {
            return sName === "todo" || sName === "to do"
          }
          if (targetStr === "in progress") {
            return sName === "in progress"
          }
          return sName === targetStr
        })
        if (match) {
          updatePayload.status_id = match.id
        }
      }
      await api.post(`/tasks/${taskId}`, updatePayload).catch(() => {
        return api.post(`/api/manage/task/${taskId}`, updatePayload)
      })
      await loadProjectAndTasks()
      if (fetchProjects) fetchProjects()
    } catch (err) {
      console.warn("Failed to persist task status update:", err)
      loadProjectAndTasks()
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks((prev) => prev.filter((t) => (t.id || t.task_id) !== taskId))
      await api.delete(`/tasks/${taskId}`).catch(() => {
        return api.delete(`/api/manage/task/${taskId}`)
      })
      await loadProjectAndTasks()
    } catch (err) {
      console.warn("Failed to delete task on backend:", err)
      loadProjectAndTasks()
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    try {
      await api.delete(`/projects/${project.id}`)
    } catch (err) {
      console.warn("Failed to delete project:", err)
    } finally {
      if (setProjects) {
        setProjects((prev) => prev.filter((p) => p.id !== project.id))
      }
      navigate("/projects")
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-roboto">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Fetching project details...</p>
      </div>
    )
  }

  // 403 Forbidden Error (PBAC Restriction)
  if (error && error.status === 403) {
    return (
      <div className="flex-1 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full animate-fade-in font-roboto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Go Back
        </button>

        <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-md shadow-lg rounded-2xl p-8 text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
            <ShieldAlert className="h-8 w-8 stroke-[2]" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-foreground">403 Forbidden - Access Denied</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {error.detail || "You do not have permission to view this project according to PBAC policy rules."}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="text-xs font-bold rounded-xl">
              Dashboard
            </Button>
            <Button onClick={() => navigate("/projects")} className="text-xs font-bold rounded-xl bg-primary">
              My Projects
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // 404 Not Found Error
  if (error || !project) {
    return (
      <div className="flex-1 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full animate-fade-in font-roboto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Go Back
        </button>

        <Card className="border-border bg-card backdrop-blur-md shadow-md rounded-2xl p-8 text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-muted-foreground">
            <FileQuestion className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">404 Not Found - Project Unavailable</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {error?.detail || "The requested project does not exist or has been deleted."}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button onClick={() => navigate("/projects")} className="text-xs font-bold rounded-xl">
              Back to Projects
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in font-roboto">
      
      {/* Top Header Card */}
      <ProjectHeader
        project={project}
        tasksCount={tasks.length}
        members={members}
        membersLoading={membersLoading}
        onDeleteProject={handleDeleteProject}
        onEditProject={() => setShowEditProjectModal(true)}
        onAddTask={() => setShowCreateTaskModal(true)}
        onManageMembers={() => setShowAddMemberModal(true)}
      />

      {/* Segmented Pill Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-2 rounded-2xl border border-border/80 shadow-xs">
        
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
          <TabsList className="bg-muted/40 p-1 rounded-xl h-auto gap-1">
            <TabsTrigger
              value="overview"
              className="px-4 py-2 text-xs font-semibold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="board"
              className="px-4 py-2 text-xs font-semibold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              Board View
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="px-4 py-2 text-xs font-semibold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              Task List ({tasks.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Member & Task Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAddMemberModal(true)}
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs font-semibold rounded-xl border-border/80 hover:bg-muted/60 gap-1.5 shadow-xs"
          >
            <UserPlus className="h-3.5 w-3.5 text-blue-600" />
            <span>Manage Members ({members.length})</span>
          </Button>

          <Button
            onClick={() => setShowCreateTaskModal(true)}
            size="sm"
            className="h-9 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5"
          >
            <span>+ Create Task</span>
          </Button>
        </div>

      </div>

      {/* Main Tab Contents */}
      <div className="w-full">
        {activeTab === "overview" && (
          <ProjectOverview
            tasks={tasks}
            project={project}
            members={members}
            membersLoading={membersLoading}
            onManageMembers={() => setShowAddMemberModal(true)}
          />
        )}

        {activeTab === "board" && (
          <BoardView
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            projectId={project.id}
          />
        )}

        {activeTab === "tasks" && (
          <TaskTable
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onTaskUpdated={loadProjectAndTasks}
            projectId={project.id}
          />
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <CreateTaskModal
          open={showCreateTaskModal}
          onOpenChange={setShowCreateTaskModal}
          projectId={project.id}
          onCreateTask={loadProjectAndTasks}
        />
      )}

      {/* Edit Project Modal */}
      {showEditProjectModal && (
        <EditProjectModal
          open={showEditProjectModal}
          onOpenChange={setShowEditProjectModal}
          project={project}
          onProjectUpdated={loadProjectAndTasks}
        />
      )}

      {/* Manage Members Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          open={showAddMemberModal}
          onOpenChange={setShowAddMemberModal}
          projectId={project.id}
          project={project}
          onMembersAdded={loadMembers}
        />
      )}
    </div>
  )
}

export default ProjectDetails
