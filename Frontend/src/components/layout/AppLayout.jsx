import React, { useState } from "react"
import { Menu, PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"

export function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex bg-background text-foreground antialiased selection:bg-blue-500/20 selection:text-blue-600">
      {/* Reusable Modern Left Sidebar */}
      <Sidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Layout Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* Mobile Header Menu Trigger */}
        <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border/60 bg-card sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-extrabold text-sm tracking-tight text-foreground">
            Project<span className="text-blue-600">Flow</span>
          </span>
          <div className="w-5" />
        </div>

        {/* Children Page Content */}
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
