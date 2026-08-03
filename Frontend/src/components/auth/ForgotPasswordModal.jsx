import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  KeyRound,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  X,
} from "lucide-react"
import api from "@/services/api"

export function ForgotPasswordModal({ open, onOpenChange, initialEmail = "" }) {
  const [step, setStep] = useState(1) // 1: Email Request, 2: Code Verification, 3: New Password
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [timer, setTimer] = useState(30)
  const [timerActive, setTimerActive] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // 30-Second Countdown Timer Effect for Step 2
  useEffect(() => {
    let interval = null
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      setTimerActive(false)
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timerActive, timer])

  const resetModalState = () => {
    setStep(1)
    setCode("")
    setResetToken("")
    setNewPassword("")
    setConfirmPassword("")
    setError(null)
    setSuccessMsg(null)
    setTimer(30)
    setTimerActive(false)
  }

  const handleOpenChange = (newOpen) => {
    if (!newOpen) resetModalState()
    onOpenChange(newOpen)
  }

  // Step 1: Request 30s TOTP Reset Code
  const handleRequestCode = async (e) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim() })
      setSuccessMsg(res.data?.message || "A 6-digit code has been sent to your email.")
      setStep(2)
      setTimer(30)
      setTimerActive(true)
    } catch (err) {
      const detail = err?.response?.data?.detail || "Failed to send reset code. Please try again."
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify 6-Digit TOTP Code
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (!code || code.trim().length !== 6) {
      setError("Please enter the 6-digit code.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await api.post("/auth/verify-reset-code", {
        email: email.trim(),
        code: code.trim(),
      })
      const token = res.data?.reset_token
      if (!token) {
        throw new Error("Reset token not returned by server.")
      }
      setResetToken(token)
      setStep(3)
      setSuccessMsg("Code verified! Set your new password below.")
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        "Invalid 6-digit code or 30-second window expired. Please try again."
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setError("New password must be at least 8 characters long.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await api.post("/auth/reset-password", {
        email: email.trim(),
        reset_token: resetToken,
        new_password: newPassword,
      })
      setSuccessMsg(res.data?.message || "Password reset successfully! You can now log in.")
      setTimeout(() => {
        handleOpenChange(false)
      }, 2000)
    } catch (err) {
      const detail = err?.response?.data?.detail || "Failed to reset password. Please try again."
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-roboto">
      <div className="relative w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-4">
        
        {/* Close X Button */}
        <button
          type="button"
          onClick={() => handleOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
            {step === 1 && <KeyRound className="h-6 w-6 stroke-[1.8]" />}
            {step === 2 && <ShieldCheck className="h-6 w-6 stroke-[1.8]" />}
            {step === 3 && <Lock className="h-6 w-6 stroke-[1.8]" />}
          </div>

          <h3 className="font-poppins text-lg font-bold text-foreground">
            {step === 1 && "Reset Your Password"}
            {step === 2 && "Enter Verification Code"}
            {step === 3 && "Set New Password"}
          </h3>
          
          <p className="text-xs text-muted-foreground">
            {step === 1 && "Enter your registered email address to receive a stateless 30-second reset code."}
            {step === 2 && `Enter the 6-digit code sent to ${email}. Code valid for 30 seconds.`}
            {step === 3 && "Create a strong new password for your account."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1 FORM: EMAIL REQUEST */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email" className="text-xs font-semibold text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs h-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 font-poppins font-semibold text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending Code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>
        )}

        {/* STEP 2 FORM: 6-DIGIT CODE VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4 pt-1">
            <div className="space-y-1.5 text-center">
              <Label htmlFor="totp-code" className="text-xs font-semibold text-foreground block">
                6-Digit Verification Code
              </Label>
              <Input
                id="totp-code"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg font-mono font-bold tracking-widest h-12 rounded-xl border-blue-500/40 focus:ring-blue-600"
                autoFocus
                required
              />

              {/* Timer indicator */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>Validity Window:</span>
                <span className={`font-mono font-bold ${timer < 10 ? "text-red-500" : "text-foreground"}`}>
                  {timer}s
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full h-10 font-poppins font-semibold text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setStep(1)
                }}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer font-medium"
              >
                <ArrowLeft className="h-3 w-3" /> Change Email
              </button>

              <button
                type="button"
                disabled={loading || timerActive}
                onClick={handleRequestCode}
                className={`font-semibold cursor-pointer ${
                  timerActive ? "text-muted-foreground cursor-not-allowed opacity-50" : "text-blue-600 hover:underline"
                }`}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 FORM: SET NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="new-pwd" className="text-xs font-semibold text-foreground">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-pwd"
                  type="password"
                  placeholder="Min 8 chars (A-Z, a-z, 0-9, !@#$)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-9 text-xs h-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pwd" className="text-xs font-semibold text-foreground">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-pwd"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 text-xs h-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 font-poppins font-semibold text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ForgotPasswordModal
