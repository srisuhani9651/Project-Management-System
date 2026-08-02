import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Trash2, Edit3, Eye, FolderPlus, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
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

/**
 * TaskTable Component
 * Tabular task view with search filtering, status & priority dropdown filters,
 * inline status migration, and PBAC permission action controls.
 */
export function TaskTable({ tasks = [], onDeleteTask, onUpdateTaskStatus, onCreateTask }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [taskToEdit, setTaskToEdit] = useState(null)

  // Filter tasks based on search string, status, and priority selections
  const filteredTasks = tasks.filter((task) => {
    const titleMatch = (task.name || task.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    
    const taskStatus = (task.status || "").toLowerCase()
    let matchesStatus = true
    if (statusFilter === "To Do") matchesStatus = taskStatus === "to do" || taskStatus === "todo"
    if (statusFilter === "In Progress") matchesStatus = taskStatus === "in progress"
    if (statusFilter === "Done") matchesStatus = taskStatus === "done" || taskStatus === "completed"

    const taskPriority = (task.priority || "").toLowerCase()
    let matchesPriority = true
    if (priorityFilter !== "All") matchesPriority = taskPriority === priorityFilter.toLowerCase()

    return titleMatch && matchesStatus && matchesPriority
  })

  return (
    <div className="pt-2 space-y-4 animate-fade-in">
      
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-lg"
            />
          </div>

          {/* Status Select Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-card px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted/50 transition-colors"
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
            className="h-9 rounded-lg border border-input bg-card px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted/50 transition-colors"
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
          className="gap-1.5 font-semibold text-xs rounded-lg shadow-xs hover:shadow-md transition-all shrink-0"
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
                <TableHead className="text-xs font-bold">Task Title</TableHead>
                <TableHead className="text-xs font-bold">Priority</TableHead>
                <TableHead className="text-xs font-bold">Status</TableHead>
                <TableHead className="text-xs font-bold">Due Date</TableHead>
                <TableHead className="text-xs font-bold text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                  
                  {/* Task Name & Snippet */}
                  <TableCell className="font-semibold text-xs py-3">
                    <div>
                      <span
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="text-foreground font-bold hover:text-primary transition-colors cursor-pointer"
                      >
                        {task.name || task.title}
                      </span>
                      {task.description && (
                        <p className="text-[11px] font-normal text-muted-foreground line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Priority Badge */}
                  <TableCell>
                    <PriorityBadge priority={task.priority} />
                  </TableCell>

                  {/* Inline Status Dropdown */}
                  <TableCell>
                    <select
                      value={
                        (task.status || "").toLowerCase().includes("done")
                          ? "Done"
                          : (task.status || "").toLowerCase().includes("progress")
                          ? "In Progress"
                          : "To Do"
                      }
                      onChange={(e) => onUpdateTaskStatus(task.id, e.target.value)}
                      className="h-7 text-[11px] font-semibold rounded-md border border-input bg-muted/30 px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted/60 transition-colors"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </TableCell>

                  {/* Due Date */}
                  <TableCell className="text-muted-foreground text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> {task.dueDate || "No date set"}
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
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
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
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
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
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete Task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </PermissionButton>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              className="gap-1.5 font-semibold shadow-xs px-5 rounded-lg"
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
        onSaveTask={(updated) => {
          onUpdateTaskStatus(updated.id, updated.status)
          setTaskToEdit(null)
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
            onDeleteTask(taskToDelete.id)
            setTaskToDelete(null)
          }
        }}
      />
    </div>
  )
}

export default TaskTable
