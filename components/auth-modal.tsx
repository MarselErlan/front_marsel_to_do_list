"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Loader2, User, Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserCreate, LoginCredentials } from "../lib/api"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (credentials: LoginCredentials) => Promise<void>
  onRegister: (userData: UserCreate) => Promise<void>
  isLoading?: boolean
}

export function AuthModal({ isOpen, onClose, onLogin, onRegister, isLoading }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

    // Validation
    if (!registerData.username.trim()) {
      setErrors({ username: "Username is required" })
      return
    }
    if (!registerData.email.trim()) {
      setErrors({ email: "Email is required" })
      return
    }
    if (!registerData.email.includes("@")) {
      setErrors({ email: "Please enter a valid email" })
      return
    }
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

    try {
      await onRegister({
        username: registerData.username.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
      })
      // Reset form on success
      setRegisterData({ username: "", email: "", password: "", confirmPassword: "" })
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : "Registration failed" })
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setErrors({})
      setLoginData({ username: "", password: "" })
      setRegisterData({ username: "", email: "", password: "", confirmPassword: "" })
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
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Task Planner
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {activeTab === "login" ? "Sign in to your account" : "Create your account"}
          </p>
        </CardHeader>

        <CardContent>
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
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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
                        "pl-10 h-12 border-2 transition-colors",
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
                        "pl-10 pr-10 h-12 border-2 transition-colors",
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

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
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
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      className={cn(
                        "pl-10 h-12 border-2 transition-colors",
                        errors.username ? "border-red-300 focus:border-red-400" : "focus:border-blue-400",
                      )}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className={cn(
                        "pl-10 h-12 border-2 transition-colors",
                        errors.email ? "border-red-300 focus:border-red-400" : "focus:border-blue-400",
                      )}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
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
                        "pl-10 pr-10 h-12 border-2 transition-colors",
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
                        "pl-10 pr-10 h-12 border-2 transition-colors",
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
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300"
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
