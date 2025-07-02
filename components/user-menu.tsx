"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, LogOut, Settings, ChevronDown, KeyRound } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface UserMenuProps {
  username: string
  onLogout: () => void
  onOpenAuth: () => void
  onOpenResetPassword?: () => void
}

export function UserMenu({ username, onLogout, onOpenAuth, onOpenResetPassword }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()
  }

  if (!username) {
    return (
      <Button
        onClick={onOpenAuth}
        variant="outline"
        size="sm"
        className="bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300"
      >
        <User className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Sign In</span>
      </Button>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300 flex items-center gap-2 touch-manipulation h-10 px-3"
        >
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="hidden sm:inline font-medium text-sm">{username}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{username}</p>
                  <p className="text-sm text-gray-500">Task Planner User</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-12 text-left hover:bg-gray-50 touch-manipulation"
                disabled
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
                <span className="ml-auto text-xs text-gray-400">Soon</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-12 text-left hover:bg-blue-50 hover:text-blue-600 touch-manipulation"
                onClick={() => {
                  setIsOpen(false)
                  onOpenResetPassword?.()
                }}
              >
                <KeyRound className="w-4 h-4 mr-3" />
                Reset Password
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-12 text-left hover:bg-red-50 hover:text-red-600 touch-manipulation"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
