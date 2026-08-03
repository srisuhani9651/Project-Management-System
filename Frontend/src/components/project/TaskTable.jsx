import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Trash2, Edit3, Eye, FolderPlus, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { PriorityBadge } from "@/components/common/PriorityBadge"
import { PermissionButton } from "@/components/common/PermissionButton"
import { EmptyState } from "@/components/common/EmptyState"
import { EditTaskModal } from "@/components/project/EditTaskModal"
import { useProject } from "@/context/ProjectContext"

/**
 * Modern TaskTable Component
 * Fully bound to live API database response with search, status/priority filtering,
 * pagination controls, inline status updates, and PBAC permission controls.
 */
export function TaskTable({ tasks = [], onDeleteTask, onUpdateTaskStatus, onCreateTask }) {
  const navigate = useNavigate()
  const { user, authorize } = useProject()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [taskToEdit, setTaskToEdit] = useState(null)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, priorityFilter])

  // Filter tasks based on live API properties
  const filteredTasks = tasks.filter((task) => {
    const q = searchQuery.toLowerCase().trim()
    const taskTitle = (task.title || task.name || "").toLowerCase()
    const taskDesc = (task.description || "").toLowerCase()
    const taskAssignee = (task.assigned_to || task.assignee_name || task.assignee || "").toLowerCase()
    const taskProj = (task.project_name || task.projectName || "").toLowerCase()

    const titleMatch = !q || taskTitle.includes(q) || taskDesc.includes(q) || taskAssignee.includes(q) || taskProj.includes(q)

    const taskStatus = (task.status_name || task.status || "").toLowerCase()
    let matchesStatus = true
    if (statusFilter === "To Do") matchesStatus = taskStatus === "to do" || taskStatus === "todo"
    if (statusFilter === "In Progress") matchesStatus = taskStatus === "in progress"
    if (statusFilter === "Done") matchesStatus = taskStatus === "done" || taskStatus === "completed"

    const taskPriority = (task.priority_name || task.priority || "").toLowerCase()
    let matchesPriority = true
    if (priorityFilter !== "All") matchesPriority = taskPriority === priorityFilter.toLowerCase()

    return titleMatch && matchesStatus && matchesPriority
  })

  // Calculate Pagination Slices
  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + pageSize)

  return (
    <div className="pt-2 space-y-4 animate-fade-in font-roboto">
      
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks by title, user, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-muted/20 border-border/70 focus-visible:ring-2 focus-visible:ring-blue-500/20"
            />
          </div>

          {/* Status Select Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-xl border border-border/70 bg-card px-3 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <option value="All">Status: All</option>
            <option value="To Do">Status: To Do</option>
            <option value="In Progress">Status: In Progress</option>
            <option value="Done">Status: Done</option>
          </select>

          {/* Priority Select Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 rounded-xl border border-border/70 bg-card px-3 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <option value="All">Priority: All</option>
            <option value="High">Priority: High</option>
            <option value="Medium">Priority: Medium</option>
            <option value="Low">Priority: Low</option>
          </select>
        </div>

        {/* Create Task Button */}
        <PermissionButton
          action="create"
          resource="task"
          size="sm"
          onClick={onCreateTask}
          className="gap-1.5 font-poppins font-semibold text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" /> Create New Task
        </PermissionButton>
      </div>

      {/* Task Data Table */}
      {filteredTasks.length > 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold font-poppins">Task Title</TableHead>
                <TableHead className="text-xs font-bold font-poppins">Assigned To</TableHead>
                <TableHead className="text-xs font-bold font-poppins">Priority</TableHead>
                <TableHead className="text-xs font-bold font-poppins">Status</TableHead>
                <TableHead className="text-xs font-bold font-poppins">Due Date</TableHead>
                <TableHead className="text-xs font-bold font-poppins text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTasks.map((task) => {
                const taskId = task.task_id || task.id
                const taskTitle = task.title || task.name || "Untitled Task"
                const assignedName = task.assigned_to || task.assignee_name || task.assignee || "Unassigned"
                const priorityVal = task.priority_name || task.priority || "Medium"
                const statusVal = task.status_name || task.status || "To Do"
                const dueDateStr = task.dueDate || (task.due_date ? new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No due date")

                const canEdit = authorize ? authorize(user, "update", "task", task) : true

                return (
                  <TableRow key={taskId} className="hover:bg-muted/30 transition-colors">
                    
                    {/* Task Title & Description */}
                    <TableCell className="font-semibold text-xs py-3">
                      <div>
                        <span
                          onClick={() => navigate(`/tasks/${taskId}`)}
                          className="text-foreground font-bold hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {taskTitle}
                        </span>
                        {task.description && (
                          <p className="text-[11px] font-normal text-muted-foreground line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Assigned To */}
                    <TableCell className="text-xs font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-500/10 text-blue-600 font-bold text-[9px] flex items-center justify-center shrink-0 border border-blue-500/20">
                          {assignedName.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{assignedName}</span>
                      </div>
                    </TableCell>

                    {/* Priority Badge */}
                    <TableCell>
                      <PriorityBadge priority={priorityVal} />
                    </TableCell>

                    {/* Inline Status Dropdown */}
                    <TableCell>
                      <select
                        disabled={!canEdit}
                        title={!canEdit ? "Read-only: Only task assignee or project owner can change status" : ""}
                        value={
                          statusVal.toLowerCase().includes("done") || statusVal.toLowerCase().includes("completed")
                            ? "Done"
                            : statusVal.toLowerCase().includes("progress")
                            ? "In Progress"
                            : "To Do"
                        }
                        onChange={(e) => canEdit && onUpdateTaskStatus(taskId, e.target.value)}
                        className={`h-7 text-[11px] font-semibold rounded-lg border border-border/70 bg-muted/20 px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors ${
                          !canEdit ? "opacity-60 cursor-not-allowed bg-muted/40" : "cursor-pointer hover:bg-card"
                        }`}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </TableCell>

                    {/* Due Date */}
                    <TableCell className="text-muted-foreground text-xs font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" /> {dueDateStr}
                      </span>
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <PermissionButton
                          action="read"
                          resource="task"
                          resourceData={task}
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/tasks/${taskId}`)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </PermissionButton>
                        <PermissionButton
                          action="update"
                          resource="task"
                          resourceData={task}
                          variant="ghost"
                          size="icon"
                          onClick={() => setTaskToEdit(task)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                          title="Edit Task"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </PermissionButton>
                        <PermissionButton
                          action="delete"
                          resource="task"
                          resourceData={task}
                          variant="ghost"
                          size="icon"
                          onClick={() => setTaskToDelete(task)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </PermissionButton>
                      </div>
                    </TableCell>

                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls Footer */}
          <div className="px-4 py-3 border-t border-border/50 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{startIndex + 1}</strong> to{" "}
                <strong className="text-foreground">{Math.min(startIndex + pageSize, filteredTasks.length)}</strong> of{" "}
                <strong className="text-foreground">{filteredTasks.length}</strong> tasks
              </span>

              {/* Rows per page selector */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="h-7 text-xs rounded-lg border border-border/70 bg-card px-2 text-foreground focus:outline-none cursor-pointer ml-2"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="h-8 px-3 font-poppins text-xs font-semibold rounded-lg cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
              </Button>

              <span className="text-xs font-medium text-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="h-8 px-3 font-poppins text-xs font-semibold rounded-lg cursor-pointer"
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          icon={FolderPlus}
          heading="No Tasks Found"
          description="This project doesn't have any tasks matching your filters yet."
          actionComponent={
            <PermissionButton
              action="create"
              resource="task"
              onClick={onCreateTask}
              size="sm"
              className="gap-1.5 font-semibold shadow-xs px-5 rounded-xl bg-blue-600 text-white cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" /> Create Task
            </PermissionButton>
          }
        />
      )}

      {/* Edit Task Modal */}
      <EditTaskModal
        open={!!taskToEdit}
        onOpenChange={(open) => !open && setTaskToEdit(null)}
        task={taskToEdit}
        onSaveTask={async (updated) => {
          setTaskToEdit(null)
          if (onUpdateTaskStatus) {
            await onUpdateTaskStatus(updated.id || updated.task_id, updated.status || updated.status_name)
          }
        }}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Delete Task?"
        description={
          taskToDelete
            ? `Are you sure you want to delete "${taskToDelete.name || taskToDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Task"
        cancelText="Cancel"
        onConfirm={() => {
          if (taskToDelete) {
            onDeleteTask(taskToDelete.id || taskToDelete.task_id)
            setTaskToDelete(null)
          }
        }}
      />
    </div>
  )
}

export default TaskTable
