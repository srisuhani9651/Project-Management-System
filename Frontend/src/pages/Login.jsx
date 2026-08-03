import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Kanban, Lock, Mail, AlertCircle, Loader2 } from "lucide-react"
import { useProject } from "@/context/ProjectContext"
import api from "@/services/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal"

export function Login() {
  const navigate = useNavigate()
  const { loginUser } = useProject()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required."
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address."
    }
    if (!formData.password) {
      newErrors.password = "Password is required."
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      })

      const data = response.data

      loginUser({
        id: data.user.user_id,
        fullName: data.user.full_name,
        email: data.user.email,
        access_token: data.access_token,
      })

      navigate("/dashboard")
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail
          ? typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : Array.isArray(err.response.data.detail)
            ? err.response.data.detail[0]?.msg || "Invalid credentials"
            : "Login failed. Please check your credentials."
          : "Unable to connect to server. Please check if backend is running."
      setErrors({ server: errorMsg })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Kanban className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your ProjectFlow account</p>
        </div>

        {/* Auth Card */}
        <Card className="border border-border/80 bg-card shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 text-center pb-4 border-b border-border/40">
            <CardTitle className="text-xl font-bold">Login</CardTitle>
            <CardDescription>Enter your email and password to access your workspace</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {errors.server && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.server}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="username"
                    disabled={isLoading}
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-9 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-9 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button with Loader2 */}
              <Button type="submit" disabled={isLoading} className="w-full font-semibold shadow-md mt-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {/* Footer Navigation Link */}
            <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border/40 pt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        initialEmail={formData.email}
      />
    </div>
  )
}

export default Login
