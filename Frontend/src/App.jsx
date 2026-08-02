import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ProjectProvider, useProject } from "@/context/ProjectContext"
import ScrollToTop from "@/components/ScrollToTop"
import Navbar from "@/components/Navbar"
import { AppLayout } from "@/components/layout/AppLayout"
import Home from "@/pages/Home"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Dashboard from "@/pages/Dashboard"
import CreateProject from "@/pages/CreateProject"
import ProjectDetails from "@/pages/ProjectDetails"
import Projects from "@/pages/Projects"
import TaskDetails from "@/pages/TaskDetails"
import Profile from "@/pages/Profile"

/** Redirects unauthenticated users to /login */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("pf_token")
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function AppContent() {
  const { user } = useProject()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <Routes>
        {/* Public Unauthenticated Routes */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <main className="flex-1 flex flex-col">
                <Home />
              </main>
              {!user && (
                <footer className="border-t border-border/40 py-6 bg-background text-center text-xs text-muted-foreground">
                  <div className="container max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>© {new Date().getFullYear()} ProjectFlow Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                      <a href="#privacy" className="hover:underline">Privacy Policy</a>
                      <a href="#terms" className="hover:underline">Terms of Service</a>
                      <a href="#support" className="hover:underline">Contact Support</a>
                    </div>
                  </div>
                </footer>
              )}
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <main className="flex-1 flex flex-col">
                <Login />
              </main>
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <Navbar />
              <main className="flex-1 flex flex-col">
                <Signup />
              </main>
            </>
          }
        />

        {/* Authenticated Workspace Routes (Wrapped with AppLayout & Left Sidebar) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <AppLayout><Projects /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-project"
          element={
            <ProtectedRoute>
              <AppLayout><CreateProject /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/create"
          element={
            <ProtectedRoute>
              <AppLayout><CreateProject /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <AppLayout><ProjectDetails /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:taskId"
          element={
            <ProtectedRoute>
              <AppLayout><TaskDetails /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout><Profile /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div className="flex-1 py-12 px-8 max-w-4xl mx-auto space-y-4">
                  <h1 className="text-2xl font-bold">Workspace Settings</h1>
                  <p className="text-xs text-muted-foreground">Manage project defaults, notification preferences, and team permissions.</p>
                </div>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

    </div>
  )
}

export function App() {
  return (
    <ProjectProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </ProjectProvider>
  )
}

export default App
