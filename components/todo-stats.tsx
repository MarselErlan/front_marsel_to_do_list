"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react"
import type { Todo } from "../lib/api"

interface TodoStatsProps {
  todos: Todo[]
}

export function TodoStats({ todos }: TodoStatsProps) {
  const totalTasks = todos.length
  const completedTasks = todos.filter((todo) => todo.done).length
  const pendingTasks = totalTasks - completedTasks
  const overdueTasks = todos.filter((todo) => {
    if (todo.done || !todo.due_date) return false
    const today = new Date().toISOString().split("T")[0]
    return todo.due_date < today
  }).length

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stats = [
    {
      label: "Total",
      value: totalTasks,
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      textColor: "text-blue-700",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      textColor: "text-green-700",
    },
    {
      label: "Pending",
      value: pendingTasks,
      icon: Clock,
      color: "from-orange-500 to-yellow-500",
      bgColor: "from-orange-50 to-yellow-50",
      textColor: "text-orange-700",
    },
    {
      label: "Overdue",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "from-red-500 to-pink-500",
      bgColor: "from-red-50 to-pink-50",
      textColor: "text-red-700",
    },
  ]

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {completionRate}%
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{completedTasks} completed</span>
            <span>{totalTasks} total tasks</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className={`p-4 bg-gradient-to-br ${stat.bgColor} relative`}>
              <div
                className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8`}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                  <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
                </div>
                <p className={`text-sm font-medium ${stat.textColor} opacity-80`}>{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
