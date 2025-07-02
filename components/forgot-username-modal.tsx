"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2, Mail, User, CheckCircle, Copy } from "lucide-react"

interface ForgotUsernameModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (username: string) => void
}

export function ForgotUsernameModal({ isOpen, onClose, onSuccess }: ForgotUsernameModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [foundUsername, setFoundUsername] = useState("")
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    console.log(`🚀 DIRECT API CALL: Finding username for email ${email.trim()}`)

    setIsLoading(true)
    try {
      // Direct API call to Railway backend
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      console.log(`🔍 Calling: https://web-production-56fee.up.railway.app/users/forgot-username`)

      const response = await fetch("https://web-production-56fee.up.railway.app/users/forgot-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        credentials: "omit",
        body: JSON.stringify({
          email: email.trim(),
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log(`📡 Response: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Username found successfully:", data)

        // Handle different response formats
        if (data.username) {
          setFoundUsername(data.username)
        } else if (data.data && data.data.username) {
          setFoundUsername(data.data.username)
        } else {
          throw new Error("Invalid response format: username not found in response")
        }
      } else {
        let errorText = ""
        try {
          const errorData = await response.json()
          errorText = errorData.detail || errorData.message || JSON.stringify(errorData)
        } catch {
          errorText = await response.text()
        }

        console.error(`❌ API Error: ${response.status} - ${errorText}`)

        if (response.status === 404) {
          setError("No account found with this email address.")
        } else if (response.status === 400) {
          setError("Invalid email address format.")
        } else if (response.status === 422) {
          setError("Invalid request format. Please check your email address.")
        } else if (response.status === 405) {
          setError("Method not allowed. The endpoint might not be implemented yet.")
        } else {
          setError(`Server error (${response.status}): ${errorText || response.statusText}`)
        }
      }
    } catch (error) {
      console.error("❌ Network error during username lookup:", error)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setError("Request timed out. Please try again.")
        } else if (error.name === "TypeError" && error.message.includes("fetch")) {
          // Show demo mode for connection issues
          console.log("🎭 Connection failed, showing demo result")
          await new Promise((resolve) => setTimeout(resolve, 1000))
          setFoundUsername("demo_user_" + Math.floor(Math.random() * 1000))
          setError("Demo mode: Connection to server failed. Showing sample username.")
        } else if (error.message.includes("CORS")) {
          setError(
            "CORS error: Backend needs to allow requests from this domain. Please check your backend CORS configuration.",
          )
        } else if (error.message.includes("NetworkError")) {
          setError("Network error: Please check your internet connection.")
        } else {
          setError(`Connection error: ${error.message}`)
        }
      } else {
        setError("Unknown error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(foundUsername)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy username:", error)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = foundUsername
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError)
      }
      document.body.removeChild(textArea)
    }
  }

  const handleUseUsername = () => {
    onSuccess?.(foundUsername)
    handleClose()
  }

  const handleClose = () => {
    if (!isLoading) {
      setEmail("")
      setError("")
      setFoundUsername("")
      setCopied(false)
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
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {foundUsername ? "Username Found!" : "Find Your Username"}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {foundUsername
              ? "Here's your username associated with this email"
              : "Enter your email address to find your username"}
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {/* Error Message */}
          {error && (
            <div
              className={`mb-4 p-3 border rounded-lg text-sm ${
                error.includes("Demo mode")
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <div className="font-medium mb-1">{error.includes("Demo mode") ? "Demo Mode" : "Error"}</div>
              <div>{error}</div>
              {error.includes("Method not allowed") && (
                <div className="mt-2 text-xs">
                  💡 The forgot username endpoint might not be implemented on the backend yet
                </div>
              )}
              {error.includes("Demo mode") && (
                <div className="mt-2 text-xs">🎭 This is a sample username for demonstration purposes</div>
              )}
            </div>
          )}

          {/* Username Found */}
          {foundUsername ? (
            <div className="space-y-4">
              {/* Success Message */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Username found for: {email}</p>
                </div>
              </div>

              {/* Username Display */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Your Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    value={foundUsername}
                    className="pl-10 pr-10 h-12 border-2 bg-blue-50 text-blue-700 font-bold text-lg cursor-pointer"
                    readOnly
                    onClick={handleCopyUsername}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-blue-100"
                    onClick={handleCopyUsername}
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {copied ? "✅ Username copied to clipboard!" : "Click to copy username"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFoundUsername("")
                    setEmail("")
                    setError("")
                  }}
                  className="flex-1"
                >
                  Try Another Email
                </Button>
                <Button
                  type="button"
                  onClick={handleUseUsername}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                >
                  Use This Username
                </Button>
              </div>
            </div>
          ) : (
            /* Email Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-purple-400 transition-colors"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Finding Username...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Find My Username
                  </>
                )}
              </Button>

              {/* Debug Info */}
              <div className="text-xs text-gray-500 text-center">
                Will call: web-production-56fee.up.railway.app/users/forgot-username
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
