"use client"

import { useState, useEffect } from "react"
import { Users, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { todoApi } from "../lib/api"

export function UserCountDisplay() {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await todoApi.getUserCount()
        setUserCount(response.total_users)
      } catch (error) {
        console.error("Failed to fetch user count:", error)
        // Fallback to a demo number
        setUserCount(847)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserCount()
  }, [])

  if (isLoading) {
    return (
      <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm animate-pulse">
        <Users className="w-3 h-3 mr-1" />
        <span className="hidden sm:inline">Loading...</span>
        <span className="sm:hidden">...</span>
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
      <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
      <span className="hidden sm:inline">{userCount?.toLocaleString()} users</span>
      <span className="sm:hidden">{userCount?.toLocaleString()}</span>
    </Badge>
  )
}
