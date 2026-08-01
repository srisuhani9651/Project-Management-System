import React from "react"
import { Button } from "@/components/ui/button"
import { useProject } from "@/context/ProjectContext"

/**
 * PermissionButton - PBAC (Policy-Based Access Control) aware button wrapper.
 * Prepared for centralized backend authorization: authorize(user, action, resource).
 */
export function PermissionButton({
  action,              // e.g. "update", "delete", "create", "complete"
  resource,            // e.g. "project", "task"
  resourceData,        // target resource object
  fallback = null,     // element to render if permission denied
  hideIfDenied = false,// if true, hides button when unauthorized
  children,
  onClick,
  ...props
}) {
  const { user, authorize } = useProject()

  // Centralized PBAC check: authorize(user, action, resource, resourceData)
  const isAllowed = authorize ? authorize(user, action, resource, resourceData) : true

  if (!isAllowed) {
    if (hideIfDenied) return fallback
    return (
      <Button
        {...props}
        disabled
        title="You do not have permission to perform this action"
        className={`${props.className || ""} opacity-50 cursor-not-allowed`}
      >
        {children}
      </Button>
    )
  }

  return (
    <Button {...props} onClick={onClick}>
      {children}
    </Button>
  )
}

export default PermissionButton
