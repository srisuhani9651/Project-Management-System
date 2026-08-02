import React from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  LogOut,
  Kanban,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useProject } from "@/context/ProjectContext"

/**
 * Sidebar Component
 * Streamlined Enterprise Pro sidebar with logo, Dashboard, Projects, Tasks,
 * "+ Create New Project" CTA, and Logout button.
 */
export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logoutUser } = useProject()

  // Navigation Items (Dashboard & Projects only)
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Projects", icon: Folder, path: "/projects" },
  ]

  const handleLogout = async () => {
    await logoutUser()
    navigate("/")
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-card border-r border-border/80 transition-all duration-300 flex flex-col justify-between ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "w-16" : "w-64"}`}
      >
        {/* Top Section: Brand Header & Navigation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          
          {/* Brand Header Logo */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-border/60 shrink-0">
            <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
                <Kanban className="h-5 w-5 stroke-[2.5]" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-base font-extrabold tracking-tight text-foreground leading-none">
                    Project<span className="text-blue-600">Flow</span>
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground mt-0.5 tracking-wider uppercase">
                    Enterprise Pro
                  </span>
                </div>
              )}
            </NavLink>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Navigation Items */}
          <nav className="space-y-1.5 px-3 py-4 flex-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/projects" && location.pathname.startsWith("/projects") && item.label === "Projects")
              const Icon = item.icon
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-xs transition-all ${
                    isActive
                      ? "bg-blue-500/10 text-blue-600 font-bold shadow-xs border border-blue-500/20"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-blue-600" : ""}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              )
            })}
          </nav>

          {/* "+ Create New Project" Sidebar Action Button */}
          {!collapsed && (
            <div className="px-4 py-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose()
                  navigate("/projects/create")
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Create New Project</span>
              </button>
            </div>
          )}

        </div>

        {/* Bottom Utility Menu: Logout & Collapse Toggle */}
        <div className="p-4 border-t border-border/60 space-y-2 shrink-0">
          
          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border/40 mt-1"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
