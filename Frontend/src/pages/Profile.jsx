import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Shield, Calendar, Edit3, Check, X, Bell, HelpCircle } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"

/**
 * Profile Page Component
 * Recreates the exact User Profile layout from the reference screenshot:
 * 1. Top breadcrumb "< Back to Dashboard" and header profile bar.
 * 2. Large centered circular initials avatar (AK badge - NO image upload per prompt).
 * 3. User Name (Aditya Kumar), Role (Project Manager), and Email.
 * 4. Workspace Role card & Member Since card.
 * 5. "Edit Profile" solid blue button.
 * (Note: Privacy, Connected Apps, & Activity Logs removed as requested).
 */
export function Profile() {
  const navigate = useNavigate()
  const { user, loginUser } = useProject()

  // Local user state initialized with context or default
  const profileUser = user || {
    fullName: "Aditya Kumar",
    email: "aditya.kumar@gmail.com",
    role: "Project Manager",
    joinDate: "August 2026",
  }

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profileUser.fullName || "Aditya Kumar",
    email: profileUser.email || "aditya.kumar@gmail.com",
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
    if (!name) return "AK"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6 animate-fade-in">
      
      {/* 1. Top Header Bar: Back Breadcrumb & Header Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </button>

        {/* Right Header Icons */}
        <div className="flex items-center justify-end gap-3">
          <NotificationDropdown />

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="h-9 w-9 rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shadow-xs"
            title="Settings"
          >
            <HelpCircle className="h-4.5 w-4.5" />
          </button>

          <div className="flex items-center gap-2 pl-2">
            <Avatar className="h-9 w-9 border border-blue-500/20 shadow-xs">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                {getInitials(profileUser.fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline-block text-xs font-bold text-foreground">
              {profileUser.fullName || "Aditya Kumar"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Page Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your personal profile information and workspace settings.
        </p>
      </div>

      {/* Success Alert Banner */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4" /> Profile updated successfully!
        </div>
      )}

      {/* 3. Centered User Profile Main Card */}
      <Card className="border border-border/80 bg-card shadow-sm rounded-3xl overflow-hidden">
        {/* Soft Banner Gradient Background */}
        <div className="h-36 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent border-b border-border/40" />

        <CardContent className="pt-0 relative px-6 pb-10 text-center space-y-6">
          
          {/* Centered Large Circular Initials Avatar (AK - NO Image Upload) */}
          <div className="flex justify-center -mt-20">
            <div className="h-32 w-32 rounded-full bg-blue-600 text-white font-black text-4xl flex items-center justify-center border-4 border-card shadow-2xl tracking-wider">
              {getInitials(profileUser.fullName)}
            </div>
          </div>

          {/* User Name & Details */}
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              {profileUser.fullName || "Aditya Kumar"}
            </h2>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {profileUser.role || "Project Manager"}
            </p>
            <p className="text-xs font-medium text-muted-foreground pt-0.5">
              {profileUser.email || "aditya.kumar@gmail.com"}
            </p>
          </div>

          <div className="w-full max-w-2xl mx-auto border-t border-border/60" />

          {/* 2 Metadata Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-1">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-blue-600" /> WORKSPACE ROLE
              </span>
              <p className="text-sm font-black text-foreground pt-0.5">
                {profileUser.role || "Project Manager"}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-1">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" /> MEMBER SINCE
              </span>
              <p className="text-sm font-black text-foreground pt-0.5">
                {profileUser.joinDate || "August 2026"}
              </p>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="gap-2 font-bold text-xs h-11 px-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md cursor-pointer"
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
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1"
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
                  <Label htmlFor="fullName" className="font-bold">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                {/* Email (Read-Only) */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-bold">Email Address (Read-only)</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="h-10 text-xs rounded-xl bg-muted/50 cursor-not-allowed opacity-80"
                  />
                </div>

                {/* Role / Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="font-bold">Workspace Role / Title</Label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g. Project Manager, Lead Engineer"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditOpen(false)}
                    className="w-1/2 h-10 rounded-xl font-bold"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="w-1/2 h-10 rounded-xl font-bold bg-blue-600 text-white shadow-xs">
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
