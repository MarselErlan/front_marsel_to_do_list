"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  User,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  WifiOff,
  CheckCircle,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserCreate, LoginCredentials, RegisterWithVerification } from "../lib/api"
import { EmailVerificationModal } from "./email-verification-modal"
import { ForgotPasswordModal } from "./forgot-password-modal"
import { ForgotUsernameModal } from "./forgot-username-modal"
import { todoApi } from "@/lib/api"

interface AuthOverlayProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>
  onRegister: (userData: UserCreate) => Promise<void>
  isLoading?: boolean
  isConnected: boolean
}

export function AuthOverlay({ onLogin, onRegister, isLoading, isConnected }: AuthOverlayProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showForgotUsername, setShowForgotUsername] = useState(false)
  const [pendingRegistration, setPendingRegistration] = useState<{
    username: string
    password: string
  } | null>(null)

  const [isVerificationInProgress, setIsVerificationInProgress] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState<string>("")

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Restore verification state on page reload
  useEffect(() => {
    const savedVerificationState = localStorage.getItem("verification_in_progress")
    const savedVerificationEmail = localStorage.getItem("verification_email")

    if (savedVerificationState === "true" && savedVerificationEmail) {
      setIsVerificationInProgress(true)
      setVerificationEmail(savedVerificationEmail)
      setRegisterData((prev) => ({ ...prev, email: savedVerificationEmail }))
    }
  }, [])

  // Username validation function
  const validateUsername = (username: string): string | null => {
    const trimmed = username.trim()

    if (!trimmed) {
      return "Username is required"
    }

    if (trimmed.length < 3) {
      return "Username must be at least 3 characters long"
    }

    if (trimmed.length > 20) {
      return "Username must be less than 20 characters"
    }

    // Check for spaces
    if (trimmed.includes(" ")) {
      return "Username cannot contain spaces"
    }

    // Check for valid characters (letters, numbers, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return "Username can only contain letters, numbers, underscore, and hyphen"
    }

    // Check if starts with letter or number
    if (!/^[a-zA-Z0-9]/.test(trimmed)) {
      return "Username must start with a letter or number"
    }

    return null
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!loginData.username.trim()) {
      setErrors({ username: "Username is required" })
      return
    }
    if (!loginData.password) {
      setErrors({ password: "Password is required" })
      return
    }

    try {
      await onLogin({
        username: loginData.username.trim(),
        password: loginData.password,
      })
      // Reset form on success
      setLoginData({ username: "", password: "" })
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : "Login failed" })
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Username validation
    const usernameError = validateUsername(registerData.username)
    if (usernameError) {
      setErrors({ username: usernameError })
      return
    }

    // Email validation
    if (!registerData.email.trim()) {
      setErrors({ email: "Email is required" })
      return
    }
    if (!registerData.email.includes("@")) {
      setErrors({ email: "Please enter a valid email" })
      return
    }

    // Password validation
    if (!registerData.password) {
      setErrors({ password: "Password is required" })
      return
    }
    if (registerData.password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" })
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    // Special logging for test email
    if (registerData.email.trim() === "ericabram33@gmail.com") {
      console.log("🧪 TEST EMAIL REGISTRATION DETECTED!")
      console.log("📧 Email: ericabram33@gmail.com")
      console.log("👤 Username:", registerData.username.trim())
      console.log("🔐 Password length:", registerData.password.length)
      console.log("🚀 Proceeding with verification flow...")
    }

    // Store registration data and verification state
    setPendingRegistration({
      username: registerData.username.trim(),
      password: registerData.password,
    })

    // Save verification state to localStorage for security
    setIsVerificationInProgress(true)
    setVerificationEmail(registerData.email.trim())
    localStorage.setItem("verification_in_progress", "true")
    localStorage.setItem("verification_email", registerData.email.trim())

    // Pre-fill the email in the verification modal
    setShowEmailVerification(true)
  }

  const handleEmailVerificationComplete = async (email: string, verificationCode: string) => {
    if (!pendingRegistration) return

    try {
      const registrationData: RegisterWithVerification = {
        email: email,
        username: pendingRegistration.username,
        password: pendingRegistration.password,
        code: verificationCode,
      }

      // Use the new registration endpoint with verification
      await todoApi.registerWithVerification(registrationData)

      // Clear verification state
      setIsVerificationInProgress(false)
      setVerificationEmail("")
      localStorage.removeItem("verification_in_progress")
      localStorage.removeItem("verification_email")

      // Reset states
      setShowEmailVerification(false)
      setPendingRegistration(null)
      setRegisterData({ username: "", email: "", password: "", confirmPassword: "" })
      setErrors({})

      // Redirect to login tab instead of auto-login
      setActiveTab("login")

      // Show success message
      setErrors({
        general: "✅ Account created successfully! Please sign in with your credentials.",
      })
    } catch (error) {
      console.error("❌ Registration with verification failed:", error)

      // Handle specific error cases
      if (error instanceof Error) {
        if (
          error.message.includes("already registered") ||
          error.message.includes("already exists") ||
          error.message.includes("email exists")
        ) {
          setErrors({
            email: "This email address is already registered. Please use a different email or try signing in instead.",
          })
        } else {
          setErrors({ general: error.message })
        }
      } else {
        setErrors({ general: "Registration failed" })
      }

      setShowEmailVerification(false)
    }
  }

  // Handle username input with real-time formatting
  const handleUsernameChange = (value: string) => {
    // Remove leading spaces and convert to lowercase
    let formatted = value.replace(/^\s+/, "").toLowerCase()

    // Remove any spaces in the middle
    formatted = formatted.replace(/\s/g, "")

    // Only allow valid characters
    formatted = formatted.replace(/[^a-zA-Z0-9_-]/g, "")

    setRegisterData({ ...registerData, username: formatted })

    // Clear username error when user starts typing
    if (errors.username) {
      setErrors({ ...errors, username: "" })
    }
  }

  // Handle forgot username success
  const handleForgotUsernameSuccess = (foundUsername: string) => {
    setLoginData({ ...loginData, username: foundUsername })
    setActiveTab("login")
    setErrors({
      general: `✅ Username found: ${foundUsername}. Please enter your password to sign in.`,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/20 backdrop-blur-sm">
      {/* Centered Auth Card - Mobile Optimized */}
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 mx-2 sm:mx-0">
          <CardHeader className="text-center pb-4 px-4 sm:px-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Task Planner
            </CardTitle>
            <p className="text-gray-600 text-sm">
              {activeTab === "login" ? "Sign in to your account" : "Create your account"}
            </p>
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* General Error */}
              {errors.general && (
                <div
                  className={cn(
                    "mb-4 p-3 border rounded-lg text-sm flex items-center gap-2",
                    errors.general.includes("✅")
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700",
                  )}
                >
                  {errors.general.includes("✅") ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {errors.general}
                </div>
              )}

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-sm font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className={cn(
                          "pl-10 h-12 border-2 transition-colors touch-manipulation text-base",
                          errors.username ? "border-red-300 focus:border-red-400" : "focus:border-blue-400",
                        )}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className={cn(
                          "pl-10 pr-10 h-12 border-2 transition-colors touch-manipulation text-base",
                          errors.password ? "border-red-300 focus:border-red-400" : "focus:border-blue-400",
                        )}
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
                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                  </div>

                  {/* Forgot Links */}
                  <div className="flex justify-between text-sm">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:text-purple-700 p-0 h-auto"
                      onClick={() => setShowForgotUsername(true)}
                    >
                      Forgot username?
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 touch-manipulation text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-sm font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        className={cn(
                          "pl-10 h-12 border-2 transition-colors touch-manipulation text-base",
                          errors.username ? "border-red-300 focus:border-red-400" : "focus:border-blue-400",
                        )}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.username}
                      </p>
                    )}
                    {!errors.username && registerData.username && (
                      <p className="text-green-600 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Username looks good!
                      </p>
                    )}
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>Username rules:</strong> 3-20 characters, letters/numbers/underscore/hyphen only, no
                      spaces
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium flex items-center gap-2">
                      Email
                      {isVerificationInProgress && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                          🔒 LOCKED - Verification in Progress
                        </span>
                      )}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => {
                          // Prevent any changes during verification
                          if (!isVerificationInProgress) {
                            setRegisterData({ ...registerData, email: e.target.value })
                          }
                        }}
                        onKeyDown={(e) => {
                          // Block all keyboard input during verification
                          if (isVerificationInProgress) {
                            e.preventDefault()
                          }
                        }}
                        onPaste={(e) => {
                          // Block paste during verification
                          if (isVerificationInProgress) {
                            e.preventDefault()
                          }
                        }}
                        className={cn(
                          "pl-10 h-12 border-2 transition-colors touch-manipulation text-base",
                          errors.email ? "border-red-300 focus:border-red-400" : "focus:border-blue-400",
                          isVerificationInProgress &&
                            "bg-red-50 border-red-300 cursor-not-allowed text-red-700 font-medium",
                        )}
                        disabled={isLoading || isVerificationInProgress}
                        readOnly={isVerificationInProgress}
                        required
                      />
                      {isVerificationInProgress && <div className="absolute right-3 top-3 text-red-500">🔒</div>}
                    </div>
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                    {isVerificationInProgress && (
                      <div className="text-xs text-red-700 bg-red-50 p-3 rounded border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-600">🔒</span>
                          <strong>Email locked for verification: {verificationEmail}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className={cn(
                          "pl-10 pr-10 h-12 border-2 transition-colors touch-manipulation text-base",
                          errors.password ? "border-red-300 focus:border-red-400" : "focus:border-blue-400",
                        )}
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
                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className={cn(
                          "pl-10 pr-10 h-12 border-2 transition-colors touch-manipulation text-base",
                          errors.confirmPassword ? "border-red-300 focus:border-red-400" : "focus:border-blue-400",
                        )}
                        disabled={isLoading}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300 touch-manipulation text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
                {isVerificationInProgress && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700 mb-2">
                      📧 Verification in progress for: <strong>{verificationEmail}</strong>
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsVerificationInProgress(false)
                        setVerificationEmail("")
                        localStorage.removeItem("verification_in_progress")
                        localStorage.removeItem("verification_email")
                        setRegisterData({ username: "", email: "", password: "", confirmPassword: "" })
                        setPendingRegistration(null)
                      }}
                      className="w-full"
                    >
                      🔄 Start Over with Different Email
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Features */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-4">New to Task Planner? Create an account to get started!</p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Secure
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Fast
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Organized
                </span>
              </div>
            </div>

            {/* Demo Mode Notice */}
            {!isConnected && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                <p className="text-sm text-orange-700">
                  <WifiOff className="w-4 h-4 inline mr-1" />
                  Demo Mode Active - Your data won't be saved
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => {
          setShowEmailVerification(false)
          setPendingRegistration(null)
        }}
        onVerificationComplete={handleEmailVerificationComplete}
        isLoading={isLoading}
        prefilledEmail={registerData.email}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={() => {
          setShowForgotPassword(false)
          setActiveTab("login")
        }}
        prefilledUsername={loginData.username}
      />

      {/* Forgot Username Modal */}
      <ForgotUsernameModal
        isOpen={showForgotUsername}
        onClose={() => setShowForgotUsername(false)}
        onSuccess={handleForgotUsernameSuccess}
      />
    </div>
  )
}
