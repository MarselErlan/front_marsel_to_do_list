"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CalendarIcon, Clock, X, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  label: string
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  minDate?: Date
  disabled?: boolean
  className?: string
}

export function DateTimePicker({
  label,
  value,
  onChange,
  placeholder = "Select date and time",
  minDate,
  disabled,
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState("")
  const [step, setStep] = useState<"date" | "time">("date")

  // Initialize state from value
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          setSelectedDate(date)
          const hours = date.getHours().toString().padStart(2, "0")
          const minutes = date.getMinutes().toString().padStart(2, "0")
          setSelectedTime(`${hours}:${minutes}`)
        } else {
          console.warn("Invalid date value in useEffect:", value)
          setSelectedDate(undefined)
          setSelectedTime("")
        }
      } catch (error) {
        console.warn("Error parsing date in useEffect:", value, error)
        setSelectedDate(undefined)
        setSelectedTime("")
      }
    } else {
      setSelectedDate(undefined)
      setSelectedTime("")
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setStep("time")
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (selectedDate && time) {
      const [hours, minutes] = time.split(":").map(Number)
      const dateTime = new Date(selectedDate)
      dateTime.setHours(hours, minutes, 0, 0)
      onChange(dateTime.toISOString())
      setIsOpen(false)
      setStep("date")
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate(undefined)
    setSelectedTime("")
    onChange(undefined)
    setStep("date")
  }

  const formatDisplayValue = () => {
    if (!value) return null

    try {
      const date = new Date(value)
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date value:", value)
        return null
      }

      // Format date
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      // Format time
      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })

      return { date: dateStr, time: timeStr }
    } catch (error) {
      console.warn("Error formatting display value:", value, error)
      return null
    }
  }

  const displayValue = formatDisplayValue()

  // Generate time options (every 15 minutes)
  const timeOptions = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
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
              "w-full justify-start text-left font-normal h-auto p-3 relative",
              !value && "text-muted-foreground",
            )}
            disabled={disabled}
          >
            {displayValue ? (
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="font-medium">{displayValue.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{displayValue.time}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{placeholder}</span>
              </div>
            )}
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-gray-100"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="bg-white rounded-lg shadow-lg border">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <Badge variant={step === "date" ? "default" : "secondary"} className="text-xs">
                  1. Date
                </Badge>
                <Badge variant={step === "time" ? "default" : "secondary"} className="text-xs">
                  2. Time
                </Badge>
              </div>
              {step === "time" && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep("date")}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>

            {/* Date Selection */}
            {step === "date" && (
              <div className="animate-in slide-in-from-left-2 duration-200">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return minDate ? date < minDate : date < today
                  }}
                  initialFocus
                  className="p-3"
                />
              </div>
            )}

            {/* Time Selection */}
            {step === "time" && (
              <div className="p-4 animate-in slide-in-from-right-2 duration-200">
                <div className="space-y-3">
                  <h4 className="font-medium text-center">Select Time</h4>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {timeOptions.map((time) => (
                      <Button
                        type="button"
                        key={time.value}
                        variant={selectedTime === time.value ? "default" : "outline"}
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
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
