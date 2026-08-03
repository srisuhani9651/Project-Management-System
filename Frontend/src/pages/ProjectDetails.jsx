import React, { useState, useEffect } from "react"
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
import { UserPlus } from "lucide-react"

/**
 * Modern ProjectDetails Page Component
 * Segmented pill tabs UI & streamlined header.
 */
export function ProjectDetails() {
  const { projectId, id, tab } = useParams()
  const navigate = useNavigate()
  const { projects, setProjects, fetchProjects, user } = useProject()

  const currentId = projectId || id
  const validTabs = ["overview", "board", "tasks"]
  const activeTab = tab && validTabs.includes(tab.toLowerCase()) ? tab.toLowerCase() : "overview"

  const handleTabChange = (newTab) => {
    if (newTab !== activeTab && currentId) {
      navigate(`/projects/${currentId}/${newTab}`)
    }
  }

  const project =
    projects.find((p) => p.id === currentId || p.key === currentId) ||
    projects[0] || {
      id: "proj-demo",
      key: "PRO",
      name: "Project management system",
      description: "Build fullstack project using FastAPI, React.js, PostgreSQL and Docker",
      category: "Development",
      createdAt: "Aug 1, 2026",
      status: "In Progress",
    }

  const formatTaskObj = (t) => ({
    id: t.task_id || t.id,
    task_id: t.task_id || t.id,
    name: t.title || t.name,
    title: t.title || t.name,
    description: t.description || "",
    priority: t.priority_name || t.priority || "Medium",
    status: t.status_name || t.status || "To Do",
    dueDate: t.due_date
      ? new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : t.dueDate || "No due date",
    assignee_id: t.assignee_id,
    assignee: t.assignee_name || t.assignee || "Unassigned",
    assigned_to: t.assignee_name || t.assignee || "Unassigned",
    created_by: t.created_by,
    creator_name: t.creator_name || t.created_by_name || "Owner",
    project_id: t.project_id || project.id,
    projectKey: project.key,
  })

  const [tasks, setTasks] = useState([])

  const fetchProjectTasks = async () => {
    try {
      const targetProjId = project?.id || currentId
      const params = {}
      if (targetProjId && !String(targetProjId).startsWith("proj-")) {
        params.project_id = targetProjId
      }
      const res = await api.get("/tasks", { params })
      if (Array.isArray(res.data)) setTasks(res.data.map(formatTaskObj))
    } catch (err) {
      console.warn("Failed to fetch project tasks from backend:", err)
    }
  }

  useEffect(() => {
    fetchProjectTasks()
  }, [project?.id, currentId])

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)

  const handleDeleteProject = () => {
    if (setProjects) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    }
    navigate("/dashboard")
  }

  const handleEditProject = () => {
    setShowEditProjectModal(true)
  }

  const handleCreateTask = async (newTask) => {
    const formatted = formatTaskObj(newTask)
    setTasks((prev) => [formatted, ...prev])
    await fetchProjectTasks()
    if (fetchProjects) fetchProjects()
  }

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
      await fetchProjectTasks()
      if (fetchProjects) fetchProjects()
    } catch (err) {
      console.warn("Failed to persist task status update:", err)
      fetchProjectTasks()
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks((prev) => prev.filter((t) => (t.id || t.task_id) !== taskId))
      await api.delete(`/tasks/${taskId}`).catch(() => {
        return api.delete(`/api/manage/task/${taskId}`)
      })
      await fetchProjectTasks()
      if (fetchProjects) fetchProjects()
    } catch (err) {
      console.warn("Failed to delete task on backend:", err)
      fetchProjectTasks()
    }
  }

  return (
    <div className="flex-1 pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 font-roboto">
      
      {/* Page Header */}
      <ProjectHeader
        project={project}
        onDeleteProject={handleDeleteProject}
        onEditProject={handleEditProject}
        onAddTask={() => setShowCreateTaskModal(true)}
        tasksCount={tasks.length}
      />

      {/* Segmented Pill Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 font-roboto">
        {/* Tab Bar Row: Tabs on the left, Add Member on the right */}
        <div className="flex items-center justify-between gap-3">
          <TabsList className="bg-muted/40 p-1.5 rounded-2xl flex border border-border/60 w-full sm:w-auto max-w-md justify-between gap-1 shadow-xs">
            <TabsTrigger
              value="overview"
              className="flex-1 rounded-xl px-4 py-2 font-poppins text-xs font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              Overview
            </TabsTrigger>

            <TabsTrigger
              value="board"
              className="flex-1 rounded-xl px-4 py-2 font-poppins text-xs font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              Board View
            </TabsTrigger>

            <TabsTrigger
              value="tasks"
              className="flex-1 rounded-xl px-4 py-2 font-poppins text-xs font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Tasks</span>
              <span className="h-4 px-1.5 rounded-full bg-blue-500/10 text-[10px] font-poppins font-bold text-blue-600">
                {tasks.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Add Member Button — right end of tab bar */}
          <button
            type="button"
            onClick={() => setShowAddMemberModal(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-poppins text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5 stroke-[2.2]" />
            Add Member
          </button>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="mt-0">
          <ProjectOverview tasks={tasks} />
        </TabsContent>

        {/* Tab 2: Board View */}
        <TabsContent value="board" className="mt-0">
          <BoardView
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onCreateTask={() => setShowCreateTaskModal(true)}
          />
        </TabsContent>

        {/* Tab 3: Tasks Table */}
        <TabsContent value="tasks" className="mt-0">
          <TaskTable
            tasks={tasks}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onCreateTask={() => setShowCreateTaskModal(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={showCreateTaskModal}
        onOpenChange={setShowCreateTaskModal}
        onCreateTask={handleCreateTask}
        projectId={project.id}
        projectKey={project.key}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        open={showEditProjectModal}
        onOpenChange={setShowEditProjectModal}
        project={project}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        open={showAddMemberModal}
        onOpenChange={setShowAddMemberModal}
        projectId={project.id}
      />
    </div>
  )
}

export default ProjectDetails
