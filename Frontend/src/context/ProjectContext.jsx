import React, { createContext, useContext, useState, useEffect } from "react"
import api from "@/services/api"

const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("pf_user")
    return saved ? JSON.parse(saved) : null
  })

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("pf_projects")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem("pf_user", JSON.stringify(user))
    } else {
      localStorage.removeItem("pf_user")
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem("pf_projects", JSON.stringify(projects))
  }, [projects])

  /**
   * Centralized Policy-Based Access Control (PBAC) authorization function.
   * Prepared for future backend integration: authorize(user, action, resource, resourceData).
   * Note: No RBAC roles (Admin/User). Policy checks will evaluate user attributes & resource permissions.
   */
  const authorize = (currentUser, action, resource, resourceData) => {
    // In mock phase, default to allowed for authenticated user
    if (!currentUser) return false
    return true
  }

  const loginUser = (userData) => {
    const token = userData.token || userData.access_token
    if (token) {
      localStorage.setItem("pf_token", token)
    }
    const fullUserData = {
      id: userData.id || userData.user_id || `usr-${Date.now()}`,
      fullName: userData.fullName || userData.full_name,
      email: userData.email,
      token: token,
    }
    setUser(fullUserData)
  }

  const logoutUser = async () => {
    try {
      await api.post("/logout")
    } catch (err) {
      console.warn("Logout API call warning:", err?.response?.data?.detail || err.message)
    } finally {
      localStorage.removeItem("pf_token")
      localStorage.removeItem("pf_user")
      setUser(null)
    }
  }

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects")
      const formatted = res.data.map((p) => ({
        id: p.project_id,
        key: p.project_name.substring(0, 3).toUpperCase(),
        name: p.project_name,
        description: p.project_description || "No description provided.",
        category: p.category_name || "Development",
        status: p.status_name || "In Progress",
        priority: p.priority_name || "Medium",
        projectType: p.project_type_name || "Team",
        plannedStartDate: p.planned_start_date,
        plannedEndDate: p.planned_end_date,
        estimatedDuration: p.estimated_duration,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        createdAt: p.created_at
          ? new Date(p.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Aug 1, 2026",
      }))
      setProjects(formatted)
    } catch (err) {
      console.warn("Failed to fetch projects from backend:", err)
    }
  }

  useEffect(() => {
    if (user && localStorage.getItem("pf_token")) {
      fetchProjects()
    }
  }, [user])

  const addProject = (projectData) => {
    const newProject = {
      id: projectData.project_id || `proj-${Date.now()}`,
      key: (projectData.name || projectData.project_name || "").substring(0, 3).toUpperCase(),
      name: projectData.name || projectData.project_name,
      description: projectData.description || projectData.project_description || "No description provided.",
      category: projectData.category || projectData.category_name || "Development",
      status: projectData.status || projectData.status_name || "In Progress",
      priority: projectData.priority || projectData.priority_name || "Medium",
      projectType: projectData.projectType || projectData.project_type_name || "Team",
      ownerId: user?.id || "usr-current",
      members: [user?.id || "usr-current"],
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }
    setProjects((prev) => [newProject, ...prev])
  }

  const clearProjects = () => {
    setProjects([])
  }

  return (
    <ProjectContext.Provider
      value={{
        user,
        setUser,
        loginUser,
        logoutUser,
        projects,
        setProjects,
        addProject,
        clearProjects,
        authorize,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  return useContext(ProjectContext)
}
