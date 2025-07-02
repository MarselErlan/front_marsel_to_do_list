"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2, Mail, KeyRound, CheckCircle, Eye, EyeOff, User, Shield } from "lucide-react"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  prefilledUsername?: string
}

export function ForgotPasswordModal({ isOpen, onClose, onSuccess, prefilledUsername }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"email" | "verify" | "reset">("email")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState(prefilledUsername || "")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    console.log(`🚀 DIRECT API CALL: Sending password reset code to ${email.trim()}`)

    setIsLoading(true)
    try {
      // DIRECT POST REQUEST TO YOUR BACKEND
      const response = await fetch("https://web-production-56fee.up.railway.app/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      })

      console.log(`📡 Direct API Response: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Password reset request successful:", data)
        setSuccessMessage(data.message)

        // If username is returned from the API, use it
        if (data.username) {
          setUsername(data.username)
        }

        setStep("verify")
      } else {
        const errorText = await response.text()
        console.error(`❌ API Error: ${response.status} - ${errorText}`)

        if (response.status === 429) {
          setError("Too many password reset requests. Please wait before trying again.")
        } else if (response.status === 400) {
          setError("Invalid email address format.")
        } else if (response.status === 404) {
          setError("No account found with this email address.")
        } else {
          setError(`Server error: ${response.status} - ${errorText || response.statusText}`)
        }
      }
    } catch (error) {
      console.error("❌ Network error during password reset:", error)

      if (error instanceof Error) {
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          setError("Network error: Cannot connect to server. Check your internet connection.")
        } else if (error.message.includes("CORS")) {
          setError("CORS error: Backend needs to allow requests from this domain.")
        } else {
          setError(`Network error: ${error.message}`)
        }
      } else {
        setError("Unknown network error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!verificationCode.trim()) {
      setError("Please enter the verification code")
      return
    }

    console.log(`🚀 DIRECT API CALL: Verifying reset code for ${email}`)

    setIsLoading(true)
    try {
      // DIRECT POST REQUEST TO VERIFY CODE
      const response = await fetch("https://web-production-56fee.up.railway.app/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          verification_code: verificationCode.trim(),
        }),
      })

      console.log(`📡 Direct API Response: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Code verification successful:", data)

        // If username is returned from verification, use it
        if (data.username) {
          setUsername(data.username)
        }

        setStep("reset")
      } else {
        const errorText = await response.text()
        console.error(`❌ API Error: ${response.status} - ${errorText}`)

        if (response.status === 400) {
          setError("Invalid or expired verification code.")
        } else if (response.status === 404) {
          setError("No account found with this email address.")
        } else {
          setError(`Server error: ${response.status} - ${errorText || response.statusText}`)
        }
      }
    } catch (error) {
      console.error("❌ Network error during code verification:", error)
      setError(error instanceof Error ? error.message : "Failed to verify code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newPassword) {
      setError("Please enter a new password")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    console.log(`🚀 DIRECT API CALL: Resetting password for ${email}`)

    setIsLoading(true)
    try {
      // DIRECT POST REQUEST TO YOUR BACKEND
      const response = await fetch("https://web-production-56fee.up.railway.app/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          verification_code: verificationCode.trim(),
          new_password: newPassword,
        }),
      })

      console.log(`📡 Direct API Response: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Password reset successful:", data)

        setSuccessMessage("Password reset successfully! You can now sign in with your new password.")
        setTimeout(() => {
          handleClose()
          onSuccess?.()
        }, 2000)
      } else {
        const errorText = await response.text()
        console.error(`❌ API Error: ${response.status} - ${errorText}`)

        if (response.status === 400) {
          setError("Invalid or expired verification code.")
        } else if (response.status === 404) {
          setError("No account found with this email address.")
        } else {
          setError(`Server error: ${response.status} - ${errorText || response.statusText}`)
        }
      }
    } catch (error) {
      console.error("❌ Network error during password reset:", error)
      setError(error instanceof Error ? error.message : "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setStep("email")
      setEmail("")
      setVerificationCode("")
      setNewPassword("")
      setConfirmPassword("")
      setUsername(prefilledUsername || "")
      setError("")
      setSuccessMessage("")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl border-0 bg-white/95 backdrop-blur-md">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          onClick={handleClose}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === "email" && <Mail className="w-8 h-8 text-white" />}
            {step === "verify" && <Shield className="w-8 h-8 text-white" />}
            {step === "reset" && <KeyRound className="w-8 h-8 text-white" />}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {step === "email" && "Reset Password"}
            {step === "verify" && "Verify Reset Code"}
            {step === "reset" && "Create New Password"}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {step === "email" && "Enter your email address to receive a reset code"}
            {step === "verify" && "Enter the 6-digit code sent to your email"}
            {step === "reset" && "Create a new password for your account"}
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-orange-400 transition-colors"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending Reset Code...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Code
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Verify Code Step */}
          {step === "verify" && (
            <div className="space-y-4">
              {/* Email Confirmation */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Reset code sent to: <strong>{email}</strong>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-code" className="text-sm font-medium">
                    Verification Code
                  </Label>
                  <Input
                    id="verify-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-12 border-2 focus:border-orange-400 transition-colors text-center text-lg font-mono tracking-widest"
                    disabled={isLoading}
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Check your email for the 6-digit verification code
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verifying Code...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Code
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Reset Password Step */}
          {step === "reset" && (
            <div className="space-y-4">
              {/* Username Display (if available) */}
              {username && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      value={username}
                      className="pl-10 h-12 border-2 bg-blue-50 text-blue-700 font-bold cursor-not-allowed"
                      disabled
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-gray-500">This is your username for login</p>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-2 focus:border-orange-400 transition-colors"
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-gray-100"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12 border-2 focus:border-orange-400 transition-colors"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
