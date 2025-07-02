"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Check, X, Loader2, AlertTriangle, CheckCircle2, Clock, Calendar } from "lucide-react"
import { AirbnbDatePicker } from "./airbnb-date-picker"
import { AirbnbTimeRangePicker } from "./airbnb-time-range-picker"
import type { Todo, TodoUpdate } from "../lib/api"

interface TodoItemProps {
  todo: Todo
  onUpdate: (id: number, updates: TodoUpdate) => Promise<void>
  onDelete: (id: number) => Promise<void>
  isLoading?: boolean
}

export function TodoItem({ todo, onUpdate, onDelete, isLoading }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || "")
  const [editStartDate, setEditStartDate] = useState<string | undefined>(todo.start_date)
  const [editEndDate, setEditEndDate] = useState<string | undefined>(todo.end_date)
  const [editStartTime, setEditStartTime] = useState<string | undefined>(todo.start_time)
  const [editEndTime, setEditEndTime] = useState<string | undefined>(todo.end_time)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleComplete = async (checked: boolean) => {
    console.log(`🔄 Toggling todo ${todo.id} from ${todo.done} to ${checked}`)
    setIsUpdating(true)
    try {
      await onUpdate(todo.id, { done: checked })
      console.log(`✅ Successfully updated todo ${todo.id} to done: ${checked}`)
    } catch (error) {
      console.error(`❌ Failed to update todo ${todo.id}:`, error)
      alert(`Failed to update todo: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editTitle.trim()) return

    setIsUpdating(true)
    try {
      const updates: TodoUpdate = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        start_date: editStartDate,
        start_time: editStartTime,
        end_date: editEndDate,
        end_time: editEndTime,
        due_date: editEndDate, // Use end date as due date
      }
      await onUpdate(todo.id, updates)
      setIsEditing(false)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || "")
    setEditStartDate(todo.start_date)
    setEditEndDate(todo.end_date)
    setEditStartTime(todo.start_time)
    setEditEndTime(todo.end_time)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(todo.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDateRangeChange = (start: string | undefined, end: string | undefined) => {
    setEditStartDate(start)
    setEditEndDate(end)
  }

  const handleTimeRangeChange = (start: string | undefined, end: string | undefined) => {
    setEditStartTime(start)
    setEditEndTime(end)
  }

  // Helper functions for time display
  const formatDateTime = (dateString?: string, timeString?: string) => {
    if (!dateString || !timeString) return null
    try {
      const [hours, minutes] = timeString.split(":")
      const date = new Date(dateString)
      date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      console.warn("Error formatting date/time:", dateString, timeString, error)
      return null
    }
  }

  // Check if task is overdue
  const isOverdue = () => {
    if (!todo.due_date || todo.done) return false
    const today = new Date().toISOString().split("T")[0]
    return todo.due_date < today
  }

  // Get due date status
  const getDueDateStatus = () => {
    if (!todo.due_date) return null

    const today = new Date()
    const dueDate = new Date(todo.due_date)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (todo.done) {
      return { text: "Completed", variant: "secondary" as const, icon: CheckCircle2, color: "green" }
    } else if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)}d overdue`,
        variant: "destructive" as const,
        icon: AlertTriangle,
        color: "red",
      }
    } else if (diffDays === 0) {
      return { text: "Due today", variant: "default" as const, icon: Clock, color: "orange" }
    } else if (diffDays === 1) {
      return { text: "Due tomorrow", variant: "secondary" as const, icon: Clock, color: "blue" }
    } else {
      return { text: `${diffDays}d left`, variant: "outline" as const, icon: Clock, color: "gray" }
    }
  }

  const dueDateStatus = getDueDateStatus()
  const startTime = formatDateTime(todo.start_date, todo.start_time)
  const endTime = formatDateTime(todo.end_date, todo.end_time)

  return (
    <Card
      className={`
        transition-all duration-300 hover:shadow-xl border-0 overflow-hidden
        ${
          todo.done
            ? "bg-gradient-to-r from-gray-50 to-gray-100 opacity-75"
            : "bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:scale-[1.02]"
        }
        ${isDeleting ? "animate-pulse" : ""}
        ${isOverdue() ? "bg-gradient-to-r from-red-50 to-pink-50 border-red-200" : ""}
      `}
    >
      <CardContent className="p-0">
        {isEditing ? (
          // Edit Mode - Full Screen on Mobile
          <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-medium border-2 focus:border-blue-400 h-12"
                disabled={isUpdating}
                placeholder="Task title..."
              />

              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-[80px] resize-none border-2 focus:border-blue-400"
                disabled={isUpdating}
                placeholder="Task description..."
              />
            </div>

            <div className="space-y-6">
              {/* Date Range */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Task Duration
                </h4>
                <AirbnbDatePicker
                  label="Start & End Dates"
                  startDate={editStartDate}
                  endDate={editEndDate}
                  onChange={handleDateRangeChange}
                  disabled={isUpdating}
                  allowRange={true}
                />
              </div>

              {/* Time Range */}
              {(editStartDate || editEndDate) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Range
                  </h4>
                  <AirbnbTimeRangePicker
                    label="Start & End Times"
                    startTime={editStartTime}
                    endTime={editEndTime}
                    onChange={handleTimeRangeChange}
                    disabled={isUpdating}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || isUpdating}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-12"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="px-6 h-12 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // View Mode - Beautiful Card Design
          <div className="relative">
            {/* Gradient Border */}
            <div
              className={`
              absolute top-0 left-0 w-1 h-full
              ${
                todo.done
                  ? "bg-gray-300"
                  : isOverdue()
                    ? "bg-gradient-to-b from-red-400 to-pink-500"
                    : "bg-gradient-to-b from-blue-400 to-purple-500"
              }
            `}
            />

            <div className="p-4 pl-6">
              <div className="flex items-start gap-4">
                {/* Custom Checkbox */}
                <div className="flex flex-col items-center gap-2 pt-1">
                  <div className="relative">
                    <Checkbox
                      checked={todo.done}
                      onCheckedChange={handleToggleComplete}
                      disabled={isLoading || isUpdating}
                      className="w-6 h-6 rounded-full border-2 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-400 data-[state=checked]:to-emerald-500 data-[state=checked]:border-green-400"
                    />
                    {isUpdating && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>

                  {/* Time Pills */}
                  {(startTime || endTime) && (
                    <div className="flex flex-col gap-1">
                      {startTime && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-green-700">{startTime}</span>
                        </div>
                      )}
                      {endTime && startTime !== endTime && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-red-100 to-pink-100 px-2 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span className="text-xs font-medium text-red-700">{endTime}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="space-y-2">
                    <h3
                      className={`
                        text-lg font-semibold leading-tight break-words
                        ${todo.done ? "line-through text-gray-500" : "text-gray-900"}
                      `}
                    >
                      {todo.title}
                    </h3>

                    {todo.description && (
                      <p
                        className={`
                          text-sm leading-relaxed break-words
                          ${todo.done ? "line-through text-gray-400" : "text-gray-600"}
                        `}
                      >
                        {todo.description}
                      </p>
                    )}

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {dueDateStatus && (
                        <Badge
                          variant={dueDateStatus.variant}
                          className={`
                            flex items-center gap-1 text-xs font-medium px-2 py-1
                            ${dueDateStatus.color === "green" && "bg-green-100 text-green-700 border-green-200"}
                            ${dueDateStatus.color === "red" && "bg-red-100 text-red-700 border-red-200"}
                            ${dueDateStatus.color === "orange" && "bg-orange-100 text-orange-700 border-orange-200"}
                            ${dueDateStatus.color === "blue" && "bg-blue-100 text-blue-700 border-blue-200"}
                            ${dueDateStatus.color === "gray" && "bg-gray-100 text-gray-700 border-gray-200"}
                          `}
                        >
                          <dueDateStatus.icon className="w-3 h-3" />
                          {dueDateStatus.text}
                        </Badge>
                      )}

                      {(startTime || endTime) && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-200 text-xs"
                        >
                          <Clock className="w-3 h-3" />
                          Scheduled
                          {startTime && endTime && startTime !== endTime && (
                            <span className="font-medium ml-1">
                              {(() => {
                                const [startHours, startMinutes] = todo.start_time!.split(":").map(Number)
                                const [endHours, endMinutes] = todo.end_time!.split(":").map(Number)
                                let durationMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes)
                                if (durationMinutes < 0) durationMinutes += 24 * 60
                                const hours = Math.floor(durationMinutes / 60)
                                const minutes = durationMinutes % 60
                                return hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}` : `${minutes}m`
                              })()}
                            </span>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading || isUpdating}
                    className="w-10 h-10 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={isLoading || isDeleting}
                    className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
