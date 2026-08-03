import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Kanban,
  LayoutDashboard,
  Folder,
  Plus,
  Settings,
  LogOut,
  User,
  Search,
  ChevronDown
} from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

/**
 * Top Navbar Component
 * Minimal navigation header on auth pages (Logo + Auth toggle button).
 * Full feature workspace header when authenticated (Dashboard, Projects, Search, New Project, Profile).
 */
export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logoutUser } = useProject()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const token = localStorage.getItem("pf_token")
  const isAuthenticated = Boolean(user || token)
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup"
  const showWorkspaceNav = isAuthenticated && !isAuthPage

  const userName = user?.fullName || user?.full_name || "Workspace Member"
  const userInitials = userName.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"
  const userEmail = user?.email || ""

  const handleLogout = async () => {
    await logoutUser()
    navigate("/login")
  }

  const isDashboardActive = location.pathname === "/dashboard"
  const isProjectsActive = location.pathname.startsWith("/projects")

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-card/90 backdrop-blur-md shadow-xs font-roboto">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo */}
          <Link to={showWorkspaceNav ? "/dashboard" : "/"} className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs font-poppins font-black text-sm group-hover:scale-105 transition-transform">
              <Kanban className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            <span className="font-poppins text-base font-bold tracking-tight text-foreground">
              Project<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          {/* Workspace Navigation Links (Only visible when authenticated and not on auth pages) */}
          {showWorkspaceNav && (
            <nav className="flex items-center gap-1">
              <Link to="/dashboard">
                <button
                  type="button"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isDashboardActive
                      ? "bg-blue-500/10 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              </Link>

              <Link to="/projects">
                <button
                  type="button"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isProjectsActive
                      ? "bg-blue-500/10 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  <span className="hidden sm:inline">Projects</span>
                </button>
              </Link>
            </nav>
          )}
        </div>

        {/* Center: Search Bar (Only visible in workspace) */}
        {showWorkspaceNav && (
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects, tasks, or metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-9 text-xs rounded-xl bg-muted/40 border-border/70 focus-visible:ring-blue-600 w-full"
              />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {showWorkspaceNav ? (
            <>
              {/* "+ New Project" CTA Button */}
              <button
                type="button"
                onClick={() => navigate("/projects/create")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-poppins font-medium text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">New Project</span>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="h-9 w-9 rounded-lg border border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>

              {/* Profile Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-1 cursor-pointer group"
                >
                  <Avatar className="h-8 w-8 border border-border/80 shadow-xs shrink-0">
                    <AvatarFallback className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-poppins font-bold text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden lg:flex flex-col text-left">
                    <span className="font-poppins text-xs font-semibold text-foreground group-hover:text-blue-600 transition-colors leading-tight">
                      {userName}
                    </span>
                  </div>

                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground hidden sm:block" />
                </button>

                {/* Profile Popup Menu */}
                {profileOpen && (
                  <div
                    onMouseLeave={() => setProfileOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-card border border-border/80 rounded-xl shadow-lg p-2 space-y-1 z-50 animate-fade-in font-roboto"
                  >
                    <div className="px-3 py-2 border-b border-border/60">
                      <p className="font-poppins text-xs font-semibold text-foreground truncate">{userName}</p>
                      {userEmail && <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false)
                        navigate("/profile")
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                      <User className="h-4 w-4 text-blue-600" />
                      <span>View Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false)
                        navigate("/settings")
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Workspace Settings</span>
                    </button>

                    <div className="border-t border-border/60 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Auth Pages / Unauthenticated Header Actions */
            <div className="flex items-center gap-2">
              {location.pathname === "/login" && (
                <Link to="/signup">
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-poppins font-medium text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Sign Up
                  </button>
                </Link>
              )}

              {location.pathname === "/signup" && (
                <Link to="/login">
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg border border-border/70 hover:bg-muted text-foreground font-poppins font-medium text-xs transition-all cursor-pointer"
                  >
                    Log In
                  </button>
                </Link>
              )}

              {location.pathname === "/" && (
                <>
                  <Link to="/login">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg border border-border/70 hover:bg-muted text-foreground font-poppins font-medium text-xs transition-all cursor-pointer"
                    >
                      Log In
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-poppins font-medium text-xs shadow-xs transition-all cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

export default Navbar
