"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Clock, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TimeRange {
  start: string | null
  end: string | null
}

interface AirbnbTimeRangePickerProps {
  label: string
  startTime?: string
  endTime?: string
  onChange: (startTime: string | undefined, endTime: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AirbnbTimeRangePicker({
  label,
  startTime,
  endTime,
  onChange,
  placeholder = "Select time",
  disabled,
  className,
}: AirbnbTimeRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: null, end: null })
  const [selectedPeriod, setSelectedPeriod] = useState<"night" | "morning" | "afternoon" | "evening">("morning")
  const [selectionStep, setSelectionStep] = useState<"start" | "end">("start")

  // Initialize from props - FIXED: Don't auto-set current time
  useEffect(() => {
    const start = startTime || null
    const end = endTime || null

    setTimeRange({ start, end })

    if (start && end) {
      setSelectionStep("start") // Reset for next selection
    } else if (start) {
      setSelectionStep("end")
    } else {
      setSelectionStep("start")
      // REMOVED: Auto-current time logic
    }

    // Set initial period based on start time or current time
    if (start) {
      setSelectedPeriod(getPeriodFromTime(start))
    } else {
      // Set period based on current time when opening
      const now = new Date()
      const currentHour = now.getHours()
      setSelectedPeriod(getPeriodFromTime(`${currentHour.toString().padStart(2, "0")}:00`))
    }
  }, [startTime, endTime])

  const handleTimeSelect = (time: string) => {
    if (selectionStep === "start") {
      // Starting new selection
      setTimeRange({ start: time, end: null })
      setSelectionStep("end")
      onChange(time, undefined)

      // Set period for end time selection based on selected start time
      setSelectedPeriod(getNextPeriod(getPeriodFromTime(time)))
    } else if (selectionStep === "end" && timeRange.start) {
      const start = timeRange.start

      // If clicking the same time as start, make it a single time slot (1 hour)
      if (time === start) {
        const endTime = addHoursToTime(start, 1)
        setTimeRange({ start, end: endTime })
        onChange(start, endTime)
        setSelectionStep("start")
        setIsOpen(false)
        return
      }

      // If clicking a different time, create range
      const end = time

      // Ensure start is before end
      if (compareTimeStrings(end, start) < 0) {
        setTimeRange({ start: end, end: start })
        onChange(end, start)
      } else {
        setTimeRange({ start, end })
        onChange(start, end)
      }

      setSelectionStep("start")
      setIsOpen(false)
    }
  }

