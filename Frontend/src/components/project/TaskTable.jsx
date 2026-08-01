import React, { useState } from "react"
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
import { StatusBadge } from "@/components/common/StatusBadge"
import { PriorityBadge } from "@/components/common/PriorityBadge"
import { PermissionButton } from "@/components/common/PermissionButton"
import { EmptyState } from "@/components/common/EmptyState"

export function TaskTable({ tasks = [], onDeleteTask, onUpdateTaskStatus, onCreateTask }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [taskToDelete, setTaskToDelete] = useState(null)

  // Filter tasks based on search, status, and priority
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = (task.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    
    const taskStatus = (task.status || "").toLowerCase()
    let matchesStatus = true
    if (statusFilter === "To Do") matchesStatus = taskStatus === "to do" || taskStatus === "todo"
    if (statusFilter === "In Progress") matchesStatus = taskStatus === "in progress"
    if (statusFilter === "Done") matchesStatus = taskStatus === "done" || taskStatus === "completed"

    const taskPriority = (task.priority || "").toLowerCase()
    let matchesPriority = true
    if (priorityFilter !== "All") matchesPriority = taskPriority === priorityFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="pt-2 space-y-4">
      
      {/* Controls Header: Search, Filters, Create Task */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Left: Search & Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="All">Status: All</option>
            <option value="To Do">Status: To Do</option>
            <option value="In Progress">Status: In Progress</option>
            <option value="Done">Status: Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="All">Priority: All</option>
            <option value="High">Priority: High</option>
            <option value="Medium">Priority: Medium</option>
            <option value="Low">Priority: Low</option>
          </select>
        </div>

        {/* Right: Create Task PBAC PermissionButton */}
        <PermissionButton
          action="create"
          resource="task"
          size="sm"
          onClick={onCreateTask}
          className="gap-1.5 font-semibold shrink-0"
        >
          <Plus className="h-4 w-4" /> Create New Task
        </PermissionButton>
      </div>

      {/* Task Table Content or Empty State */}
      {filteredTasks.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                
                {/* Title */}
                <TableCell className="font-bold">
                  <div>
                    <span className="text-foreground hover:text-primary transition-colors cursor-pointer">
                      {task.name}
                    </span>
                    {task.description && (
                      <p className="text-[11px] font-normal text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>

                {/* Status */}
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
                    className="h-7 text-[11px] font-semibold rounded border border-input bg-muted/30 px-2 text-foreground focus:outline-none"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </TableCell>

                {/* Due Date */}
                <TableCell className="text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {task.dueDate || "No due date"}
                  </span>
                </TableCell>

                {/* Actions: View, Edit, Delete using PermissionButton */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <PermissionButton
                      action="read"
                      resource="task"
                      resourceData={task}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
      ) : (
        /* Empty State */
        <EmptyState
          icon={FolderPlus}
          heading="No Tasks Found"
          description="This project doesn't have any tasks yet. Create your first task to get started."
          actionComponent={
            <PermissionButton
              action="create"
              resource="task"
              onClick={onCreateTask}
              size="sm"
              className="gap-1.5 font-semibold shadow-md px-5"
            >
              <Plus className="h-4 w-4" /> Create Task
            </PermissionButton>
          }
        />
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Delete Task?"
        description={
          taskToDelete
            ? `Are you sure you want to delete "${taskToDelete.name}"? This action cannot be undone.`
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
