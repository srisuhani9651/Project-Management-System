import React from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Folder,
  LogOut,
  Kanban,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings,
  User,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

/**
 * Modern Collapsible & Closable Sidebar Component
 * Sleek enterprise design featuring:
 * - Glassmorphism card backdrop with subtle border lighting
 * - Active glowing indicator pills & hover micro-interactions
 * - Responsive desktop collapse/expand toggle button
 * - Mobile full slide-out drawer with backdrop close trigger
 */
export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, projects, logoutUser } = useProject()

  const userName = user?.fullName || "Aditya Kumar"
  const userInitials = userName.split(" ").map((n) => n[0]).join("")

  // Navigation Items
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", badge: "Live" },
    { label: "Projects", icon: Folder, path: "/projects", badge: projects.length ? `${projects.length}` : null },
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-card/95 backdrop-blur-md border-r border-border/80 shadow-xl transition-all duration-300 flex flex-col justify-between ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Top Section: Brand Header & Navigation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
          
          {/* Brand Header Logo & Close/Collapse Trigger */}
          <div className="h-20 flex items-center justify-between px-4 border-b border-border/60 shrink-0">
            <NavLink to="/dashboard" className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 shrink-0 group hover:scale-105 transition-transform">
                <Kanban className="h-5 w-5 stroke-[2.5]" />
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-base font-black tracking-tight text-foreground leading-none flex items-center gap-1.5">
                    Project<span className="text-blue-600">Flow</span>
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground mt-1 tracking-wider uppercase flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 text-blue-500" /> Workspace
                  </span>
                </div>
              )}
            </NavLink>

            {/* Desktop Quick Collapse Trigger */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/50 cursor-pointer"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4.5 w-4.5" /> : <PanelLeftClose className="h-4.5 w-4.5" />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground md:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <nav className="space-y-2 px-3 py-5 flex-1">
            {!collapsed && (
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/70 px-3 block mb-2">
                Main Menu
              </span>
            )}

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
                  className={`group relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : ""}`} />
                  
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "bg-blue-500/10 text-blue-600"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Active Indicator Bar when Collapsed */}
                  {collapsed && isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600" />
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* "+ Create Project" Action Button */}
          <div className="px-3 py-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose()
                navigate("/projects/create")
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
                collapsed ? "px-0" : "px-4"
              }`}
              title="Create New Project"
            >
              <Plus className="h-4.5 w-4.5 stroke-[3]" />
              {!collapsed && <span>New Project</span>}
            </button>
          </div>

        </div>

        {/* Bottom User Card & Utilities */}
        <div className="p-3 border-t border-border/60 space-y-2 shrink-0 bg-muted/20">
          
          {/* User Profile Mini Pill */}
          <div
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-3 p-2 rounded-2xl hover:bg-card border border-transparent hover:border-border/60 transition-all cursor-pointer group ${
              collapsed ? "justify-center p-1" : ""
            }`}
            title={collapsed ? userName : "View Profile"}
          >
            <Avatar className="h-9 w-9 border border-blue-500/30 shadow-xs shrink-0">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> Admin
                </p>
              </div>
            )}
          </div>

          {/* Logout & Collapse Controls */}
          <div className={`flex items-center gap-1.5 ${collapsed ? "flex-col" : ""}`}>
            <button
              type="button"
              onClick={handleLogout}
              className={`flex-1 flex items-center justify-center gap-2.5 p-2.5 rounded-xl font-bold text-xs text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer w-full ${
                collapsed ? "px-0" : ""
              }`}
              title="Logout"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>

        </div>
      </aside>
    </>
  )
}

export default Sidebar
