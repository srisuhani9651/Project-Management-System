import React from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Folder,
  Settings,
  LogOut,
  Kanban,
  X,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logoutUser } = useProject()

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Projects", icon: Folder, path: "/projects" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ]

  const handleLogout = () => {
    logoutUser()
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
        {/* Top Header & Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-border/60">
            <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0">
                <Kanban className="h-5 w-5" />
              </div>
              {!collapsed && (
                <span className="text-lg font-extrabold tracking-tight text-foreground whitespace-nowrap">
                  Project<span className="text-primary">Flow</span>
                </span>
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

          {/* New Project CTA Button inside Sidebar */}
          <div className="p-3">
            <Button
              onClick={() => navigate("/projects/create")}
              size="sm"
              className={`w-full justify-center font-semibold shadow-xs gap-2 ${
                collapsed ? "px-0" : "px-3"
              }`}
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              {!collapsed && <span>Create Project</span>}
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 px-2 py-2">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/projects" && location.pathname.startsWith("/projects"))
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold shadow-xs"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Bottom Actions: Collapse Toggle & Logout */}
        <div className="p-3 border-t border-border/60 space-y-1">
          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
