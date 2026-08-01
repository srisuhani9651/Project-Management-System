import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { LayoutDashboard, Kanban, ListTodo } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProjectHeader } from "@/components/project/ProjectHeader"
import { ProjectOverview } from "@/components/project/ProjectOverview"
import { BoardView } from "@/components/project/BoardView"
import { TaskTable } from "@/components/project/TaskTable"
import { CreateTaskModal } from "@/components/project/CreateTaskModal"

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

  // Local state for tasks
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
    {
      id: "t-103",
      name: "Database Schema Migration & Indexes",
      description: "PostgreSQL migration scripts for users, projects, and tasks.",
      priority: "High",
      status: "To Do",
      dueDate: "Aug 10, 2026",
      assignee: "Alice Smith",
      projectKey: project.key,
    },
    {
      id: "t-104",
      name: "Mobile Responsive Layout Polish",
      description: "Refine responsive grid layout and mobile touch interactions.",
      priority: "Low",
      status: "In Progress",
      dueDate: "Aug 8, 2026",
      assignee: "Suhani Srivastava",
      projectKey: project.key,
    },
  ])

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)

  // Handle Project Deletion
  const handleDeleteProject = () => {
    if (setProjects) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    }
    navigate("/dashboard")
  }

  // Handle Project Edit
  const handleEditProject = () => {
    navigate("/create-project")
  }

  // Handle Task Creation
  const handleCreateTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev])
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
        projectKey={project.key}
      />
    </div>
  )
}

export default ProjectDetails