  const addHoursToTime = (timeStr: string, hours: number): string => {
    const [currentHours, minutes] = timeStr.split(":").map(Number)
    let newHours = currentHours + hours
    if (newHours >= 24) newHours = newHours - 24
    return `${newHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTimeRange({ start: null, end: null })
    setSelectionStep("start")
    onChange(undefined, undefined)
  }

  const handleQuickSelect = (startTime: string, endTime: string) => {
    setTimeRange({ start: startTime, end: endTime })
    setSelectionStep("start")
    onChange(startTime, endTime)
    setIsOpen(false)
  }

  // FIXED: Use current time properly without rounding
  const handleCurrentTimeSelect = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Round to nearest 15 minutes for better UX, but keep it close to actual time
    const roundedMinute = Math.round(currentMinute / 15) * 15
    const adjustedMinute = roundedMinute >= 60 ? 0 : roundedMinute
    const adjustedHour = roundedMinute >= 60 ? currentHour + 1 : currentHour

    const startTimeStr = `${adjustedHour.toString().padStart(2, "0")}:${adjustedMinute.toString().padStart(2, "0")}`
    const endTimeStr = addHoursToTime(startTimeStr, 1)

    setTimeRange({ start: startTimeStr, end: endTimeStr })
    setSelectionStep("start")
    onChange(startTimeStr, endTimeStr)
    setIsOpen(false)
  }

  const formatDisplayTime = (timeString?: string | null) => {
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

  // Compare two time strings (HH:MM)
  const compareTimeStrings = (time1: string, time2: string): number => {
    const [hours1, minutes1] = time1.split(":").map(Number)
    const [hours2, minutes2] = time2.split(":").map(Number)

    if (hours1 !== hours2) {
      return hours1 - hours2
    }
    return minutes1 - minutes2
  }

  // Get next logical period after the selected time
  const getNextPeriod = (
    period: "night" | "morning" | "afternoon" | "evening",
  ): "night" | "morning" | "afternoon" | "evening" => {
    switch (period) {
      case "night":
        return "morning"
      case "morning":
        return "afternoon"
      case "afternoon":
        return "evening"
      case "evening":
        return "night"
    }
  }

  // IMPROVED: Generate time options with 15-minute intervals for better precision
  const getTimesByPeriod = (period: "night" | "morning" | "afternoon" | "evening") => {
    const times = []
    let startHour = 0
    let endHour = 24

    switch (period) {
      case "night":
        startHour = 0 // 12 AM
        endHour = 6 // 6 AM
        break
      case "morning":
        startHour = 6 // 6 AM
        endHour = 12 // 12 PM
        break
      case "afternoon":
        startHour = 12 // 12 PM
        endHour = 18 // 6 PM
        break
      case "evening":
        startHour = 18 // 6 PM
        endHour = 24 // 12 AM (next day)
        break
    }

    // FIXED: Use 15-minute intervals instead of 30-minute
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        const displayTime = formatDisplayTime(timeString)
        times.push({ value: timeString, display: displayTime })
      }
    }

    return times
  }

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case "night":
        return "🌙"
      case "morning":
        return "🌅"
      case "afternoon":
        return "☀️"
      case "evening":
        return "🌆"
      default:
        return "⏰"
    }
  }

  const getPeriodFromTime = (timeString: string): "night" | "morning" | "afternoon" | "evening" => {
    const hour = Number.parseInt(timeString.split(":")[0])
    if (hour >= 0 && hour < 6) return "night"
    if (hour >= 6 && hour < 12) return "morning"
    if (hour >= 12 && hour < 18) return "afternoon"
    return "evening"
  }

  const getDisplayText = () => {
    if (!timeRange.start) return placeholder

    if (timeRange.start && timeRange.end) {
      return `${formatDisplayTime(timeRange.start)} - ${formatDisplayTime(timeRange.end)}`
    }

    return formatDisplayTime(timeRange.start)
  }

  const getDurationText = () => {
    if (!timeRange.start || !timeRange.end) return null

    const [startHours, startMinutes] = timeRange.start.split(":").map(Number)
    const [endHours, endMinutes] = timeRange.end.split(":").map(Number)

    let durationMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes)

    // Handle negative duration (if end is earlier than start)
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60 // Add a day
    }

    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60

    if (hours === 0) {
      return `${minutes}m`
    } else if (minutes === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${minutes}m`
    }
  }

  // Get gradient color for time buttons
  const getTimeButtonStyle = (timeValue: string) => {
    const isStartTime = timeRange.start === timeValue
    const isEndTime = timeRange.end === timeValue

    if (isStartTime && isEndTime) {
      // Single time selection - green to red gradient
      return "bg-gradient-to-r from-green-500 to-red-500 text-white hover:from-green-600 hover:to-red-600 border-transparent"
    } else if (isStartTime) {
      return "bg-green-500 text-white hover:bg-green-600 border-green-500"
    } else if (isEndTime) {
      return "bg-red-500 text-white hover:bg-red-600 border-red-500"
    }

    // Check if time is in range
    if (timeRange.start && timeRange.end && !isStartTime && !isEndTime) {
      const timeHour = Number.parseInt(timeValue.split(":")[0])
      const timeMinute = Number.parseInt(timeValue.split(":")[1])
      const timeInMinutes = timeHour * 60 + timeMinute

      const startHour = Number.parseInt(timeRange.start.split(":")[0])
      const startMinute = Number.parseInt(timeRange.start.split(":")[1])
      const startInMinutes = startHour * 60 + startMinute

      const endHour = Number.parseInt(timeRange.end.split(":")[0])
      const endMinute = Number.parseInt(timeRange.end.split(":")[1])
      const endInMinutes = endHour * 60 + endMinute

      if (timeInMinutes > startInMinutes && timeInMinutes < endInMinutes) {
        return "bg-gradient-to-r from-green-200 to-red-200 text-gray-700 border-transparent"
      }
    }

    return ""
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          // FIXED: Only set current time when opening and no times are set, and user explicitly wants it
          if (open && !timeRange.start && !timeRange.end && !startTime && !endTime) {
            // Don't auto-set time, let user choose
            const now = new Date()
            const currentHour = now.getHours()
            setSelectedPeriod(getPeriodFromTime(`${currentHour.toString().padStart(2, "0")}:00`))
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-12 relative cursor-pointer",
              !timeRange.start && "text-muted-foreground",
            )}
            disabled={disabled}
          >
            <Clock className="mr-2 h-4 w-4" />
            <span className="flex-1">
              {timeRange.start ? (
                <div className="flex items-center gap-2">
                  {timeRange.start && <span>{getPeriodIcon(getPeriodFromTime(timeRange.start))}</span>}
                  <span className="font-medium">{getDisplayText()}</span>
                </div>
              ) : (
                placeholder
              )}
            </span>
            {timeRange.start && timeRange.end && (
              <Badge variant="secondary" className="ml-2">
                {getDurationText()}
              </Badge>
            )}
            {timeRange.start && (
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
          {/* MOBILE OPTIMIZED LAYOUT */}
          <div className="bg-white rounded-lg shadow-lg border w-full max-w-[95vw] sm:max-w-[420px]">
            {/* Header - Mobile Friendly */}
            <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-green-50 to-red-50">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs sm:text-sm border-2 px-2 py-1",
                    selectionStep === "start"
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-red-500 text-white border-red-500",
                  )}
                >
                  {selectionStep === "start" ? "🟢 Start" : "🔴 End"}
                  <span className="hidden sm:inline ml-1">
                    {selectionStep === "start" ? "Select start time" : "Select end time"}
                  </span>
                </Badge>

                {timeRange.start && !timeRange.end && (
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                    <span className="text-green-600 font-medium">{formatDisplayTime(timeRange.start)}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>?</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Select - Mobile Friendly */}
            <div className="p-3 sm:p-4 border-b">
              <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-gray-600">Quick Select</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCurrentTimeSelect}
                  className="justify-start bg-gradient-to-r from-green-100 to-red-100 hover:from-green-200 hover:to-red-200 text-xs h-8 sm:h-9"
                >
                  <span className="mr-1 sm:mr-2">⏰</span>
                  <span className="hidden sm:inline">Now (1 hour)</span>
                  <span className="sm:hidden">Now</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect("09:00", "10:00")}
                  className="justify-start text-xs h-8 sm:h-9"
                >
                  <span className="mr-1 sm:mr-2">🌅</span>
                  <span className="hidden sm:inline">9-10 AM</span>
                  <span className="sm:hidden">9-10</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect("12:00", "13:00")}
                  className="justify-start text-xs h-8 sm:h-9"
                >
                  <span className="mr-1 sm:mr-2">☀️</span>
                  <span className="hidden sm:inline">12-1 PM</span>
                  <span className="sm:hidden">12-1</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect("18:00", "19:00")}
                  className="justify-start text-xs h-8 sm:h-9"
                >
                  <span className="mr-1 sm:mr-2">🌆</span>
                  <span className="hidden sm:inline">6-7 PM</span>
                  <span className="sm:hidden">6-7</span>
                </Button>
              </div>
            </div>

            {/* Period Selector - Mobile Friendly */}
            <div className="p-3 sm:p-4 border-b">
              <div className="flex gap-1 mb-3 sm:mb-4">
                {(["night", "morning", "afternoon", "evening"] as const).map((period) => (
                  <Button
                    key={period}
                    type="button"
                    variant={selectedPeriod === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className="flex-1 text-xs h-8 sm:h-9 px-1 sm:px-2"
                  >
                    <span className="mr-1">{getPeriodIcon(period)}</span>
                    <span className="hidden sm:inline">{period.charAt(0).toUpperCase() + period.slice(1)}</span>
                    <span className="sm:hidden">{period.charAt(0).toUpperCase()}</span>
                  </Button>
                ))}
              </div>

              {/* Time Grid - Mobile Optimized */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 sm:gap-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {getTimesByPeriod(selectedPeriod).map((time) => {
                  const isStartTime = timeRange.start === time.value
                  const isEndTime = timeRange.end === time.value
                  const customStyle = getTimeButtonStyle(time.value)

                  return (
                    <Button
                      key={time.value}
                      type="button"
                      variant={isStartTime || isEndTime ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "text-xs h-8 sm:h-10 justify-center transition-all duration-200 px-1 sm:px-2",
                        customStyle,
                      )}
                      onClick={() => handleTimeSelect(time.value)}
                    >
                      <span className="text-xs sm:text-sm">{time.display}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Current Selection - Mobile Friendly */}
            {timeRange.start && (
              <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-red-50 text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                  {timeRange.start && (
                    <>
                      <span className="text-base sm:text-lg">{getPeriodIcon(getPeriodFromTime(timeRange.start))}</span>
                      <span className="font-medium text-green-600 text-sm sm:text-base">
                        {formatDisplayTime(timeRange.start)}
                      </span>
                    </>
                  )}

                  {timeRange.end && (
                    <>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 text-gray-400" />
                      <span className="text-base sm:text-lg">{getPeriodIcon(getPeriodFromTime(timeRange.end))}</span>
                      <span className="font-medium text-red-600 text-sm sm:text-base">
                        {formatDisplayTime(timeRange.end)}
                      </span>
                      <Badge variant="outline" className="ml-1 bg-white text-xs">
                        {getDurationText()}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
