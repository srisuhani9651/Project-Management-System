import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { LayoutDashboard, Kanban, ListTodo } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProjectHeader } from "@/components/project/ProjectHeader"
import { ProjectOverview } from "@/components/project/ProjectOverview"
import { BoardView } from "@/components/project/BoardView"
import { TaskTable } from "@/components/project/TaskTable"
import { CreateTaskModal } from "@/components/project/CreateTaskModal"
import { EditProjectModal } from "@/components/project/EditProjectModal"

export function ProjectDetails() {
  const { projectId, id } = useParams()
  const navigate = useNavigate()
  const { projects, setProjects } = useProject()

  const currentId = projectId || id

  // Find target project or fallback to first project
  const project =
    projects.find((p) => p.id === currentId || p.key === currentId) ||
    projects[0] || {
      id: "proj-demo",
      key: "PFW",
      name: "ProjectFlow Web App",
      description: "Next-gen Jira inspired project management dashboard with real-time task board.",
      category: "Software Development",
      createdAt: "Aug 1, 2026",
      status: "Active",
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

  // State for tasks
  const [tasks, setTasks] = useState([
    {
      id: "t-101",
      name: "Setup Authentication Middleware & JWT",
      description: "Secure API endpoints with token verification and refresh tokens.",
      priority: "High",
      status: "In Progress",
      dueDate: "Aug 5, 2026",
      assignee: "Suhani Srivastava",
      projectKey: project.key,
    },
    {
      id: "t-102",
      name: "Design System UI Components & Tokens",
      description: "Tailwind CSS v4 theme variables and shadcn primitive components.",
      priority: "Medium",
      status: "Done",
      dueDate: "Aug 2, 2026",
      assignee: "John Doe",
      projectKey: project.key,
    },
  ])

  // Fetch tasks from Backend API when project ID changes
  useEffect(() => {
    async function fetchProjectTasks() {
      if (!project?.id || project.id.startsWith("proj-")) return
      try {
        const res = await api.get("/tasks", { params: { project_id: project.id } })
        if (Array.isArray(res.data)) {
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

  // Handle Project Deletion
  const handleDeleteProject = () => {
    if (setProjects) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    }
    navigate("/dashboard")
  }

  // Handle Project Edit Modal Toggle
  const handleEditProject = () => {
    setShowEditProjectModal(true)
  }

  // Handle Task Creation
  const handleCreateTask = (newTask) => {
    const formatted = formatTaskObj(newTask)
    setTasks((prev) => [formatted, ...prev])
  }

  // Handle Task Status Update
  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
  }

  // Handle Task Deletion
  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Page Header */}
      <ProjectHeader
        project={project}
        onDeleteProject={handleDeleteProject}
        onEditProject={handleEditProject}
      />

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="board" className="gap-2">
            <Kanban className="h-4 w-4" /> Board View
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" /> Tasks ({tasks.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview">
          <ProjectOverview tasks={tasks} />
        </TabsContent>

        {/* Tab 2: Board View */}
        <TabsContent value="board">
          <BoardView
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onCreateTask={() => setShowCreateTaskModal(true)}
          />
        </TabsContent>

        {/* Tab 3: Tasks Table */}
        <TabsContent value="tasks">
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
