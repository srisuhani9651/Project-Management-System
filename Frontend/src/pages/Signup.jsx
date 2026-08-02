import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Kanban, Lock, Mail, User, AlertCircle, Check, X, Eye, EyeOff, Loader2 } from "lucide-react"
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

export function Signup() {
  const navigate = useNavigate()
  const { loginUser } = useProject()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Ensure form is completely blank whenever Signup page is opened
  useEffect(() => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
    setErrors({})
  }, [])

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Real-time mandatory password validation rules
  const passwordCriteria = [
    {
      id: "length",
      label: "Minimum 8 characters",
      isMet: formData.password.length >= 8,
    },
    {
      id: "special",
      label: "One special character (!@#$%^&*)",
      isMet: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
    },
    {
      id: "uppercase",
      label: "One uppercase letter (A-Z)",
      isMet: /[A-Z]/.test(formData.password),
    },
    {
      id: "lowercase",
      label: "One lowercase letter (a-z)",
      isMet: /[a-z]/.test(formData.password),
    },
    {
      id: "number",
      label: "One number (0-9)",
      isMet: /[0-9]/.test(formData.password),
    },
  ]

  const isAllPasswordCriteriaMet = passwordCriteria.every((c) => c.isMet)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required."
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required."
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address."
    }
    if (!formData.password) {
      newErrors.password = "Password is required."
    } else if (!isAllPasswordCriteriaMet) {
      newErrors.password = "Password does not meet all security requirements."
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password."
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match."
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
      const response = await api.post("/register", {
        full_name: formData.fullName.trim(),
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
            ? err.response.data.detail[0]?.msg || "Registration failed"
            : "Registration failed. Please try again."
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
          <h1 className="text-2xl font-bold tracking-tight">Get Started with ProjectFlow</h1>
          <p className="text-sm text-muted-foreground">Create your account to manage your projects efficiently</p>
        </div>

        {/* Auth Card */}
        <Card className="border border-border/80 bg-card shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 text-center pb-4 border-b border-border/40">
            <CardTitle className="text-xl font-bold">Sign Up</CardTitle>
            <CardDescription>Enter your details below to create your account</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {errors.server && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.server}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="off"
                    disabled={isLoading}
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`pl-9 ${errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.fullName}
                  </p>
                )}
              </div>

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
                    autoComplete="new-password"
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

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-9 pr-9 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.password}
                  </p>
                )}

                {/* Real-time Password Requirements Live Validation */}
                <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/50 space-y-2 text-xs">
                  <p className="font-semibold text-muted-foreground">Password Requirements:</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {passwordCriteria.map((criterion) => (
                      <div key={criterion.id} className="flex items-center gap-2 transition-colors">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
                          criterion.isMet ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/15 text-destructive"
                        }`}>
                          {criterion.isMet ? (
                            <Check className="h-3 w-3 stroke-[3]" />
                          ) : (
                            <X className="h-3 w-3 stroke-[3]" />
                          )}
                        </div>
                        <span className={`transition-colors ${criterion.isMet ? "text-emerald-600 font-medium" : "text-destructive font-medium"}`}>
                          {criterion.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 pt-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-9 pr-9 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button with Loader2 */}
              <Button type="submit" disabled={isLoading} className="w-full font-semibold shadow-md mt-4">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Footer Navigation Link */}
            <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border/40 pt-4">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Signup
