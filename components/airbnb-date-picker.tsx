"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DateRange {
  start: Date | null
  end: Date | null
}

interface AirbnbDatePickerProps {
  label: string
  startDate?: string
  endDate?: string
  onChange: (startDate: string | undefined, endDate: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  allowRange?: boolean
}

export function AirbnbDatePicker({
  label,
  startDate,
  endDate,
  onChange,
  placeholder = "Select dates",
  disabled,
  className,
  allowRange = false,
}: AirbnbDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null })
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectionStep, setSelectionStep] = useState<"start" | "end">("start")

  // FIXED: Better date parsing to avoid timezone issues
  const parseDate = (dateString: string): Date => {
    // Parse YYYY-MM-DD format and create date in local timezone
    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    return date
  }

  // FIXED: Better date formatting to avoid timezone issues
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // FIXED: Initialize from props with better error handling
  useEffect(() => {
    console.log("🔄 Initializing date picker with:", { startDate, endDate })

    try {
      let start: Date | null = null
      let end: Date | null = null

      if (startDate) {
        start = parseDate(startDate)
        console.log("📅 Parsed start date:", startDate, "→", start)
      }

      if (endDate) {
        end = parseDate(endDate)
        console.log("📅 Parsed end date:", endDate, "→", end)
      }

      setDateRange({ start, end })

      // Set selection step based on what we have
      if (allowRange) {
        if (start && end) {
          setSelectionStep("start") // Ready for new selection
          console.log("✅ Both dates set, ready for new selection")
        } else if (start && !end) {
          setSelectionStep("end") // Need to pick end date
          console.log("🟡 Start date set, need end date")
        } else {
          setSelectionStep("start") // Need to pick start date
          console.log("🔴 No dates set, need start date")
        }
      }

      // Set current month to show the selected date or current month
      if (start) {
        setCurrentMonth(new Date(start.getFullYear(), start.getMonth(), 1))
      }
    } catch (error) {
      console.error("❌ Error parsing dates:", error)
      // Reset to safe state
      setDateRange({ start: null, end: null })
      setSelectionStep("start")
    }
  }, [startDate, endDate, allowRange])

  const handleDateClick = (date: Date) => {
    // FIXED: Create clean date without time components
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    console.log("🎯 Date clicked:", selectedDate, "→ API format:", formatDateForAPI(selectedDate))

    if (!allowRange) {
      // Single date selection
      setDateRange({ start: selectedDate, end: selectedDate })
      const dateStr = formatDateForAPI(selectedDate)
      console.log("📅 Single date selected:", dateStr)
      onChange(dateStr, dateStr)
      setIsOpen(false)
      return
    }

    // Range selection logic
    if (selectionStep === "start") {
      // Step 1: Pick start date
      console.log("🟢 STEP 1: Selected START date:", formatDateForAPI(selectedDate))
      setDateRange({ start: selectedDate, end: null })
      setSelectionStep("end")
      setHoverDate(null)
      const dateStr = formatDateForAPI(selectedDate)
      onChange(dateStr, undefined)
    } else if (selectionStep === "end") {
      // Step 2: Pick end date
      const start = dateRange.start!

      console.log("🔴 STEP 2: Selected END date:", formatDateForAPI(selectedDate))
      console.log("📊 Comparing dates:", {
        start: formatDateForAPI(start),
        end: formatDateForAPI(selectedDate),
        same: selectedDate.getTime() === start.getTime(),
      })

      // If clicking the same date as start, make it a single day
      if (selectedDate.getTime() === start.getTime()) {
        console.log("✅ Same day selected - single day task")
        setDateRange({ start, end: selectedDate })
        const dateStr = formatDateForAPI(selectedDate)
        onChange(dateStr, dateStr)
        setSelectionStep("start")
        setHoverDate(null)
        setIsOpen(false)
        return
      }

      // If clicking a different date, create range
      let finalStart = start
      let finalEnd = selectedDate

      // Ensure start is before end
      if (selectedDate < start) {
        finalStart = selectedDate
        finalEnd = start
        console.log("🔄 Swapped dates - start was after end")
      }

      console.log("📅 Final range:", formatDateForAPI(finalStart), "to", formatDateForAPI(finalEnd))

      setDateRange({ start: finalStart, end: finalEnd })
      onChange(formatDateForAPI(finalStart), formatDateForAPI(finalEnd))
      setSelectionStep("start")
      setHoverDate(null)
      setIsOpen(false)
    }
  }

  const handleDateHover = (date: Date | null) => {
    if (allowRange && selectionStep === "end" && dateRange.start && date) {
      const hoverDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      setHoverDate(hoverDate)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("🗑️ Clearing date selection")
    setDateRange({ start: null, end: null })
    setSelectionStep("start")
    setHoverDate(null)
    onChange(undefined, undefined)
  }

  const handleQuickSelect = (days: number, type: "days" | "months" | "years" = "days") => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)

    switch (type) {
      case "days":
        end.setDate(start.getDate() + days - 1)
        break
      case "months":
        end.setMonth(start.getMonth() + days)
        end.setDate(end.getDate() - 1)
        break
      case "years":
        end.setFullYear(start.getFullYear() + days)
        end.setDate(end.getDate() - 1)
        break
    }

    console.log("⚡ Quick select:", formatDateForAPI(start), "to", formatDateForAPI(end))
    setDateRange({ start, end })
    setSelectionStep("start")
    setHoverDate(null)
    onChange(formatDateForAPI(start), formatDateForAPI(end))
    setIsOpen(false)
  }

  const handleTodaySelect = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    console.log("📅 Today selected:", formatDateForAPI(today))
    setDateRange({ start: today, end: today })
    setSelectionStep("start")
    setHoverDate(null)
    const todayStr = formatDateForAPI(today)
    onChange(todayStr, todayStr)
    setIsOpen(false)
  }

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const isDateInRange = (date: Date): boolean => {
    if (!dateRange.start) return false

    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (dateRange.end) {
      // Show actual selected range
      return checkDate >= dateRange.start && checkDate <= dateRange.end
    }

    // Show hover preview range when selecting end date
    if (allowRange && hoverDate && selectionStep === "end") {
      const start = dateRange.start
      const end = hoverDate > start ? hoverDate : start
      const rangeStart = hoverDate > start ? start : hoverDate
      return checkDate >= rangeStart && checkDate <= end
    }

    // Show only start date
    return checkDate.getTime() === dateRange.start.getTime()
  }

  const isDateRangeStart = (date: Date): boolean => {
    if (!dateRange.start) return false
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (allowRange && hoverDate && selectionStep === "end") {
      const start = dateRange.start
      return checkDate.getTime() === (hoverDate > start ? start : hoverDate).getTime()
    }

    return checkDate.getTime() === dateRange.start.getTime()
  }

  const isDateRangeEnd = (date: Date): boolean => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (dateRange.end) {
      return checkDate.getTime() === dateRange.end.getTime()
    }

    if (allowRange && hoverDate && selectionStep === "end" && dateRange.start) {
      const start = dateRange.start
      return checkDate.getTime() === (hoverDate > start ? hoverDate : start).getTime()
    }

    return false
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const renderCalendar = (monthOffset = 0) => {
    const displayMonth = new Date(currentMonth)
    displayMonth.setMonth(currentMonth.getMonth() + monthOffset)

    const year = displayMonth.getFullYear()
    const month = displayMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const isCurrentMonth = date.getMonth() === month
      const isToday = date.getTime() === today.getTime()
      const isPast = date < today
      const inRange = isDateInRange(date)
      const isRangeStart = isDateRangeStart(date)
      const isRangeEnd = isDateRangeEnd(date)

      days.push(
        <button
          key={i}
          type="button"
          onClick={() => !isPast && isCurrentMonth && handleDateClick(date)}
          onMouseEnter={() => isCurrentMonth && !isPast && handleDateHover(date)}
          onMouseLeave={() => handleDateHover(null)}
          disabled={isPast || !isCurrentMonth}
          className={cn(
            "h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm font-medium transition-all duration-200 relative",
            "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "touch-manipulation",
            {
              "text-gray-300": !isCurrentMonth,
              "text-gray-400 cursor-not-allowed": isPast,
              "bg-blue-500 text-white hover:bg-blue-600": isRangeStart || isRangeEnd,
              "bg-blue-100 text-blue-800": inRange && !isRangeStart && !isRangeEnd,
              "font-bold ring-2 ring-green-400": isToday,
              "rounded-l-full": allowRange && isRangeStart && (dateRange.end || hoverDate),
              "rounded-r-full": allowRange && isRangeEnd && dateRange.start !== dateRange.end,
              "rounded-full":
                !allowRange ||
                (isRangeStart && (!dateRange.end || dateRange.start?.getTime() === dateRange.end?.getTime())),
            },
          )}
        >
          {date.getDate()}
        </button>,
      )
    }

    return (
      <div className="p-3 sm:p-4">
        <div className="text-center font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
          {displayMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
            <div
              key={day}
              className="h-8 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    )
  }

  const getDisplayText = () => {
    if (!dateRange.start) return placeholder

    if (dateRange.start && dateRange.end) {
      if (dateRange.start.getTime() === dateRange.end.getTime()) {
        return formatDisplayDate(dateRange.start)
      }
      return `${formatDisplayDate(dateRange.start)} - ${formatDisplayDate(dateRange.end)}`
    }

    return `${formatDisplayDate(dateRange.start)} - ?`
  }

  const getDayCount = () => {
    if (!dateRange.start || !dateRange.end) return null
    const diffTime = dateRange.end.getTime() - dateRange.start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
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
              !dateRange.start && "text-muted-foreground",
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="flex-1">{getDisplayText()}</span>
            {allowRange && getDayCount() && getDayCount()! > 1 && (
              <Badge variant="secondary" className="ml-2">
                {getDayCount()} day{getDayCount() !== 1 ? "s" : ""}
              </Badge>
            )}
            {dateRange.start && (
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
          <div className="bg-white rounded-lg shadow-lg border max-w-[95vw] sm:max-w-full">
            {/* Header - Clear Step Indicator */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="h-8 w-8 p-0 touch-manipulation"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 sm:gap-4">
                {allowRange ? (
                  <div className="flex items-center gap-2">
                    <Badge variant={selectionStep === "start" ? "default" : "secondary"} className="text-xs px-3 py-1">
                      {selectionStep === "start" ? "🟢 Step 1: Pick Start Date" : "🔴 Step 2: Pick End Date"}
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="default" className="text-xs px-2 py-1">
                    Select date
                  </Badge>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="h-8 w-8 p-0 touch-manipulation"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress indicator */}
            {allowRange && (
              <div className="px-3 sm:px-4 py-2 bg-gray-50 border-b text-center">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-white font-bold",
                      dateRange.start ? "bg-green-500" : selectionStep === "start" ? "bg-blue-500" : "bg-gray-300",
                    )}
                  >
                    1
                  </div>
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-white font-bold",
                      dateRange.end ? "bg-green-500" : selectionStep === "end" ? "bg-blue-500" : "bg-gray-300",
                    )}
                  >
                    2
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {selectionStep === "start"
                    ? "Pick your start date"
                    : dateRange.start
                      ? `Start: ${formatDisplayDate(dateRange.start)} → Pick end date (or same day for single day)`
                      : "Pick start date"}
                </p>
              </div>
            )}

            {/* Calendar Grid */}
            <div className="flex flex-col sm:flex-row overflow-x-auto">
              {renderCalendar(0)}
              <div className="hidden lg:block">{renderCalendar(1)}</div>
            </div>

            {/* Quick Select Options */}
            <div className="p-3 sm:p-4 border-t bg-gray-50">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTodaySelect}
                  className="text-xs bg-transparent h-8 touch-manipulation"
                >
                  Today Only
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(2)}
                  className="text-xs h-8 touch-manipulation"
                >
                  Tomorrow
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(7)}
                  className="text-xs h-8 touch-manipulation"
                >
                  Next Week
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(1, "months")}
                  className="text-xs h-8 touch-manipulation"
                >
                  Next Month
                </Button>
                {allowRange && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect(3)}
                      className="text-xs h-8 touch-manipulation"
                    >
                      3 days
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect(14)}
                      className="text-xs h-8 touch-manipulation"
                    >
                      2 weeks
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
