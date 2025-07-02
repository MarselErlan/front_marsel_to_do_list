"use client"

import type React from "react"
import { useState } from "react"
import { Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AirbnbTimePickerProps {
  label: string
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AirbnbTimePicker({
  label,
  value,
  onChange,
  placeholder = "Select time",
  disabled,
  className,
}: AirbnbTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | "evening" | "night">("morning")

  const handleTimeSelect = (time: string) => {
    onChange(time)
    setIsOpen(false) // Close immediately after selection
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
  }

  const handleQuickSelect = (time: string) => {
    onChange(time)
    setIsOpen(false)
  }

  const formatDisplayTime = (timeString?: string) => {
    if (!timeString) return null
    try {
      const [hours, minutes] = timeString.split(":")
      const date = new Date()
      date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      console.warn("Error formatting time:", timeString, error)
      return timeString
    }
  }

  // Generate time options by period
  const getTimesByPeriod = (period: "morning" | "afternoon" | "evening" | "night") => {
    const times = []
    let startHour = 0
    let endHour = 24

    switch (period) {
      case "morning":
        startHour = 6
        endHour = 12
        break
      case "afternoon":
        startHour = 12
        endHour = 17
        break
      case "evening":
        startHour = 17
        endHour = 21
        break
      case "night":
        startHour = 21
        endHour = 24
        break
    }

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        const displayTime = formatDisplayTime(timeString)
        times.push({ value: timeString, display: displayTime })
      }
    }

    return times
  }

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case "morning":
        return "🌅"
      case "afternoon":
        return "☀️"
      case "evening":
        return "🌆"
      case "night":
        return "🌙"
      default:
        return "⏰"
    }
  }

  const getPeriodFromTime = (timeString: string): "morning" | "afternoon" | "evening" | "night" => {
    const hour = Number.parseInt(timeString.split(":")[0])
    if (hour >= 6 && hour < 12) return "morning"
    if (hour >= 12 && hour < 17) return "afternoon"
    if (hour >= 17 && hour < 21) return "evening"
    return "night"
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-12 relative cursor-pointer",
              !value && "text-muted-foreground",
            )}
            disabled={disabled}
          >
            <Clock className="mr-2 h-4 w-4" />
            <span className="flex-1">
              {value ? (
                <div className="flex items-center gap-2">
                  <span>{getPeriodIcon(getPeriodFromTime(value))}</span>
                  <span className="font-medium">{formatDisplayTime(value)}</span>
                </div>
              ) : (
                placeholder
              )}
            </span>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-3 h-6 w-6 p-0 hover:bg-gray-100 z-10"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="bg-white rounded-lg shadow-lg border w-96">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="text-center">
                <Badge variant="default" className="text-sm">
                  Select Time
                </Badge>
              </div>
            </div>

            {/* Quick Select */}
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium mb-3 text-gray-600">Quick Select</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect("09:00")}
                  className="justify-start"
                >
                  <span className="mr-2">🌅</span>
                  9:00 AM
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect("12:00")}
                  className="justify-start"
                >
                  <span className="mr-2">☀️</span>
                  12:00 PM
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect("15:00")}
                  className="justify-start"
                >
                  <span className="mr-2">☀️</span>
                  3:00 PM
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect("18:00")}
                  className="justify-start"
                >
                  <span className="mr-2">🌆</span>
                  6:00 PM
                </Button>
              </div>
            </div>

            {/* Period Selector */}
            <div className="p-4 border-b">
              <div className="flex gap-1 mb-4">
                {(["morning", "afternoon", "evening", "night"] as const).map((period) => (
                  <Button
                    key={period}
                    type="button"
                    variant={selectedPeriod === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className="flex-1 text-xs"
                  >
                    <span className="mr-1">{getPeriodIcon(period)}</span>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {getTimesByPeriod(selectedPeriod).map((time) => (
                  <Button
                    key={time.value}
                    type="button"
                    variant={value === time.value ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-10 justify-center"
                    onClick={() => handleTimeSelect(time.value)}
                  >
                    {time.display}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Selection */}
            {value && (
              <div className="p-4 bg-blue-50 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <span className="text-lg">{getPeriodIcon(getPeriodFromTime(value))}</span>
                  <span className="font-medium">{formatDisplayTime(value)}</span>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
