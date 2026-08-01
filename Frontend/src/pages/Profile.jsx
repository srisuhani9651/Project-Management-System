import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Shield, Calendar, Edit3, Check, X } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Profile() {
  const navigate = useNavigate()
  const { user, loginUser } = useProject()

  // Local user state from context or fallback mock
  const profileUser = user || {
    fullName: "Suhani Srivastava",
    email: "suhani@projectflow.com",
    role: "Project Manager",
    joinDate: "August 2026",
  }

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profileUser.fullName || "Suhani Srivastava",
    email: profileUser.email || "suhani@projectflow.com",
    role: profileUser.role || "Project Manager",
  })
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (loginUser) {
      loginUser({
        ...user,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
      })
    }
    setIsEditOpen(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const getInitials = (name) => {
    if (!name) return "S"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="space-y-4 border-b border-border/60 pb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            User Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your personal profile information and workspace settings.
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4" /> Profile updated successfully!
        </div>
      )}

      {/* Centered Profile Card */}
      <Card className="border border-border/80 bg-card shadow-md rounded-2xl max-w-2xl mx-auto overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent" />

        <CardContent className="pt-0 relative px-6 pb-8 text-center space-y-6">
          
          {/* Avatar Overlay */}
          <div className="flex justify-center -mt-16">
            <Avatar className="h-28 w-28 border-4 border-card shadow-xl ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground font-extrabold text-3xl">
                {getInitials(profileUser.fullName)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Basic Info */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              {profileUser.fullName || "Suhani Srivastava"}
            </h2>
            <p className="text-xs font-semibold text-primary">
              {profileUser.role || "Project Manager"}
            </p>
            <p className="text-xs text-muted-foreground">
              {profileUser.email || "suhani@projectflow.com"}
            </p>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4 border-t border-border/50 text-left">
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" /> Workspace Role
              </span>
              <p className="text-xs font-bold text-foreground">
                {profileUser.role || "Project Manager"}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Member Since
              </span>
              <p className="text-xs font-bold text-foreground">
                {profileUser.joinDate || "August 2026"}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="pt-2">
            <Button
              onClick={() => setIsEditOpen(true)}
              className="gap-2 font-semibold shadow-xs px-6"
            >
              <Edit3 className="h-4 w-4" /> Edit Profile
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Edit Profile Modal Dialog */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-md border border-border/80 bg-card shadow-2xl rounded-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-lg font-bold">Edit Profile</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email (Read-Only) */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address (Read-only)</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="bg-muted/50 cursor-not-allowed opacity-80"
                  />
                </div>

                {/* Role / Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role / Title</Label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g. Project Manager, Lead Engineer"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditOpen(false)}
                    className="w-1/2"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="w-1/2 font-semibold shadow-xs">
                    Save Changes
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
