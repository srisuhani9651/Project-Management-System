import React from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Folder,
  LogOut,
  X,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Layers,
  ChevronDown,
  Building2,
  Sliders,
  Bell
} from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

/**
 * Enterprise Redesigned Sidebar Component
 * Sleek, professional, minimalist SaaS side navigation matching top-tier design systems (Linear/Vercel/Stripe).
 * - Primary Font: Roboto (nav labels, subtle body content)
 * - Secondary Font: Poppins (brand logo, section headers, badges, numbers)
 * - Collapsible & Closable drawer with smooth layout transitions.
 */
export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, projects, logoutUser } = useProject()

  const userName = user?.fullName || "Workspace Member"
  const userInitials = userName.split(" ").map((n) => n[0]).join("")
  const userEmail = user?.email || ""

  // Structured Nav Menu Groups
  const mainNav = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", badge: null },
    { label: "Projects", icon: Folder, path: "/projects", badge: projects.length ? `${projects.length}` : null },
  ]

  const handleLogout = async () => {
    await logoutUser()
    navigate("/")
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs md:hidden transition-opacity duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-card border-r border-border/80 transition-all duration-200 ease-in-out flex flex-col justify-between select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "w-16" : "w-64"}`}
      >
        {/* Top Section: Workspace Header & Navigation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
          
          {/* Workspace Switcher / Brand Header */}
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-border/60 shrink-0">
            <NavLink to="/dashboard" className="flex items-center gap-2.5 min-w-0 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shrink-0 shadow-xs font-poppins font-black text-sm">
                <Layers className="h-4.5 w-4.5 stroke-[2.2]" />
              </div>
              
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-poppins text-sm font-bold tracking-tight text-foreground truncate">
                      ProjectFlow
                    </span>
                    <span className="font-poppins text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                      PRO
                    </span>
                  </div>
                  <span className="font-roboto text-[11px] text-muted-foreground truncate">
                    Enterprise Workspace
                  </span>
                </div>
              )}
            </NavLink>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/40 cursor-pointer"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Action Button: New Project */}
          <div className="px-3 pt-4 pb-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose()
                navigate("/projects/create")
              }}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-poppins font-semibold text-xs transition-all shadow-xs active:scale-[0.98] cursor-pointer ${
                collapsed ? "px-0" : "px-3"
              }`}
              title="Create New Project"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              {!collapsed && <span>New Project</span>}
            </button>
          </div>

          {/* Navigation Items Group */}
          <nav className="space-y-6 px-3 py-3 flex-1">
            
            {/* Main Menu */}
            <div className="space-y-1">
              {!collapsed && (
                <span className="font-poppins text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2.5 block mb-1.5">
                  Overview
                </span>
              )}

              {mainNav.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === "/projects" && location.pathname.startsWith("/projects") && item.label === "Projects")
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={`group relative flex items-center gap-3 px-2.5 py-2 rounded-lg font-roboto text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-500/10 text-blue-600 font-bold border-l-2 border-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground font-normal"
                    } ${collapsed ? "justify-center px-0" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground group-hover:text-foreground"}`} />
                    
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="font-poppins text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground group-hover:bg-card">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                )
              })}
            </div>

            {/* Workspace Utilities */}
            <div className="space-y-1 border-t border-border/40 pt-4">
              {!collapsed && (
                <span className="font-poppins text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2.5 block mb-1.5">
                  Preferences
                </span>
              )}

              <NavLink
                to="/settings"
                onClick={() => onClose && onClose()}
                className={`group flex items-center gap-3 px-2.5 py-2 rounded-lg font-roboto text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all cursor-pointer ${
                  collapsed ? "justify-center px-0" : ""
                }`}
                title={collapsed ? "Settings" : undefined}
              >
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                {!collapsed && <span className="truncate">Settings</span>}
              </NavLink>
            </div>

          </nav>

        </div>

        {/* Bottom Section: Clean User Profile Footer */}
        <div className="p-2.5 border-t border-border/60 shrink-0 bg-muted/20">
          
          <div
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-2.5 p-2 rounded-lg hover:bg-card border border-transparent hover:border-border/60 transition-all cursor-pointer group ${
              collapsed ? "justify-center p-1" : ""
            }`}
            title={collapsed ? userName : "View Profile"}
          >
            <Avatar className="h-8 w-8 border border-border/80 shadow-xs shrink-0">
              <AvatarFallback className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-poppins font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-poppins text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors truncate">
                  {userName}
                </p>
                <p className="font-roboto text-[10px] text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
            )}

            {!collapsed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLogout()
                }}
                className="p-1 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </div>

      </aside>
    </>
  )
}

export default Sidebar
