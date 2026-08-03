import React, { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { X, UserPlus, Users, Check, Search, Loader2, Trash2, Crown } from "lucide-react"
import api from "@/services/api"
import { useProject } from "@/context/ProjectContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

/**
 * AddMemberModal (Manage Members)
 * Shows current project members (with owner badge) and lets the project
 * owner remove existing members, plus a searchable multi-select to add new ones.
 * Uses GET/DELETE /api/members/{project_id|project_member_id} and POST /api/members.
 */
export function AddMemberModal({ open, onOpenChange, projectId, project, onMembersAdded }) {
  const { user } = useProject()
  const currentUserId = String(user?.id || user?.user_id || "")
  const ownerId = project ? String(project.created_by || "") : ""
  const isOwner = Boolean(ownerId) && ownerId === currentUserId

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadMembers = useCallback(() => {
    if (!projectId) return
    setMembersLoading(true)
    api
      .get(`/api/members/${projectId}`)
      .then((res) => setMembers(res.data || []))
      .catch(() => setError((prev) => prev || "Failed to load project members."))
      .finally(() => setMembersLoading(false))
  }, [projectId])

  const loadAvailableUsers = useCallback(() => {
    setLoading(true)
    const params = { exclude_project_members: true }
    if (projectId) params.project_id = projectId

    api
      .get("/api/members/users", { params })
      .then((res) => setUsers(res.data || []))
      .catch(() => setError((prev) => prev || "Failed to load available users."))
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    if (!open) return
    setSelected([])
    setSearch("")
    setError("")
    setSuccess("")
    setConfirmRemoveId(null)
    loadMembers()
    loadAvailableUsers()
  }, [open, loadMembers, loadAvailableUsers])

  if (!open) return null

  const filtered = users.filter((u) =>
    u.label.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (uid) =>
    setSelected((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    )

  const handleSubmit = async () => {
    if (!selected.length) return setError("Please select at least one member.")
    setSubmitting(true)
    setError("")
    setSuccess("")
    try {
      const res = await api.post("/api/members", {
        project_id: projectId,
        user_ids: selected,
      })
      const { added, skipped } = res.data
      setSuccess(`${added} member(s) added${skipped ? `, ${skipped} duplicate(s) skipped` : ""}.`)
      setSelected([])
      loadMembers()
      loadAvailableUsers()
      if (onMembersAdded) {
        onMembersAdded(res.data)
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add members.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (member) => {
    setRemovingId(member.project_member_id)
    setError("")
    setSuccess("")
    try {
      await api.delete(`/api/members/${member.project_member_id}`)
      setMembers((prev) => prev.filter((m) => m.project_member_id !== member.project_member_id))
      setSuccess(`${member.full_name} removed from the project.`)
      loadAvailableUsers()
      if (onMembersAdded) {
        onMembersAdded()
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to remove member.")
    } finally {
      setRemovingId(null)
      setConfirmRemoveId(null)
    }
  }

  const initials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "?"

  const avatarColors = [
    "bg-blue-600",
    "bg-indigo-600",
    "bg-violet-600",
    "bg-emerald-600",
    "bg-rose-600",
    "bg-amber-600",
  ]

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
    >
      <Card className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <CardHeader className="shrink-0 flex flex-row items-center justify-between pb-3 border-b border-border/50">
          <CardTitle className="font-poppins text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Manage Members
          </CardTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* Current Members */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Current Members
              </p>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {members.length}
              </span>
            </div>

            {membersLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No members yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {members.map((m, idx) => {
                  const isMemberOwner = ownerId && String(m.user_id) === ownerId
                  const isConfirming = confirmRemoveId === m.project_member_id
                  const isRemoving = removingId === m.project_member_id

                  return (
                    <div
                      key={m.project_member_id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-border/50 bg-muted/20"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${avatarColors[idx % avatarColors.length]}`}
                        >
                          {initials(m.full_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{m.full_name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isMemberOwner ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <Crown className="h-2.5 w-2.5" /> Owner
                          </span>
                        ) : isOwner ? (
                          isConfirming ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={isRemoving}
                                onClick={() => handleRemove(m)}
                                className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer disabled:opacity-50"
                              >
                                {isRemoving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
                              </button>
                              <button
                                type="button"
                                disabled={isRemoving}
                                onClick={() => setConfirmRemoveId(null)}
                                className="px-2 py-1 rounded-md text-[10px] font-semibold border border-border/60 hover:bg-muted text-foreground transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              title="Remove member"
                              onClick={() => setConfirmRemoveId(m.project_member_id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )
                        ) : (
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                            Member
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Add New Members */}
          <div className="space-y-2 pt-3 border-t border-border/40">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Add New Members
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border border-border/60 bg-muted/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Selected Count */}
            {selected.length > 0 && (
              <p className="text-[11px] font-semibold text-blue-600">
                {selected.length} user{selected.length > 1 ? "s" : ""} selected
              </p>
            )}

            {/* User List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No users found.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {filtered.map((u) => {
                  const isSelected = selected.includes(u.value)
                  return (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => toggle(u.value)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-500/10 border-blue-500/40 text-blue-700 font-semibold"
                          : "bg-muted/30 border-border/50 text-foreground hover:bg-muted hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected ? "bg-blue-600 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                        }`}>
                          {u.label.charAt(0).toUpperCase()}
                        </span>
                        {u.label}
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Error / Success */}
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          {success && <p className="text-xs text-emerald-600 font-medium">{success}</p>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !selected.length}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {submitting ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Adding...</>
              ) : (
                <><UserPlus className="h-3.5 w-3.5" /> Add {selected.length > 0 ? `(${selected.length})` : "Members"}</>
              )}
            </button>
          </div>

        </CardContent>
      </Card>
    </div>,
    document.body
  )
}

export default AddMemberModal
