"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Loader2, Calendar, Plus } from "lucide-react"
import {
  todoApi,
  type Todo,
  type TodoCreate,
  type TodoUpdate,
  type UserCreate,
  type LoginCredentials,
  type User as ApiUser,
} from "../lib/api"
import { TodoForm } from "../components/todo-form"
import { TodoItem } from "../components/todo-item"
import { TodoStats } from "../components/todo-stats"
import { DemoModeBanner } from "../components/demo-mode-banner"
import { CORSSetupGuide } from "../components/cors-setup-guide"
import { PickerTest } from "../components/picker-test"
import { AuthModal } from "../components/auth-modal"
import { UserMenu } from "../components/user-menu"
import { AuthOverlay } from "../components/auth-overlay"
import { UserCountDisplay } from "../components/user-count-display"
import { ForgotPasswordModal } from "../components/forgot-password-modal"

type FilterType = "all" | "today" | "week" | "month" | "year" | "overdue" | "pending" | "completed"

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [user, setUser] = useState<ApiUser | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [isAuthRequired, setIsAuthRequired] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Check API connection on component mount
  useEffect(() => {
    checkAuthentication()
    checkConnection()
  }, [])

  // Load todos when filter changes
  useEffect(() => {
    if (!isLoading && !isAuthRequired) {
      loadTodos()
    }
  }, [filter, isAuthRequired])

  const checkAuthentication = async () => {
    setIsCheckingAuth(true)
    const token = todoApi.getAuthToken()

    if (token) {
      console.log("🔐 Found stored token, validating...")

      // Get stored user data
      const storedUser = localStorage.getItem("user_data")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          console.log("👤 Found stored user data:", userData.username)

          // Set user immediately to avoid UI flicker
          setUser(userData)
          setIsAuthRequired(false)

          // Validate token in background
          try {
            const isValid = await todoApi.validateToken()
            if (isValid) {
              console.log("✅ Token validation successful - user authenticated")
              todoApi.disableDemoMode() // Ensure demo mode is off for authenticated users
            } else {
              console.log("❌ Token validation failed - logging out")
              handleLogout()
            }
          } catch (error) {
            console.log("⚠️ Token validation error, but keeping user logged in:", error)
            // Don't logout on validation errors - might be network issues
            // Keep user logged in and let them use the app
            todoApi.disableDemoMode()
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error)
          handleLogout()
        }
      } else {
        console.log("❌ Token found but no user data - logging out")
        handleLogout()
      }
    } else {
      console.log("🔓 No token found - requiring authentication")
      setIsAuthRequired(true)
    }
    setIsCheckingAuth(false)
  }

  const handleLogin = async (credentials: LoginCredentials) => {
    setAuthLoading(true)
    try {
      const authToken = await todoApi.login(credentials)
      todoApi.setAuthToken(authToken.access_token)

      // Store user data (in a real app, you'd get this from a separate endpoint)
      const userData: ApiUser = {
        id: 1,
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        is_active: true,
      }
      setUser(userData)
      localStorage.setItem("user_data", JSON.stringify(userData))

      setShowAuthModal(false)
      setIsAuthRequired(false)

      // Reload todos after login
      await loadTodos()
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async (userData: UserCreate) => {
    setAuthLoading(true)
    try {
      const newUser = await todoApi.register(userData)

      // Auto-login after registration
      const authToken = await todoApi.login({
        username: userData.username,
        password: userData.password,
      })
      todoApi.setAuthToken(authToken.access_token)

      setUser(newUser)
      localStorage.setItem("user_data", JSON.stringify(newUser))

      setShowAuthModal(false)
      setIsAuthRequired(false)

      // Reload todos after registration
      await loadTodos()
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    todoApi.clearAuthToken()
    localStorage.removeItem("user_data")
    setUser(null)
    setTodos([])
    setIsAuthRequired(true)
    todoApi.enableDemoMode() // Switch back to demo mode
  }

  const checkConnection = async () => {
    try {
      setIsRetrying(true)
      console.log("🔍 Checking backend connection...")

      const connected = await todoApi.healthCheck()
      setIsConnected(connected)

      if (connected) {
        console.log("✅ Connected to backend!")
        // Only disable demo mode if we're connected AND authenticated
        if (user) {
          console.log("👤 User authenticated - using real API")
          todoApi.disableDemoMode()
        } else {
          console.log("🔓 Not authenticated - enabling demo mode")
          todoApi.enableDemoMode()
        }
      } else {
        console.log("🎭 Backend not available, using demo mode")
        todoApi.enableDemoMode()
      }

      // Load todos regardless of connection status
      if (!isAuthRequired) {
        await loadTodos()
      }
    } catch (err) {
      console.error("Unexpected error during connection check:", err)
      setIsConnected(false)
      // Only enable demo mode if user is not authenticated
      if (!user) {
        todoApi.enableDemoMode()
      }
      if (!isAuthRequired) {
        await loadTodos()
      }
    } finally {
      setIsRetrying(false)
    }
  }

  const loadTodos = async () => {
    try {
      setIsLoading(true)
      console.log(`📥 Loading todos for filter: ${filter}`)

      let fetchedTodos: Todo[]

      switch (filter) {
        case "today":
          fetchedTodos = await todoApi.getTodosToday()
          break
        case "week":
          fetchedTodos = await todoApi.getTodosWeek()
          break
        case "month":
          fetchedTodos = await todoApi.getTodosMonth()
          break
        case "year":
          fetchedTodos = await todoApi.getTodosYear()
          break
        case "overdue":
          fetchedTodos = await todoApi.getTodosOverdue()
          break
        case "pending":
          fetchedTodos = (await todoApi.getTodos()).filter((todo) => !todo.done)
          break
        case "completed":
          fetchedTodos = (await todoApi.getTodos()).filter((todo) => todo.done)
          break
        default:
          fetchedTodos = await todoApi.getTodos()
      }

      console.log(`✅ Loaded ${fetchedTodos.length} todos for ${filter}`)
      setTodos(fetchedTodos)
    } catch (err) {
      console.error("❌ Error loading todos:", err)
      setTodos([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTodo = async (todoData: TodoCreate) => {
    try {
      setIsCreating(true)
      const newTodo = await todoApi.createTodo(todoData)

      // Add to current list if it matches the filter
      if (
        filter === "all" ||
        (filter === "pending" && !newTodo.done) ||
        (filter === "today" &&
          (newTodo.due_date === new Date().toISOString().split("T")[0] ||
            newTodo.start_date === new Date().toISOString().split("T")[0]))
      ) {
        setTodos((prev) => [newTodo, ...prev])
      }

      // Close form on mobile after creation
      setShowCreateForm(false)
    } catch (err) {
      console.error("Error creating todo:", err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateTodo = async (id: number, updates: TodoUpdate) => {
    console.log(`🔄 Updating todo ${id} with:`, updates)
    try {
      const updatedTodo = await todoApi.updateTodo(id, updates)
      console.log(`✅ Todo ${id} updated successfully:`, updatedTodo)
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updatedTodo : todo)))
    } catch (err) {
      console.error(`❌ Error updating todo ${id}:`, err)
      alert(`Failed to update todo: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoApi.deleteTodo(id)
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    } catch (err) {
      console.error("Error deleting todo:", err)
    }
  }

  const handleResetDemo = () => {
    todoApi.resetDemoData()
    loadTodos()
  }

  // Get filter counts for display
  const getFilterCount = (filterType: FilterType) => {
    switch (filterType) {
      case "all":
        return todos.length
      case "pending":
        return todos.filter((t) => !t.done).length
      case "completed":
        return todos.filter((t) => t.done).length
      default:
        return todos.length
    }
  }

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 text-sm">
      {isRetrying ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
      ) : isConnected ? (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 hidden sm:inline font-medium">Live</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-orange-600 hidden sm:inline font-medium">Demo</span>
        </>
      )}
    </div>
  )

  // Show loading screen only on initial load
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="p-8 max-w-sm w-full bg-white/90 backdrop-blur-lg border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Loader2 className="w-10 h-10 animate-spin text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-ping"></div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Task Planner
              </h1>
              <p className="text-gray-600 animate-pulse">Checking authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Clean whiteboard-style background with subtle grid - FIXED Z-INDEX */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

      {/* Subtle paper texture overlay - FIXED Z-INDEX */}
      <div className="fixed inset-0 z-0 opacity-[0.015] bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_70%)] pointer-events-none"></div>

      {/* Main App Content - HIGHER Z-INDEX */}
      <div
        className={`relative z-10 transition-all duration-300 ${isAuthRequired ? "blur-sm pointer-events-none" : ""}`}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Task Planner</h1>
                  <div className="flex items-center gap-2">
                    <ConnectionStatus />
                    {user && <span className="text-xs text-gray-500">Hi, {user.username}!</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UserCountDisplay />
                <UserMenu
                  username={user?.username || ""}
                  onLogout={handleLogout}
                  onOpenAuth={() => setShowAuthModal(true)}
                  onOpenResetPassword={() => setShowForgotPassword(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="pb-20">
          {/* Demo Mode Banner - only show if not connected */}
          {!isConnected && <DemoModeBanner onRetryConnection={checkConnection} isRetrying={isRetrying} />}

          {/* CORS Setup Guide - only show if in demo mode */}
          {!isConnected && <CORSSetupGuide />}

          {/* Picker Test Component - Remove after testing */}
          <PickerTest />

          {/* Stats Card */}
          <div className="p-4">
            <TodoStats todos={todos} />
          </div>

          {/* Desktop Create Form */}
          <div className="hidden sm:block px-4">
            <TodoForm onSubmit={handleCreateTodo} isLoading={isCreating} />
          </div>

          {/* Mobile Filter Tabs - HIGHER Z-INDEX */}
          <div className="px-4 mb-4 relative z-20">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
              {/* Horizontal Scrollable Filter Pills - FIXED */}
              <div className="overflow-x-auto">
                <div className="flex gap-2 pb-2 min-w-max">
                  <FilterPill
                    active={filter === "all"}
                    onClick={() => setFilter("all")}
                    icon="📋"
                    label="All"
                    count={getFilterCount("all")}
                  />
                  <FilterPill active={filter === "today"} onClick={() => setFilter("today")} icon="📅" label="Today" />
                  <FilterPill active={filter === "week"} onClick={() => setFilter("week")} icon="🗓️" label="Week" />
                  <FilterPill active={filter === "month"} onClick={() => setFilter("month")} icon="📆" label="Month" />
                  <FilterPill
                    active={filter === "overdue"}
                    onClick={() => setFilter("overdue")}
                    icon="⚠️"
                    label="Overdue"
                  />
                  <FilterPill
                    active={filter === "pending"}
                    onClick={() => setFilter("pending")}
                    icon="⏳"
                    label="Pending"
                  />
                  <FilterPill
                    active={filter === "completed"}
                    onClick={() => setFilter("completed")}
                    icon="✅"
                    label="Done"
                  />
                </div>
              </div>

              <TabsContent value={filter} className="mt-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-ping"></div>
                    </div>
                    <p className="text-gray-700 font-medium">Loading {filter} tasks...</p>
                  </div>
                ) : todos.length === 0 ? (
                  <EmptyState filter={filter} />
                ) : (
                  <div className="space-y-3">
                    {todos.map((todo, index) => (
                      <div
                        key={todo.id}
                        className="animate-in slide-in-from-bottom-4 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TodoItem
                          todo={todo}
                          onUpdate={handleUpdateTodo}
                          onDelete={handleDeleteTodo}
                          isLoading={false}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <div className="sm:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl border-4 border-white/20 backdrop-blur-sm"
            size="lg"
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Mobile Create Form Modal */}
        {showCreateForm && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)} className="rounded-full">
                    ✕
                  </Button>
                </div>
                <TodoForm onSubmit={handleCreateTodo} isLoading={isCreating} />
              </div>
            </div>
          </div>
        )}

        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={authLoading}
        />

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onSuccess={() => {
            setShowForgotPassword(false)
            // Optionally show a success message or redirect to login
          }}
        />
      </div>

      {/* Authentication Overlay */}
      {isAuthRequired && (
        <AuthOverlay
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={authLoading}
          isConnected={isConnected}
        />
      )}
    </div>
  )
}

// Filter Pill Component - ENHANCED
function FilterPill({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: string
  label: string
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative z-30 flex items-center gap-2 px-4 py-3 rounded-full whitespace-nowrap 
        transition-all duration-200 shadow-lg touch-manipulation cursor-pointer select-none
        ${
          active
            ? "bg-gray-900 text-white shadow-lg scale-105"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md"
        }
      `}
      style={{
        minHeight: "44px",
        zIndex: 30, // Explicit z-index to ensure it's above background
      }}
    >
      <span className="text-sm">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
      {count !== undefined && (
        <span
          className={`
          text-xs px-2 py-1 rounded-full font-medium
          ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}
        `}
        >
          {count}
        </span>
      )}
    </button>
  )
}

// Empty State Component
function EmptyState({ filter }: { filter: FilterType }) {
  const getEmptyStateContent = () => {
    switch (filter) {
      case "all":
        return { icon: "🎯", title: "No tasks yet", subtitle: "Create your first task to get started!" }
      case "today":
        return { icon: "📅", title: "No tasks for today", subtitle: "Schedule some tasks for today." }
      case "week":
        return { icon: "🗓️", title: "No tasks this week", subtitle: "Plan your week ahead." }
      case "month":
        return { icon: "📆", title: "No tasks this month", subtitle: "Set some monthly goals." }
      case "overdue":
        return { icon: "🎉", title: "All caught up!", subtitle: "No overdue tasks. Great job!" }
      case "pending":
        return { icon: "✨", title: "All done!", subtitle: "No pending tasks remaining." }
      case "completed":
        return { icon: "🏆", title: "No completed tasks", subtitle: "Complete some tasks to see them here." }
      default:
        return { icon: "📋", title: "No tasks", subtitle: "Create a task to get started." }
    }
  }

  const { icon, title, subtitle } = getEmptyStateContent()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="text-6xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center leading-relaxed">{subtitle}</p>
    </div>
  )
}
