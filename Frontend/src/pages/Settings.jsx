import React, { useState, useEffect } from "react"
import {
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  Bell,
  ShieldCheck,
  Save,
  Sparkles
} from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

/**
 * Modern Settings Page Component
 * Allows authenticated user to:
 * - Set preferred display username ("What should we call you?")
 * - Update full name
 * - Authenticated password reset (with current password verification & strength checks)
 * - Save preferences via PUT /auth/settings API
 */
export function Settings() {
  const { user, loginUser } = useProject()

  const [formData, setFormData] = useState({
    username: user?.username || "",
    full_name: user?.fullName || user?.full_name || "",
    email: user?.email || "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  // Prefetch profile data from authenticated GET /auth/me API
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await api.get("/auth/me")
        const data = res.data || {}
        setFormData((prev) => ({
          ...prev,
          username: data.username || prev.username,
          full_name: data.full_name || prev.full_name,
          email: data.email || prev.email,
        }))
      } catch (err) {
        console.warn("Could not fetch user profile from GET /auth/me:", err)
      }
    }
    fetchUserProfile()
  }, [])

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [compactLayout, setCompactLayout] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Password Strength Validators
  const passwordReqs = {
    length: formData.new_password.length >= 8,
    uppercase: /[A-Z]/.test(formData.new_password),
    lowercase: /[a-z]/.test(formData.new_password),
    number: /[0-9]/.test(formData.new_password),
    special: /[!@#$%^&*]/.test(formData.new_password),
  }

  const isPasswordValid =
    !formData.new_password ||
    (passwordReqs.length &&
      passwordReqs.uppercase &&
      passwordReqs.lowercase &&
      passwordReqs.number &&
      passwordReqs.special)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errorMsg) setErrorMsg("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    // Password reset validations
    if (formData.new_password) {
      if (!formData.current_password) {
        setErrorMsg("Please enter your current password to reset password.")
        return
      }
      if (!isPasswordValid) {
        setErrorMsg("New password must satisfy all strength criteria.")
        return
      }
      if (formData.new_password !== formData.confirm_password) {
        setErrorMsg("New password and confirmation password do not match.")
        return
      }
    }

    setIsLoading(true)

    try {
      const payload = {
        full_name: formData.full_name.trim() || undefined,
        username: formData.username.trim() || undefined,
        current_password: formData.current_password || undefined,
        new_password: formData.new_password || undefined,
      }

      // Authenticated API request PUT /auth/settings
      const res = await api.put("/auth/settings", payload)
      const updatedUser = res.data?.user || {}

      if (loginUser) {
        loginUser({
          ...user,
          full_name: updatedUser.full_name || formData.full_name,
          fullName: updatedUser.full_name || formData.full_name,
          username: updatedUser.username || formData.username,
        })
      }

      setSuccessMsg("Settings and password updated successfully!")
      setFormData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }))
    } catch (err) {
      console.error("Error updating user settings via PUT /auth/settings:", err)
      const msg =
        err.response?.data?.detail
          ? typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : Array.isArray(err.response.data.detail)
            ? err.response.data.detail[0]?.msg || "Failed to update settings"
            : "Failed to update settings"
          : "Unable to connect to backend service."
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6 animate-fade-in font-roboto">
      
      {/* Page Title & Subtitle */}
      <div className="space-y-1 border-b border-border/50 pb-4">
        <h1 className="font-poppins text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Account & Workspace Settings
        </h1>
        <p className="font-roboto text-xs sm:text-sm text-muted-foreground">
          Configure your preferred display username, security credentials, and workspace preferences.
        </p>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: USER IDENTITY ("What should we call you?") */}
        <Card className="border border-border/80 bg-card rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/50">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-poppins text-sm font-semibold text-foreground">User Identity & Profile</h2>
              <p className="font-roboto text-xs text-muted-foreground">Set how your identity appears across workspace dashboards.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Preferred Display Username ("What should we call you?") */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="username" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>What should we call you?</span>
                  <span className="text-[10px] text-blue-600 font-normal bg-blue-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Preferred Username
                  </span>
                </Label>
                <div className="group relative flex items-center">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                  <div className="absolute right-0 top-6 hidden group-hover:block w-64 p-2 rounded-xl bg-popover text-popover-foreground border border-border shadow-lg text-[11px] z-50">
                    This preferred username is how you'll be greeted and addressed across team dashboards.
                  </div>
                </div>
              </div>

              <Input
                id="username"
                name="username"
                type="text"
                placeholder="e.g. aditya_k or Adi"
                disabled={isLoading}
                value={formData.username}
                onChange={handleChange}
                className="h-10 text-xs rounded-xl bg-muted/20 border-border/70 focus-visible:ring-2 focus-visible:ring-blue-500/20"
              />
              <p className="text-[11px] text-muted-foreground font-normal">
                Your preferred display handle across workspace comments, dashboards, and tasks.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-xs font-semibold text-foreground">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Aditya Kumar"
                disabled={isLoading}
                value={formData.full_name}
                onChange={handleChange}
                className="h-10 text-xs rounded-xl bg-muted/20 border-border/70 focus-visible:ring-2 focus-visible:ring-blue-500/20"
              />
            </div>

            {/* Email Address (Read-Only) */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email Address <span className="text-muted-foreground font-normal">(Read-only)</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                readOnly
                disabled
                value={formData.email}
                className="h-10 text-xs rounded-xl bg-muted/50 cursor-not-allowed opacity-80 border-border/60"
              />
            </div>

          </div>
        </Card>

        {/* SECTION 2: PASSWORD & SECURITY (AUTHENTICATED PASSWORD RESET) */}
        <Card className="border border-border/80 bg-card rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/50">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-poppins text-sm font-semibold text-foreground">Password & Security</h2>
              <p className="font-roboto text-xs text-muted-foreground">Reset your password using your current password credentials.</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Current Password */}
            <div className="space-y-1.5">
              <Label htmlFor="current_password" className="text-xs font-semibold text-foreground">
                Current Password <span className="text-muted-foreground font-normal">(Required only if changing password)</span>
              </Label>
              <div className="relative">
                <Input
                  id="current_password"
                  name="current_password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  disabled={isLoading}
                  value={formData.current_password}
                  onChange={handleChange}
                  className="h-10 text-xs rounded-xl bg-muted/20 border-border/70 pr-10 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="new_password" className="text-xs font-semibold text-foreground">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    name="new_password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    disabled={isLoading}
                    value={formData.new_password}
                    onChange={handleChange}
                    className="h-10 text-xs rounded-xl bg-muted/20 border-border/70 pr-10 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password" className="text-xs font-semibold text-foreground">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Re-enter new password"
                  disabled={isLoading}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="h-10 text-xs rounded-xl bg-muted/20 border-border/70 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Real-Time Password Criteria Indicator */}
            {formData.new_password && (
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-1.5 animate-fade-in">
                <p className="font-poppins font-semibold text-foreground text-[11px]">Password Requirements:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <span className={`flex items-center gap-1 font-medium ${passwordReqs.length ? "text-emerald-600" : "text-muted-foreground"}`}>
                    <CheckCircle2 className="h-3 w-3" /> Min 8 characters
                  </span>
                  <span className={`flex items-center gap-1 font-medium ${passwordReqs.uppercase ? "text-emerald-600" : "text-muted-foreground"}`}>
                    <CheckCircle2 className="h-3 w-3" /> Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1 font-medium ${passwordReqs.lowercase ? "text-emerald-600" : "text-muted-foreground"}`}>
                    <CheckCircle2 className="h-3 w-3" /> Lowercase (a-z)
                  </span>
                  <span className={`flex items-center gap-1 font-medium ${passwordReqs.number ? "text-emerald-600" : "text-muted-foreground"}`}>
                    <CheckCircle2 className="h-3 w-3" /> Digit (0-9)
                  </span>
                  <span className={`flex items-center gap-1 font-medium ${passwordReqs.special ? "text-emerald-600" : "text-muted-foreground"}`}>
                    <CheckCircle2 className="h-3 w-3" /> Special (!@#$)
                  </span>
                </div>
              </div>
            )}

          </div>
        </Card>
       
        {/* Submit Action Footer */}
        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto h-10 px-8 font-poppins font-semibold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Settings...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Settings
              </>
            )}
          </Button>
        </div>

      </form>

    </div>
  )
}

export default Settings
