"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  label: string
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  minDate?: Date
  disabled?: boolean
  className?: string
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  disabled,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  // Initialize state from value
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          setSelectedDate(date)
        } else {
          console.warn("Invalid date value in useEffect:", value)
          setSelectedDate(undefined)
        }
      } catch (error) {
        console.warn("Error parsing date in useEffect:", value, error)
        setSelectedDate(undefined)
      }
    } else {
      setSelectedDate(undefined)
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      // Format as YYYY-MM-DD
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")
      onChange(`${year}-${month}-${day}`)
      setIsOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate(undefined)
    onChange(undefined)
  }

  const formatDisplayValue = () => {
    if (!value) return null

    try {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        console.warn("Invalid date value:", value)
        return null
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      console.warn("Error formatting date display:", value, error)
      return null
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
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? <span className="font-medium">{formatDisplayValue()}</span> : <span>{placeholder}</span>}
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
        </PopoverContent>
      </Popover>
    </div>
  )
}
