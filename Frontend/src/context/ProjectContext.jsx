import React, { createContext, useContext, useState, useEffect } from "react"

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
    const fullUserData = {
      id: userData.id || `usr-${Date.now()}`,
      fullName: userData.fullName,
      email: userData.email,
    }
    setUser(fullUserData)
  }

  const logoutUser = () => {
    setUser(null)
  }

  const addProject = (projectData) => {
    const newProject = {
      id: `proj-${Date.now()}`,
      key: projectData.key || projectData.name.substring(0, 3).toUpperCase(),
      name: projectData.name,
      description: projectData.description || "No description provided.",
      category: projectData.category || "Software Development",
      ownerId: user?.id || "usr-current",
      members: [user?.id || "usr-current"],
      status: "Active",
      totalTasks: projectData.totalTasks || 0,
      completedTasks: projectData.completedTasks || 0,
      pendingTasks: projectData.pendingTasks || 0,
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
