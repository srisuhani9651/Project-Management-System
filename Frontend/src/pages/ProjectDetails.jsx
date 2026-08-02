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
 * ProjectDetails Page Component
 * Recreates the exact project details page from the reference screenshot:
 * 1. Top breadcrumb & project header.
 * 2. Tab Navigation: Overview, Board View, Tasks (with badge counter).
 * 3. Overview Tab with 4 metric cards, Donut Status Distribution, Workflow & Priority Distribution bars, Recent Activity timeline, and Execution Health card.
 */
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

  // Initialized with 2 realistic tasks matching screenshot
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

  // Fetch tasks from Backend API when project ID changes
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
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Page Header */}
      <ProjectHeader
        project={project}
        onDeleteProject={handleDeleteProject}
        onEditProject={handleEditProject}
        onAddTask={() => setShowCreateTaskModal(true)}
        tasksCount={tasks.length}
      />

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-transparent p-0 h-auto border-b border-border/60 w-full justify-start rounded-none space-x-6">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-xs font-bold text-muted-foreground data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent shadow-none"
          >
            Overview
          </TabsTrigger>

          <TabsTrigger
            value="board"
            className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-xs font-bold text-muted-foreground data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent shadow-none"
          >
            Board View
          </TabsTrigger>

          <TabsTrigger
            value="tasks"
            className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-xs font-bold text-muted-foreground data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent shadow-none flex items-center gap-1.5"
          >
            <span>Tasks</span>
            <span className="h-4 px-1.5 rounded-full bg-muted text-[10px] font-black text-muted-foreground">
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
