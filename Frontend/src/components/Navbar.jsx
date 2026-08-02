import React from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Kanban, LayoutDashboard, LogOut, User } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"

/**
 * Navbar Component
 * Modern glassmorphic top navigation bar with brand logo, quick navigation links,
 * and user profile session controls.
 */
export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logoutUser } = useProject()

  const handleLogout = async () => {
    await logoutUser()
    navigate("/")
  }

  const isDashboardActive = location.pathname.startsWith("/dashboard")

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-all shadow-xs">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-2.5 group transition-transform active:scale-95">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20 group-hover:shadow-lg transition-all">
            <Kanban className="h-5 w-5" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Project<span className="text-primary font-black">Flow</span>
          </span>
        </Link>

        {/* User Navigation & Profile Controls */}
        {user && (
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button
                variant={isDashboardActive ? "secondary" : "ghost"}
                size="sm"
                className="gap-2 text-xs font-semibold rounded-lg transition-all"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
              </Button>
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-border/60">
              {/* User Avatar Circle */}
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shadow-xs">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>
              
              <span className="hidden sm:inline-block text-xs font-bold text-foreground">
                {user.fullName || "User"}
              </span>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Log Out"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
