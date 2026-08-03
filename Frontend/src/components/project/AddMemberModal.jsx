import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, UserPlus, Check, Search, Loader2 } from "lucide-react"
import api from "@/services/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

/**
 * AddMemberModal
 * Multi-select dropdown to add members to a project.
 * Uses GET /api/members/users for user list and POST /api/members to submit.
 */
export function AddMemberModal({ open, onOpenChange, projectId, onMembersAdded }) {
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fetch non-member users on open
  useEffect(() => {
    if (!open) return
    setSelected([])
    setSearch("")
    setError("")
    setSuccess("")
    setLoading(true)

    const params = { exclude_project_members: true }
    if (projectId) params.project_id = projectId

    api.get("/api/members/users", { params })
      .then((res) => setUsers(res.data || []))
      .catch(() => setError("Failed to load available users."))
      .finally(() => setLoading(false))
  }, [open, projectId])

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
      if (onMembersAdded) {
        onMembersAdded(res.data)
      }
      setTimeout(() => onOpenChange(false), 1200)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add members.")
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
    >
      <Card className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <CardHeader className="shrink-0 flex flex-row items-center justify-between pb-3 border-b border-border/50">
          <CardTitle className="font-poppins text-sm font-semibold text-foreground flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-600" />
            Add Members to Project
          </CardTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">

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
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
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
                      {/* Avatar initial */}
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
              Cancel
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
