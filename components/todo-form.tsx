"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Loader2, Sparkles, Calendar, Clock } from "lucide-react"
import { AirbnbDatePicker } from "./airbnb-date-picker"
import { AirbnbTimeRangePicker } from "./airbnb-time-range-picker"
import type { TodoCreate } from "../lib/api"

interface TodoFormProps {
  onSubmit: (todo: TodoCreate) => Promise<void>
  isLoading?: boolean
}

export function TodoForm({ onSubmit, isLoading }: TodoFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<string | undefined>()
  const [endDate, setEndDate] = useState<string | undefined>()
  const [startTime, setStartTime] = useState<string | undefined>()
  const [endTime, setEndTime] = useState<string | undefined>()

  // Reset form on component mount/reload
  useEffect(() => {
    setTitle("")
    setDescription("")
    setStartDate(undefined)
    setEndDate(undefined)
    setStartTime(undefined)
    setEndTime(undefined)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const todoData: TodoCreate = {
      title: title.trim(),
      description: description.trim() || undefined,
      start_date: startDate,
      start_time: startTime,
      end_date: endDate,
      end_time: endTime,
      due_date: endDate, // Use end date as due date automatically
    }

    console.log("📝 Creating todo with data:", todoData)
    await onSubmit(todoData)

    // Reset form
    setTitle("")
    setDescription("")
    setStartDate(undefined)
    setEndDate(undefined)
    setStartTime(undefined)
    setEndTime(undefined)
  }

  const handleDateRangeChange = (start: string | undefined, end: string | undefined) => {
    console.log("📅 Date range changed:", { start, end })
    setStartDate(start)
    setEndDate(end)
  }

  const handleTimeRangeChange = (start: string | undefined, end: string | undefined) => {
    console.log("⏰ Time range changed:", { start, end })
    setStartTime(start)
    setEndTime(end)
  }

  return (
    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
            Create New Task
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="What needs to be done? ✨"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg h-14 border-2 focus:border-blue-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              disabled={isLoading}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add more details about this task... (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none border-2 focus:border-blue-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              disabled={isLoading}
            />
          </div>

          {/* Time Scheduling */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-700">Schedule (Optional)</h3>
            </div>

            <div className="grid gap-6">
              {/* Task Duration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <h4 className="font-medium">Task Duration</h4>
                </div>
                <AirbnbDatePicker
                  label="Start & End Dates"
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateRangeChange}
                  placeholder="Select task duration"
                  disabled={isLoading}
                  allowRange={true}
                />
              </div>

              {/* Time Range */}
              {(startDate || endDate) && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <h4 className="font-medium">Time Range (Optional)</h4>
                  </div>
                  <AirbnbTimeRangePicker
                    label="Start & End Times"
                    startTime={startTime}
                    endTime={endTime}
                    onChange={handleTimeRangeChange}
                    placeholder="Select time range"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={!title.trim() || isLoading}
            className="w-full h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-[1.02] shadow-xl text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-3" />
                Creating Magic...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-3" />
                Create Task
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
