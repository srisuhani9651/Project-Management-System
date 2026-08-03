import React, { useState, useEffect } from "react"
import { Shield, Calendar, Edit3, Check, X, AlertCircle } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Modern Profile Page Component
 * Displays and edits the authenticated user's real profile via GET/PUT /auth/settings.
 */
export function Profile() {
  const { user, loginUser } = useProject()

  const [profileUser, setProfileUser] = useState(user || {})

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await api.get("/auth/me")
        const data = res.data || {}
        setProfileUser((prev) => ({
          ...prev,
          fullName: data.full_name || prev.fullName,
          email: data.email || prev.email,
          username: data.username || prev.username,
          joinDate: data.created_at
            ? new Date(data.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
            : prev.joinDate,
        }))
      } catch (err) {
        console.warn("Could not fetch user profile from GET /auth/me:", err)
      }
    }
    fetchUserProfile()
  }, [])

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profileUser.fullName || "",
    username: profileUser.username || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [savedSuccess, setSavedSuccess] = useState(false)

  const openEdit = () => {
    setFormData({
      fullName: profileUser.fullName || "",
      username: profileUser.username || "",
    })
    setErrorMsg("")
    setIsEditOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setErrorMsg("")
    setIsLoading(true)

    try {
      const payload = {
        full_name: formData.fullName.trim() || undefined,
        username: formData.username.trim() || undefined,
      }
      const res = await api.put("/auth/settings", payload)
      const updatedUser = res.data?.user || {}

      const nextFullName = updatedUser.full_name || formData.fullName
      const nextUsername = updatedUser.username || formData.username

      setProfileUser((prev) => ({ ...prev, fullName: nextFullName, username: nextUsername }))

      if (loginUser) {
        loginUser({ ...user, fullName: nextFullName, full_name: nextFullName, username: nextUsername })
      }

      setIsEditOpen(false)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      const msg =
        err.response?.data?.detail
          ? typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : Array.isArray(err.response.data.detail)
            ? err.response.data.detail[0]?.msg || "Failed to update profile"
            : "Failed to update profile"
          : "Unable to connect to backend service."
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6 animate-fade-in font-roboto">

      {/* Page Title Header */}
      <div className="space-y-1 border-b border-border/50 pb-4">
        <h1 className="font-poppins text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          User Profile
        </h1>
        <p className="font-roboto text-xs sm:text-sm text-muted-foreground">
          Manage your personal profile details and workspace credentials.
        </p>
      </div>

      {/* Success Alert Banner */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4" /> Profile updated successfully!
        </div>
      )}

      {/* Centered User Profile Main Card */}
      <Card className="border border-border/80 bg-card shadow-sm rounded-3xl overflow-hidden">
        {/* Soft Banner Gradient Background */}
        <div className="h-32 bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-purple-500/10 border-b border-border/40" />

        <CardContent className="pt-0 relative px-6 pb-10 text-center space-y-6">

          {/* Avatar */}
          <div className="flex justify-center -mt-16">
            <div className="h-28 w-28 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-poppins font-bold text-3xl flex items-center justify-center border-4 border-card shadow-xl tracking-wider">
              {getInitials(profileUser.fullName)}
            </div>
          </div>

          {/* User Name & Details */}
          <div className="space-y-1">
            <h2 className="font-poppins text-2xl font-bold tracking-tight text-foreground">
              {profileUser.fullName || "Workspace Member"}
            </h2>
            <p className="font-poppins text-xs font-semibold text-blue-600 uppercase tracking-wider">
              {profileUser.username ? `@${profileUser.username}` : "No username set"}
            </p>
            <p className="font-roboto text-xs font-normal text-muted-foreground">
              {profileUser.email || ""}
            </p>
          </div>

          <div className="w-full max-w-2xl mx-auto border-t border-border/60" />

          {/* 2 Metadata Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-1">
              <span className="font-poppins text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-blue-600" /> USERNAME
              </span>
              <p className="font-poppins text-sm font-semibold text-foreground pt-0.5">
                {profileUser.username || "Not set"}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-1">
              <span className="font-poppins text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" /> MEMBER SINCE
              </span>
              <p className="font-poppins text-sm font-semibold text-foreground pt-0.5">
                {profileUser.joinDate || "Unknown"}
              </p>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={openEdit}
              className="gap-2 font-poppins font-semibold text-xs h-10 px-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              <Edit3 className="h-4 w-4" /> Edit Profile
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Edit Profile Modal Dialog */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
          <Card className="w-full max-w-md border border-border/80 bg-card shadow-2xl rounded-2xl relative">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>

            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="font-poppins text-lg font-bold">Edit Profile</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errorMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="font-semibold">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="font-semibold">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="e.g. aditya_k"
                    disabled={isLoading}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-semibold">Email Address (Read-only)</Label>
                  <Input
                    id="email"
                    name="email"
                    value={profileUser.email || ""}
                    readOnly
                    className="h-10 text-xs rounded-xl bg-muted/50 cursor-not-allowed opacity-80"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditOpen(false)}
                    disabled={isLoading}
                    className="w-1/2 h-10 rounded-xl font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isLoading} className="w-1/2 h-10 rounded-xl font-semibold bg-blue-600 text-white shadow-xs">
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}

export default Profile
