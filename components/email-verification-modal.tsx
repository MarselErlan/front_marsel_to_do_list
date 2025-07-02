"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2, Mail, Shield, ArrowLeft, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerificationComplete: (email: string, code: string) => void
  isLoading?: boolean
  prefilledEmail?: string
}

export function EmailVerificationModal({
  isOpen,
  onClose,
  onVerificationComplete,
  isLoading,
  prefilledEmail,
}: EmailVerificationModalProps) {
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState(prefilledEmail || "")
  const [verificationCode, setVerificationCode] = useState("")
  const [isRequestingCode, setIsRequestingCode] = useState(false)
  const [error, setError] = useState("")

  // Update email when prefilledEmail changes
  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail)
    }
  }, [prefilledEmail])

  // DIRECT API CALL - No fallback to demo mode
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    console.log(`🚀 DIRECT API CALL: Sending verification code to ${email.trim()}`)

    setIsRequestingCode(true)
    try {
      // DIRECT POST REQUEST TO YOUR BACKEND
      const response = await fetch("https://web-production-56fee.up.railway.app/auth/request-verification", {
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
        console.log("✅ Email verification request successful:", data)

        // Show success message with email confirmation
        setStep("code")

        // Special logging for test email
        if (email.trim() === "ericabram33@gmail.com") {
          console.log("🎯 TEST EMAIL SUCCESS: ericabram33@gmail.com")
          console.log("📧 Real verification code should be sent to this email")
          console.log("📱 Check your email inbox and spam folder")
        }
      } else {
        const errorText = await response.text()
        console.error(`❌ API Error: ${response.status} - ${errorText}`)

        // Provide specific error messages based on response
        if (response.status === 429) {
          setError("Too many verification requests. Please wait before trying again.")
        } else if (response.status === 400) {
          // Check if the error is about existing email
          if (
            errorText.toLowerCase().includes("already exists") ||
            errorText.toLowerCase().includes("already registered") ||
            errorText.toLowerCase().includes("email exists") ||
            errorText.toLowerCase().includes("user already exists")
          ) {
            setError(
              "This email address is already registered. Please use a different email or try signing in instead.",
            )
          } else {
            setError("Invalid email address format.")
          }
        } else if (response.status === 409) {
          // 409 Conflict - typically used for "already exists" scenarios
          setError("This email address is already registered. Please use a different email or try signing in instead.")
        } else if (response.status === 422) {
          // Unprocessable Entity - could be validation error or existing email
          try {
            const errorData = JSON.parse(errorText)
            if (
              errorData.detail &&
              (errorData.detail.toLowerCase().includes("already exists") ||
                errorData.detail.toLowerCase().includes("already registered"))
            ) {
              setError(
                "This email address is already registered. Please use a different email or try signing in instead.",
              )
            } else {
              setError("Invalid email address format or email already exists.")
            }
          } catch {
            setError("Invalid email address format or email already exists.")
          }
        } else if (response.status === 404) {
          setError("Verification endpoint not found. Please check backend configuration.")
        } else {
          setError(`Server error: ${response.status} - ${errorText || response.statusText}`)
        }
      }
    } catch (error) {
      console.error("❌ Network error during email verification:", error)

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
      setIsRequestingCode(false)
    }
  }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!verificationCode.trim()) {
      setError("Please enter the verification code")
      return
    }

    onVerificationComplete(email, verificationCode.trim())
  }

  const handleClose = () => {
    if (!isLoading && !isRequestingCode) {
      onClose()
    }
  }

  const handleBackToEmail = () => {
    if (!isLoading) {
      setStep("email")
      setVerificationCode("")
      setError("")
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
          disabled={isLoading || isRequestingCode}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === "email" ? <Mail className="w-8 h-8 text-white" /> : <Shield className="w-8 h-8 text-white" />}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {step === "email" ? "Verify Your Email" : "Enter Verification Code"}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {step === "email"
              ? "We'll send you a verification code to confirm your email address"
              : `We've sent a 6-digit code to ${email}`}
          </p>
        </CardHeader>

        <CardContent>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-email" className="text-sm font-medium flex items-center gap-2">
                  Email Address
                  {prefilledEmail && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                      🔒 SECURITY LOCKED
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="verification-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      if (!prefilledEmail) {
                        setEmail(e.target.value)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (prefilledEmail) {
                        e.preventDefault()
                      }
                    }}
                    onPaste={(e) => {
                      if (prefilledEmail) {
                        e.preventDefault()
                      }
                    }}
                    className={cn(
                      "pl-10 h-12 border-2 transition-colors",
                      prefilledEmail
                        ? "bg-red-50 text-red-700 cursor-not-allowed focus:border-red-300 border-red-300 font-medium"
                        : "focus:border-green-400",
                    )}
                    disabled={isRequestingCode || !!prefilledEmail}
                    readOnly={!!prefilledEmail}
                    required
                  />
                  {prefilledEmail && <div className="absolute right-3 top-3 text-red-500">🔒</div>}
                </div>
              </div>

              {/* DIRECT API CALL BUTTON */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                disabled={isRequestingCode}
              >
                {isRequestingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending Real Email...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />🚀 Send REAL Verification Code
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Code Step */}
          {step === "code" && (
            <div className="space-y-4">
              {/* Success Message */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Verification code sent to: <strong>{email}</strong>
              </div>

              {/* Show locked email field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Email Address (Locked)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    className="pl-10 h-12 border-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </div>
                <p className="text-xs text-gray-500">The verification code was sent to this email address</p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code" className="text-sm font-medium">
                    Verification Code
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="pl-10 h-12 border-2 focus:border-green-400 transition-colors text-center text-lg font-mono tracking-widest"
                      disabled={isLoading}
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Check your email for the 6-digit verification code
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToEmail}
                    disabled={isLoading}
                    className="flex-1 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change Email
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify & Create Account
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Resend Code */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep("email")
                    setVerificationCode("")
                    setError("")
                    onClose()
                  }}
                  disabled={isLoading}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel Verification & Start Over
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
