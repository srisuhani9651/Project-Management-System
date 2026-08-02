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

/**
 * Modern ProjectDetails Page Component
 * Segmented pill tabs UI & streamlined header.
 */
export function ProjectDetails() {
  const { projectId, id } = useParams()
  const navigate = useNavigate()
  const { projects, setProjects } = useProject()

  const currentId = projectId || id

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
    assignee: t.assignee_name || t.assignee || "Unassigned",
    projectKey: project.key,
  })

  const [tasks, setTasks] = useState([
    {
      id: "t-101",
      name: "Setup PostgreSQL Schema",
      description: "Database tables creation and relationship indexing.",
      priority: "High",
      status: "Done",
      dueDate: "Aug 5, 2026",
      assignee: "Alex Rivera",
      projectKey: project.key,
    },
    {
      id: "t-102",
      name: "React.js Integration",
      description: "Frontend components state binding and route connection.",
      priority: "Medium",
      status: "In Progress",
      dueDate: "Aug 12, 2026",
      assignee: "Sarah Chen",
      projectKey: project.key,
    },
  ])

  useEffect(() => {
    async function fetchProjectTasks() {
      if (!project?.id || project.id.startsWith("proj-")) return
      try {
        const res = await api.get("/tasks", { params: { project_id: project.id } })
        if (Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map(formatTaskObj)
          setTasks(formatted)
        }
      } catch (err) {
        console.warn("Failed to fetch project tasks from backend:", err)
      }
    }
    fetchProjectTasks()
  }, [project?.id])

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)

  const handleDeleteProject = () => {
    if (setProjects) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    }
    navigate("/dashboard")
  }

  const handleEditProject = () => {
    setShowEditProjectModal(true)
  }

  const handleCreateTask = (newTask) => {
    const formatted = formatTaskObj(newTask)
    setTasks((prev) => [formatted, ...prev])
  }

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
  }

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
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
      <Tabs defaultValue="overview" className="space-y-6 font-roboto">
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
    </div>
  )
}

export default ProjectDetails
