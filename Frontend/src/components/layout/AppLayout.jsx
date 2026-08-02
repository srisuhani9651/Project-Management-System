import React from "react"
import { Navbar } from "@/components/Navbar"

/**
 * Clean Top-Nav AppLayout Component
 * Completely removes the sidebar menu and uses top navigation header for all routes.
 */
export function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-blue-500/20 selection:text-blue-600 font-roboto">
      {/* Top Header Navigation Bar */}
      <Navbar />

      {/* Main Page Content Area (Full width) */}
      <main className="flex-1 flex flex-col min-w-0 w-full">
        {children}
      </main>
    </div>
  )
}

export default AppLayout
