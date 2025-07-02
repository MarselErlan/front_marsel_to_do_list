"use client"

import type React from "react"

import { useState } from "react"
import { Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  label: string
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TimePicker({
  label,
  value,
  onChange,
  placeholder = "Select time",
  disabled,
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTimeSelect = (time: string) => {
    onChange(time)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
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

  // Generate time options (every 15 minutes)
  const timeOptions = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      const displayTime = formatDisplayTime(timeString)
      timeOptions.push({ value: timeString, display: displayTime })
    }
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
            {value ? <span className="font-medium">{formatDisplayTime(value)}</span> : <span>{placeholder}</span>}
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
          <div className="bg-white rounded-lg shadow-lg border animate-in zoom-in-95 duration-200">
            <div className="p-4">
              <h4 className="font-medium text-center mb-3">Select Time</h4>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {timeOptions.map((time) => (
                  <Button
                    type="button"
                    key={time.value}
                    variant={value === time.value ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-9 justify-center"
                    onClick={() => handleTimeSelect(time.value)}
                  >
                    {time.display}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
