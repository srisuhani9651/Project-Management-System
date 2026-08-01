import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Kanban, LayoutDashboard, LogOut, User } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const navigate = useNavigate()
  const { user, logoutUser } = useProject()

  const handleLogout = () => {
    logoutUser()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo & Brand */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Kanban className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Project<span className="text-primary">Flow</span>
          </span>
        </Link>

        {/* Right side: Authenticated user controls */}
        {user && (
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 font-medium">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-border/60">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-foreground">
                {user.fullName}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Log Out"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
